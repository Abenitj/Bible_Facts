import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const email = searchParams.get('email')

    if (!username && !email) {
      return NextResponse.json({ 
        error: 'Please provide either username or email parameter' 
      }, { status: 400 })
    }

    let existingUser = null

    if (username) {
      existingUser = await prisma.user.findFirst({
        where: { username: username.trim() }
      })
    }

    if (email && !existingUser) {
      existingUser = await prisma.user.findFirst({
        where: { email: email.trim() }
      })
    }

    if (existingUser) {
      const field = username ? 'username' : 'email'
      const value = username || email
      return NextResponse.json({
        available: false,
        error: `${field === 'username' ? 'Username' : 'Email address'} "${value}" is already taken. Please choose a different ${field}.`
      })
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ 
      error: 'Validation failed' 
    }, { status: 500 })
  }
}

