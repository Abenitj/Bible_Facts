import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// Helper function to encrypt SMTP password
const encryptPassword = async (password: string): Promise<string> => {
  // For SMTP passwords, we need reversible encryption or plain text
  // For now, storing as plain text since bcrypt is one-way
  return password
}

// GET - Fetch specific SMTP configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const configId = parseInt(await params.id)
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid configuration ID' }, { status: 400 })
    }

    const config = await prisma.smtpConfig.findUnique({
      where: { id: configId },
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

    if (!config) {
      return NextResponse.json({ error: 'SMTP configuration not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error fetching SMTP configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update SMTP configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const configId = parseInt(await params.id)
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid configuration ID' }, { status: 400 })
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
      fromName,
      isActive
    } = body

    // Check if configuration exists
    const existingConfig = await prisma.smtpConfig.findUnique({
      where: { id: configId }
    })

    if (!existingConfig) {
      return NextResponse.json({ error: 'SMTP configuration not found' }, { status: 404 })
    }

    // Check if name already exists (excluding current config)
    if (name && name !== existingConfig.name) {
      const nameExists = await prisma.smtpConfig.findFirst({
        where: {
          name,
          id: { not: configId }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'SMTP configuration with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name || existingConfig.name,
      host: host || existingConfig.host,
      port: port ? parseInt(port) : existingConfig.port,
      secure: secure !== undefined ? Boolean(secure) : existingConfig.secure,
      username: username || existingConfig.username,
      fromEmail: fromEmail || existingConfig.fromEmail,
      fromName: fromName !== undefined ? fromName : existingConfig.fromName,
      isActive: isActive !== undefined ? Boolean(isActive) : existingConfig.isActive
    }

    // Only update password if provided
    if (password) {
      updateData.password = await encryptPassword(password)
    }

    // Update SMTP configuration
    const updatedConfig = await prisma.smtpConfig.update({
      where: { id: configId },
      data: updateData,
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
      data: updatedConfig,
      message: 'SMTP configuration updated successfully'
    })
  } catch (error) {
    console.error('Error updating SMTP configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete SMTP configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const configId = parseInt(await params.id)
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid configuration ID' }, { status: 400 })
    }

    // Check if configuration exists
    const existingConfig = await prisma.smtpConfig.findUnique({
      where: { id: configId }
    })

    if (!existingConfig) {
      return NextResponse.json({ error: 'SMTP configuration not found' }, { status: 404 })
    }

    // Delete SMTP configuration
    await prisma.smtpConfig.delete({
      where: { id: configId }
    })

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting SMTP configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
