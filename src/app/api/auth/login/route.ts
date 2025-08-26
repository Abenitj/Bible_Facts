import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = loginSchema.parse(body)
    
    // Authenticate user
    const user = await authenticateUser(validatedData.username, validatedData.password)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    })
    
    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      },
      { status: 200 }
    )
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })
    
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

