import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createReligionSchema, updateReligionSchema } from '@/lib/validation'
import { verifyToken, checkPermission, PERMISSIONS } from '@/lib/auth'

// GET /api/religions - Get all religions
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

    // Check if user has permission to view religions
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.VIEW_RELIGIONS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const religions = await prisma.religion.findMany({
      include: {
        topics: {
          select: {
            id: true,
            title: true,
            titleEn: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: religions
    })

  } catch (error) {
    console.error('Get religions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/religions - Create new religion
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

    // Check if user has permission to create religions
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.CREATE_RELIGIONS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate input
    const validation = createReligionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const religionData = validation.data

    // Check if religion with same name already exists
    const existingReligion = await prisma.religion.findFirst({
      where: { name: religionData.name }
    })

    if (existingReligion) {
      return NextResponse.json(
        { error: 'Religion with this name already exists' },
        { status: 409 }
      )
    }

    // Create religion
    const religion = await prisma.religion.create({
      data: religionData
    })

    return NextResponse.json({
      success: true,
      data: religion
    }, { status: 201 })

  } catch (error) {
    console.error('Create religion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
