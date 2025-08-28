import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { username, password } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    })
    
    console.log('Generated token for user:', {
      userId: user.id,
      username: user.username,
      role: user.role
    })

    // Log login activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: 'login',
        resource: 'auth',
        details: JSON.stringify({ loginMethod: 'username_password' }),
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
