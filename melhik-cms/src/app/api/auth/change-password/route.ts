import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword, comparePassword } from '@/lib/auth'

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

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate input
    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For first-time password change, skip current password verification
    if (currentPassword) {
      // Verify current password if provided
      const isValidCurrentPassword = await comparePassword(currentPassword, user.password)
      if (!isValidCurrentPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      // Check if new password is different from current
      const isSamePassword = await comparePassword(newPassword, user.password)
      if (isSamePassword) {
        return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 })
      }
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password and clear password change requirement
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        requiresPasswordChange: false
      }
    })

    // Log password change activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: 'change_password',
        resource: 'auth',
        details: JSON.stringify({ method: 'user_requested' }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

