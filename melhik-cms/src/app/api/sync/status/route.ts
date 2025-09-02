import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sync/status - Get sync status and content counts
export async function GET() {
  try {
    const [religionCount, topicCount, topicDetailCount] = await Promise.all([
      prisma.religion.count(),
      prisma.topic.count(),
      prisma.topicDetail.count()
    ])

    const latestUpdate = await prisma.religion.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    const latestTopicUpdate = await prisma.topic.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    const latestDetailUpdate = await prisma.topicDetail.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    // Get the most recent update across all content types
    const allUpdates = [
      latestUpdate?.updatedAt,
      latestTopicUpdate?.updatedAt,
      latestDetailUpdate?.updatedAt
    ].filter(Boolean)

    const lastUpdated = allUpdates.length > 0 
      ? new Date(Math.max(...allUpdates.map(date => new Date(date).getTime())))
      : new Date()

    return NextResponse.json({
      success: true,
      data: {
        religionCount,
        topicCount,
        topicDetailCount,
        lastUpdated: lastUpdated.toISOString(),
        serverTime: new Date().toISOString(),
        contentSummary: {
          religions: religionCount,
          topics: topicCount,
          topicDetails: topicDetailCount,
          total: religionCount + topicCount + topicDetailCount
        },
        syncInfo: {
          serverVersion: '1.0.0',
          apiVersion: '1.0.0',
          supportedFeatures: ['incremental_sync', 'content_versions', 'bible_verses']
        }
      }
    })
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get sync status',
        message: 'Could not retrieve content information',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
