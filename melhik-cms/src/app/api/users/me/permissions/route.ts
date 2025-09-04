import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { ROLE_PERMISSIONS, ROLES } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/users/me/permissions - Get current user permissions
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { status: true }
    });

    if (!user || user.status !== 'active') {
      return NextResponse.json({ 
        error: 'Account inactive', 
        message: 'Your account has been deactivated. Please contact an administrator.',
        status: 'inactive'
      }, { status: 403 });
    }

    // Get user's role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[payload.role as keyof typeof ROLE_PERMISSIONS] || [];
    
    // Map permissions to the format expected by the frontend
    const permissions = {
      canManageUsers: rolePermissions.includes('view_users') || rolePermissions.includes('create_users'),
      canManageContent: rolePermissions.includes('create_religions') || rolePermissions.includes('create_topics'),
      canManageSystem: rolePermissions.includes('view_system_settings') || rolePermissions.includes('manage_system_settings'),
      canViewAnalytics: rolePermissions.includes('view_dashboard'),
      canTriggerSync: rolePermissions.includes('view_sync') || rolePermissions.includes('manage_sync'),
      role: payload.role,
      permissions: rolePermissions
    };

    return NextResponse.json({
      success: true,
      data: permissions
    });

  } catch (error) {
    console.error('Permissions error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get permissions',
        message: 'Could not retrieve user permissions',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
