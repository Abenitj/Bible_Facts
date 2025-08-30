import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

// Dynamic import for bcrypt to avoid issues
let bcrypt: any = null
try {
  bcrypt = require('bcryptjs')
} catch (error) {
  console.error('Error importing bcrypt:', error)
}

const prisma = new PrismaClient()

// Helper function to encrypt SMTP password
const encryptPassword = async (password: string): Promise<string> => {
  // For SMTP passwords, we need reversible encryption or plain text
  // For now, storing as plain text since bcrypt is one-way
  return password
}

// Helper function to decrypt SMTP password (for comparison only)
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// GET - Fetch all SMTP configurations
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const configs = await prisma.smtpConfig.findMany({
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        fromEmail: true,
        fromName: true,
        isActive: true,
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: configs
    })
  } catch (error) {
    console.error('Error fetching SMTP configurations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new SMTP configuration
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      host,
      port,
      secure,
      username,
      password,
      fromEmail,
      fromName
    } = body

    // Validation
    if (!name || !host || !port || !username || !password || !fromEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const existingConfig = await prisma.smtpConfig.findFirst({
      where: { name }
    })

    if (existingConfig) {
      return NextResponse.json(
        { error: 'SMTP configuration with this name already exists' },
        { status: 400 }
      )
    }

    // Encrypt password
    const encryptedPassword = await encryptPassword(password)

    // Create SMTP configuration
    const newConfig = await prisma.smtpConfig.create({
      data: {
        name,
        host,
        port: parseInt(port),
        secure: Boolean(secure),
        username,
        password: encryptedPassword,
        fromEmail,
        fromName,
        createdBy: decoded.userId
      },
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        fromEmail: true,
        fromName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: newConfig,
      message: 'SMTP configuration created successfully'
    })
  } catch (error) {
    console.error('Error creating SMTP configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
