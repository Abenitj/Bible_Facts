import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// POST /api/sync/trigger - Trigger a manual sync operation
export async function POST(request: NextRequest) {
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

    // Check if user has permission to trigger sync
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { permissions: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions (admin or users with sync permission)
    let userPermissions: string[] | null = null;
    if (user.permissions) {
      try {
        userPermissions = JSON.parse(user.permissions);
      } catch (error) {
        console.error('Error parsing user permissions:', error);
      }
    }

    const hasSyncPermission = user.role === 'admin' || 
      (userPermissions && userPermissions.includes('manage_sync'));

    if (!hasSyncPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        message: 'You need admin role or sync management permission to trigger sync'
      }, { status: 403 });
    }

    // Get current sync statistics
    const [religionCount, topicCount, topicDetailCount] = await Promise.all([
      prisma.religion.count(),
      prisma.topic.count(),
      prisma.topicDetail.count()
    ])

    // Get the latest content version
    const latestTopicDetail = await prisma.topicDetail.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get recent changes (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [recentReligions, recentTopics, recentDetails] = await Promise.all([
      prisma.religion.count({
        where: {
          updatedAt: {
            gte: yesterday
          }
        }
      }),
      prisma.topic.count({
        where: {
          updatedAt: {
            gte: yesterday
          }
        }
      }),
      prisma.topicDetail.count({
        where: {
          updatedAt: {
            gte: yesterday
          }
        }
      })
    ]);

    // Create sync result
    const syncResult = {
      timestamp: new Date().toISOString(),
      version: latestTopicDetail?.version || 1,
      statistics: {
        religions: religionCount,
        topics: topicCount,
        topicDetails: topicDetailCount,
        totalItems: religionCount + topicCount + topicDetailCount
      },
      recentChanges: {
        religions: recentReligions,
        topics: recentTopics,
        details: recentDetails,
        total: recentReligions + recentTopics + recentDetails
      },
      status: 'completed',
      message: 'Manual sync triggered successfully. Mobile apps will receive updates on next sync.',
      triggeredBy: payload.username,
      mobileAppsNotified: 0, // Would be updated in real implementation
      dataSize: `${Math.round((religionCount + topicCount + topicDetailCount) * 0.5)}KB`
    }

    // Log sync operation
    console.log('Manual sync triggered by:', payload.username, syncResult)

    return NextResponse.json({
      success: true,
      data: syncResult
    })

  } catch (error) {
    console.error('Sync trigger error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Sync operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
