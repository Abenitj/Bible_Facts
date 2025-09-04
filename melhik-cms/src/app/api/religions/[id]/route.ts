import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateReligionSchema } from '@/lib/validation'
import { verifyToken, checkPermission, PERMISSIONS } from '@/lib/auth'

// GET /api/religions/[id] - Get specific religion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get current user's permissions
    const currentUser = await prisma.$queryRaw`SELECT permissions FROM users WHERE id = ${payload.userId}`
    const userData = Array.isArray(currentUser) ? currentUser[0] : currentUser
    let userPermissions: string[] | null = null
    
    if (userData && userData.permissions) {
      try {
        userPermissions = JSON.parse(userData.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = null
      }
    }

    // Check if user has permission to view religions
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.VIEW_RELIGIONS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid religion ID' },
        { status: 400 }
      )
    }

    const religion = await prisma.religion.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            details: true
          }
        }
      }
    })

    if (!religion) {
      return NextResponse.json(
        { error: 'Religion not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: religion
    })

  } catch (error) {
    console.error('Get religion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/religions/[id] - Update religion
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get current user's permissions
    const currentUser = await prisma.$queryRaw`SELECT permissions FROM users WHERE id = ${payload.userId}`
    const userData = Array.isArray(currentUser) ? currentUser[0] : currentUser
    let userPermissions: string[] | null = null
    
    if (userData && userData.permissions) {
      try {
        userPermissions = JSON.parse(userData.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = null
      }
    }

    // Check if user has permission to edit religions
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.EDIT_RELIGIONS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid religion ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = updateReligionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const religionData = validation.data

    // Check if religion exists
    const existingReligion = await prisma.religion.findUnique({
      where: { id }
    })

    if (!existingReligion) {
      return NextResponse.json(
        { error: 'Religion not found' },
        { status: 404 }
      )
    }

    // Update religion
    const religion = await prisma.religion.update({
      where: { id },
      data: religionData
    })

    return NextResponse.json({
      success: true,
      data: religion
    })

  } catch (error) {
    console.error('Update religion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/religions/[id] - Delete religion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid religion ID' },
        { status: 400 }
      )
    }

    // Check if religion exists
    const existingReligion = await prisma.religion.findUnique({
      where: { id },
      include: {
        topics: true
      }
    })

    if (!existingReligion) {
      return NextResponse.json(
        { error: 'Religion not found' },
        { status: 404 }
      )
    }

    // Check if religion has topics
    if (existingReligion.topics.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete religion with existing topics' },
        { status: 400 }
      )
    }

    // Delete religion
    await prisma.religion.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Religion deleted successfully'
    })

  } catch (error) {
    console.error('Delete religion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
