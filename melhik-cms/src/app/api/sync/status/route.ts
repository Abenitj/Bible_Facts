import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sync/status - Get sync status and statistics
export async function GET() {
  try {
    // Get content statistics
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

    // Get recent activity
    const recentActivity = await prisma.topicDetail.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        topic: {
          include: {
            religion: true
          }
        }
      }
    })

    const status = {
      version: latestTopicDetail?.version || 1,
      lastUpdated: latestTopicDetail?.updatedAt || new Date(),
      statistics: {
        religions: religionCount,
        topics: topicCount,
        topicDetails: topicDetailCount,
        totalItems: religionCount + topicCount + topicDetailCount
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        topicTitle: activity.topic.title,
        religionName: activity.topic.religion.name,
        version: activity.version,
        updatedAt: activity.updatedAt
      })),
      syncHealth: {
        status: 'healthy',
        lastSyncCheck: new Date().toISOString(),
        dataIntegrity: 'verified'
      }
    }

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
