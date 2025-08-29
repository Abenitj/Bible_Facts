import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, hasPermission, PERMISSIONS } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user has permission to view users
    if (!hasPermission(payload.role as any, PERMISSIONS.VIEW_USERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        _count: {
          select: {
            activities: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get creator username if exists
    let createdByUsername = null
    if (user.createdBy) {
      const creator = await prisma.user.findUnique({
        where: { id: user.createdBy },
        select: { username: true }
      })
      createdByUsername = creator?.username
    }

    return NextResponse.json({
      ...user,
      createdByUsername
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user has permission to edit users
    if (!hasPermission(payload.role as any, PERMISSIONS.EDIT_USERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const body = await request.json()
    const { username, email, role, status } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Additional check: only admin can edit admin users
    if (existingUser.role === 'admin' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can edit admin users' }, { status: 403 })
    }

    // Check if username already exists (if changing)
    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } }
      })

      if (usernameExists) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
      }
    }

    // Check if email already exists (if changing)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } }
      })

      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status })
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: payload.userId,
        action: 'update_user',
        details: `Updated user: ${updatedUser.username}`,
        ipAddress: 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user has permission to delete users
    if (!hasPermission(payload.role as any, PERMISSIONS.DELETE_USERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === payload.userId) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Additional check: only admin can deactivate admin users
    if (existingUser.role === 'admin' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can deactivate admin users' }, { status: 403 })
    }

    // Soft delete - update status to inactive
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'inactive' },
      select: {
        id: true,
        username: true,
        role: true,
        status: true
      }
    })

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: payload.userId,
        action: 'deactivate_user',
        details: `Deactivated user: ${updatedUser.username}`,
        ipAddress: 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      message: 'User deactivated successfully', 
      user: updatedUser 
    })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
