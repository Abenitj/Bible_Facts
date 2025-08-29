import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTopicSchema, updateTopicSchema } from '@/lib/validation'
import { verifyToken, checkPermission, PERMISSIONS } from '@/lib/auth'

// GET /api/topics - Get all topics
export async function GET(request: NextRequest) {
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

    const topics = await prisma.topic.findMany({
      include: {
        religion: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            color: true
          }
        },
        details: {
          select: {
            id: true,
            version: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: topics
    })

  } catch (error) {
    console.error('Get topics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/topics - Create new topic
export async function POST(request: NextRequest) {
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

    // Check if user has permission to create topics
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.CREATE_TOPICS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate input
    const validation = createTopicSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const topicData = validation.data

    // Check if religion exists
    const religion = await prisma.religion.findUnique({
      where: { id: topicData.religionId }
    })

    if (!religion) {
      return NextResponse.json(
        { error: 'Religion not found' },
        { status: 404 }
      )
    }

    // Create topic
    const topic = await prisma.topic.create({
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
    }, { status: 201 })

  } catch (error) {
    console.error('Create topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
