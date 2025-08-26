import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncCheckSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = syncCheckSchema.parse(body)
    
    // Get the latest content version
    const latestTopicDetail = await prisma.topicDetail.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    const currentVersion = latestTopicDetail?.version || 1
    const lastUpdated = latestTopicDetail?.updatedAt || new Date()
    
    // Check if there are updates
    const hasUpdates = currentVersion > validatedData.localVersion
    
    // Get content statistics
    const [religionCount, topicCount, topicDetailCount] = await Promise.all([
      prisma.religion.count(),
      prisma.topic.count(),
      prisma.topicDetail.count()
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        hasUpdates,
        currentVersion,
        lastUpdated: lastUpdated.toISOString(),
        updateSize: `${(religionCount + topicCount + topicDetailCount) * 0.5}KB`,
        statistics: {
          religions: religionCount,
          topics: topicCount,
          topicDetails: topicDetailCount
        }
      }
    })
    
  } catch (error) {
    console.error('Sync check error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to check for updates' },
      { status: 500 }
    )
  }
}

