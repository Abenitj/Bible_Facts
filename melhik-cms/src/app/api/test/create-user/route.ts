import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateTemporaryPassword } from '@/lib/email'
import { sendWelcomeEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, role = 'content_manager', sendWelcomeEmail: shouldSendEmail = true } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Get a real email address from existing users for testing
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          not: null,
          contains: '@gmail.com' // Prefer Gmail addresses for testing
        }
      },
      select: { email: true }
    })

    if (!existingUser?.email) {
      return NextResponse.json({ 
        error: 'No real email addresses found in database for testing' 
      }, { status: 400 })
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findFirst({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json({ 
        error: `Username "${username}" is already taken. Please choose a different username.` 
      }, { status: 400 })
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

    // Create user with real email
    const newUser = await prisma.user.create({
      data: {
        username,
        email: existingUser.email,
        password: hashedPassword,
        role,
        status: 'active',
        permissions: null,
        isFirstLogin: true,
        requiresPasswordChange: true,
        createdBy: 1 // Admin user
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        isFirstLogin: true,
        requiresPasswordChange: true,
        createdAt: true
      }
    })

    // Send welcome email if requested
    let emailSent = false
    if (shouldSendEmail) {
      try {
        const baseUrl =
          request.headers.get('origin') ||
          process.env.APP_BASE_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          `http://localhost:${process.env.PORT || '3000'}`
        const loginUrl = `${baseUrl}/login`
        
        emailSent = await sendWelcomeEmail({
          username,
          email: existingUser.email,
          temporaryPassword,
          loginUrl,
          adminName: 'Admin'
        })
      } catch (error) {
        console.error('Error sending welcome email:', error)
      }
    }

    return NextResponse.json({ 
      message: 'Test user created successfully with real email', 
      user: newUser,
      emailSent,
      temporaryPassword,
      note: `Email sent to: ${existingUser.email}`
    })
  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

