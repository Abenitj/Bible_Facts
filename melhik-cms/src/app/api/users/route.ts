import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, checkPermission, PERMISSIONS } from '@/lib/auth'
import { generateTemporaryPassword, sendWelcomeEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get current user's permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { permissions: true }
    })
    
    let userPermissions: string[] | null = null
    if (currentUser?.permissions) {
      try {
        userPermissions = JSON.parse(currentUser.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = null
      }
    }

    // Check if user has permission to view users
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.VIEW_USERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (role) {
      where.role = role
    }
    if (status) {
      where.status = status
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          permissions: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true,
          createdBy: true,
          _count: {
            select: {
              activities: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    // Get creator usernames
    const creatorIds = [...new Set(users.map(user => user.createdBy).filter(Boolean))]
    const creators = creatorIds.length > 0 
      ? await prisma.user.findMany({
          where: { id: { in: creatorIds as number[] } },
          select: { id: true, username: true }
        })
      : []

    const creatorMap = new Map(creators.map(c => [c.id, c.username]))

    const usersWithCreators = users.map(user => ({
      ...user,
      createdByUsername: user.createdBy ? creatorMap.get(user.createdBy) : null
    }))

    return NextResponse.json({
      users: usersWithCreators,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get current user's permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { permissions: true }
    })
    
    let userPermissions: string[] | null = null
    if (currentUser?.permissions) {
      try {
        userPermissions = JSON.parse(currentUser.permissions)
      } catch (error) {
        console.error('Error parsing user permissions:', error)
        userPermissions = null
      }
    }

    // Check if user has permission to create users
    if (!checkPermission(payload.role as any, userPermissions, PERMISSIONS.CREATE_USERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { username, firstName, lastName, email, password, role, status, permissions, sendWelcomeEmail: shouldSendEmail } = body

    // Validate required fields
    if (!username || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Always generate a random password for new users
    const finalPassword = generateTemporaryPassword()

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: `Username "${username}" is already taken. Please choose a different username.` 
      }, { status: 400 })
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email }
      })

      if (existingEmail) {
        return NextResponse.json({ 
          error: `Email address "${email}" is already registered. Please use a different email address.` 
        }, { status: 400 })
      }
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(finalPassword, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        status: status || 'active',
        permissions: permissions ? JSON.stringify(permissions) : null,
        isFirstLogin: true,
        requiresPasswordChange: true, // Always require password change for new users
        createdBy: payload.userId
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        isFirstLogin: true,
        requiresPasswordChange: true,
        createdAt: true
      }
    })

    // Always send welcome email with random password if email is provided
    let emailSent = false
    if (email) {
      try {
        // Get admin name for the email
        const admin = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { username: true }
        })

        const baseUrl =
          request.headers.get('origin') ||
          process.env.APP_BASE_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          `http://localhost:${process.env.PORT || '3000'}`
        const loginUrl = `${baseUrl}/login`
        
        emailSent = await sendWelcomeEmail({
          username,
          email,
          temporaryPassword: finalPassword,
          loginUrl,
          adminName: admin?.username
        })
      } catch (error) {
        console.error('Error sending welcome email:', error)
        // Don't fail the user creation if email fails
      }
    }

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: payload.userId,
        action: 'create_user',
        details: `Created user: ${username}${emailSent ? ' (welcome email sent)' : ''}`,
        ipAddress: 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      message: 'User created successfully', 
      user: newUser,
      emailSent,
      temporaryPassword: finalPassword
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
