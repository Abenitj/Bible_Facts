import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader, hashPassword } from '@/lib/auth'
import { resetPasswordSchema } from '@/lib/validation'

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

// POST /api/users/[id]/reset-password - Reset user password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permissions - only admin and content_manager can reset passwords
    if (!hasPermission(payload.role, 'content_manager')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent non-admins from resetting admin passwords
    if (existingUser.role === 'admin' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can reset admin passwords' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()

    // Validate input
    const validation = resetPasswordSchema.safeParse({
      userId,
      newPassword: body.newPassword
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { newPassword } = validation.data

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true
      }
    })

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: payload.userId,
        action: 'reset_password',
        resource: 'user',
        resourceId: userId,
        details: JSON.stringify({ 
          resetUser: updatedUser.username,
          resetBy: payload.username
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        message: 'Password reset successfully'
      }
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
