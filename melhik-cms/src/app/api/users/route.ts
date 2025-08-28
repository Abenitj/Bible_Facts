import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { createUserSchema } from '@/lib/validation'
import { hashPassword } from '@/lib/auth'

// Helper function to check if user has permission
function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'admin': 2,
    'content_manager': 1
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}

// GET /api/users - List users
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    console.log('Token payload:', payload)
    console.log('User role:', payload.role)
    console.log('Checking permission for content_manager')
    
    // Check permissions - only admin and content_manager can view users
    if (!hasPermission(payload.role, 'content_manager')) {
      console.log('Permission denied for role:', payload.role)
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    console.log('Permission granted for role:', payload.role)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (status) {
      where.status = status
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions - only admin and content_manager can create users
    if (!hasPermission(payload.role, 'content_manager')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Additional check: only admin can create admin users
    const body = await request.json()
    if (body.role === 'admin' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create admin users' }, { status: 403 })
    }

    // Validate input
    const validation = createUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { username, email, password, role, status } = validation.data

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : [])
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        status,
        createdBy: payload.userId
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: payload.userId,
        action: 'create_user',
        resource: 'user',
        resourceId: newUser.id,
        details: JSON.stringify({ createdUser: newUser.username, role: newUser.role }),
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      }
    })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
