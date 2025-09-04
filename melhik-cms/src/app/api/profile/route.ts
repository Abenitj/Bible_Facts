import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken, hashPassword, comparePassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, firstName: true, lastName: true, email: true, role: true, status: true, avatarUrl: true }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({ 
        error: 'Account inactive', 
        message: 'Your account has been deactivated. Please contact an administrator.',
        status: 'inactive'
      }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization') || undefined)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const contentType = request.headers.get('content-type') || ''
    
    let username: string | undefined
    let firstName: string | undefined
    let lastName: string | undefined
    let email: string | null | undefined
    let currentPassword: string | undefined
    let newPassword: string | undefined
    let avatarBuffer: Buffer | undefined
    let avatarFileName: string | undefined
    let removeAvatar: boolean = false

    if (contentType.includes('application/json')) {
      const body = await request.json()
      username = body.username
      firstName = body.firstName
      lastName = body.lastName
      email = body.email
      currentPassword = body.currentPassword
      newPassword = body.newPassword
    } else if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      
      username = (form.get('username') as string) || undefined
      firstName = (form.get('firstName') as string) || undefined
      lastName = (form.get('lastName') as string) || undefined
      email = (form.get('email') as string) || undefined
      currentPassword = (form.get('currentPassword') as string) || undefined
      newPassword = (form.get('newPassword') as string) || undefined
      removeAvatar = ((form.get('removeAvatar') as string) || 'false') === 'true'
      
      const file = form.get('avatar') as File | null
      
      if (file) {
        const arrayBuffer = await file.arrayBuffer()
        avatarBuffer = Buffer.from(arrayBuffer)
        const originalName = (file as any).name || 'avatar.png'
        const ext = originalName.split('.').pop() || 'png'
        avatarFileName = `avatar_${payload.userId}_${Date.now()}.${ext}`
      }
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
    }

    const updates: any = {}
    if (username) updates.username = username
    if (firstName !== undefined) updates.firstName = firstName
    if (lastName !== undefined) updates.lastName = lastName
    if (typeof email !== 'undefined') updates.email = email

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
      }
      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      const ok = await comparePassword(currentPassword, user.password)
      if (!ok) return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 })
      updates.password = await hashPassword(newPassword)
      updates.requiresPasswordChange = false
    }

    // Save avatar file if provided
    if (avatarBuffer && avatarFileName) {
      // Save into public/uploads
      const uploadDir = `${process.cwd()}/public/uploads`
      const fs = await import('fs')
      const path = await import('path')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      const finalPath = path.join(uploadDir, avatarFileName)
      await fs.promises.writeFile(finalPath, avatarBuffer)
      updates.avatarUrl = `/uploads/${avatarFileName}`
    } else if (removeAvatar) {
      updates.avatarUrl = null
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: updates,
      select: { id: true, username: true, firstName: true, lastName: true, email: true, role: true, status: true, avatarUrl: true }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


