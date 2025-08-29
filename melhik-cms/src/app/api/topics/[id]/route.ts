import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTopicSchema } from '@/lib/validation'
import { verifyToken, checkPermission, PERMISSIONS } from '@/lib/auth'

// GET /api/topics/[id] - Get specific topic
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
    let userPermissions: string[] = []
    
    if (userData && userData.permissions) {
      try {
        userPermissions = JSON.parse(userData.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = []
      }
    }

    // Check if user has permission to view topics
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.VIEW_TOPICS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      )
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        religion: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            color: true
          }
        },
        details: true
      }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: topic
    })

  } catch (error) {
    console.error('Get topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/topics/[id] - Update topic
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
    let userPermissions: string[] = []
    
    if (userData && userData.permissions) {
      try {
        userPermissions = JSON.parse(userData.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = []
      }
    }

    // Check if user has permission to edit topics
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.EDIT_TOPICS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = updateTopicSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const topicData = validation.data

    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id }
    })

    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Update topic
    const topic = await prisma.topic.update({
      where: { id },
      data: topicData,
      include: {
        religion: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: topic
    })

  } catch (error) {
    console.error('Update topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/topics/[id] - Delete topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      )
    }

    // Check if topic exists and has details
    const existingTopic = await prisma.topic.findUnique({
      where: { id },
      include: {
        details: true
      }
    })

    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Check if topic has details
    if (existingTopic.details) {
      return NextResponse.json(
        { error: 'Cannot delete topic with existing content. Delete the content first.' },
        { status: 400 }
      )
    }

    // Delete topic
    await prisma.topic.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    })

  } catch (error) {
    console.error('Delete topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
