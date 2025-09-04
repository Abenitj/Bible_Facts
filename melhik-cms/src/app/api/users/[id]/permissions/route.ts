import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader, hasPermission, checkPermission, PERMISSIONS } from '@/lib/auth'

// PUT /api/users/[id]/permissions - Update user permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = getTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get current user's permissions
    const currentUser = await prisma.$queryRaw`SELECT permissions FROM users WHERE id = ${payload.userId}`
    const currentUserData = Array.isArray(currentUser) ? currentUser[0] : currentUser
    let userPermissions: string[] | null = null
    
    if (currentUserData && currentUserData.permissions) {
      try {
        userPermissions = JSON.parse(currentUserData.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = null
      }
    }

    // Check permissions - only admins can manage permissions
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.EDIT_USERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent non-admins from modifying admin permissions
    if (existingUser.role === 'admin' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can modify admin permissions' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { permissions } = body

    console.log('API: Received permissions update request for user', userId)
    console.log('API: Received permissions:', permissions)
    console.log('API: Permissions type:', typeof permissions)
    console.log('API: Permissions length:', permissions.length)

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Permissions must be an array' }, { status: 400 })
    }

    // Validate permissions
    const validPermissions = Object.values(PERMISSIONS)
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p))
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid permissions', 
        details: `Invalid permissions: ${invalidPermissions.join(', ')}` 
      }, { status: 400 })
    }

    // Update user permissions using raw SQL to avoid Prisma client issues
    const permissionsJson = JSON.stringify(permissions)
    console.log('API: Saving permissions JSON:', permissionsJson)
    
    // Use parameterized query to avoid SQL injection and ensure proper escaping
    await prisma.$executeRaw`UPDATE users SET permissions = ${permissionsJson} WHERE id = ${userId}`
    console.log('API: SQL update completed')
    
    // Verify the update by fetching the user again
    const verifyUser = await prisma.$queryRaw`SELECT permissions FROM users WHERE id = ${userId}`
    const verifyData = Array.isArray(verifyUser) ? verifyUser[0] : verifyUser
    console.log('API: Verification - permissions in database after update:', verifyData.permissions)
    
    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true
      }
    })

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: payload.userId,
        action: 'update_permissions',
        resource: 'user',
        resourceId: userId,
        details: JSON.stringify({ 
          updatedUser: updatedUser.username,
          updatedBy: payload.username,
          permissions: permissions
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        permissions: permissions,
        message: 'User permissions updated successfully'
      }
    })

  } catch (error) {
    console.error('Error updating user permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/users/[id]/permissions - Get user permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = getTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get current user's permissions
    const currentUser = await prisma.$queryRaw`SELECT permissions FROM users WHERE id = ${payload.userId}`
    const currentUserData = Array.isArray(currentUser) ? currentUser[0] : currentUser
    let userPermissions: string[] | null = null
    
    if (currentUserData && currentUserData.permissions) {
      try {
        userPermissions = JSON.parse(currentUserData.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = null
      }
    }

    // Check permissions - only admins can view permissions
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.VIEW_USERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Get user with permissions using raw SQL to avoid Prisma client issues
    const targetUser = await prisma.$queryRaw`SELECT id, username, email, role, status, permissions FROM users WHERE id = ${userId}`
    const targetUserData = Array.isArray(targetUser) ? targetUser[0] : targetUser
    
    console.log('API: Retrieved target user data from database:', targetUserData)

    if (!targetUserData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse permissions from JSON string
    let permissions: string[] | null = null
    console.log('API: Raw permissions from database:', targetUserData.permissions)
    
    if (targetUserData.permissions) {
      try {
        permissions = JSON.parse(targetUserData.permissions)
        console.log('API: Parsed permissions:', permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        permissions = null
      }
    } else {
      console.log('API: No permissions found in database')
    }

    return NextResponse.json({
      success: true,
      data: {
        id: targetUserData.id,
        username: targetUserData.username,
        role: targetUserData.role,
        permissions: permissions
      }
    })

  } catch (error) {
    console.error('Error getting user permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
