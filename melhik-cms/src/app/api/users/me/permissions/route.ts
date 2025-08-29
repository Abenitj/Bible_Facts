import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

// GET /api/users/me/permissions - Get current user's permissions
export async function GET(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader || undefined)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get current user with permissions
    const currentUser = await prisma.$queryRaw`SELECT permissions FROM users WHERE id = ${payload.userId}`
    const currentUserData = Array.isArray(currentUser) ? currentUser[0] : currentUser

    if (!currentUserData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse permissions
    let permissions: string[] = []
    if (currentUserData.permissions) {
      try {
        permissions = JSON.parse(currentUserData.permissions)
      } catch (error) {
        console.error('Error parsing permissions:', error)
        permissions = []
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        permissions: permissions
      }
    })

  } catch (error) {
    console.error('Error getting current user permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
