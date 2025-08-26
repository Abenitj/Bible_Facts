import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all content data
    const [religions, topics, topicDetails] = await Promise.all([
      prisma.religion.findMany({
        orderBy: { createdAt: 'asc' }
      }),
      prisma.topic.findMany({
        include: {
          religion: {
            select: {
              id: true,
              name: true,
              nameEn: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.topicDetail.findMany({
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              titleEn: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    ])
    
    // Get the latest version
    const latestTopicDetail = await prisma.topicDetail.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    const currentVersion = latestTopicDetail?.version || 1
    const lastUpdated = latestTopicDetail?.updatedAt || new Date()
    
    // Format data for mobile app
    const formattedReligions = religions.map(religion => ({
      id: religion.id,
      name: religion.name,
      nameEn: religion.nameEn,
      description: religion.description,
      color: religion.color,
      createdAt: religion.createdAt.toISOString(),
      updatedAt: religion.updatedAt.toISOString()
    }))
    
    const formattedTopics = topics.map(topic => ({
      id: topic.id,
      religionId: topic.religionId,
      title: topic.title,
      titleEn: topic.titleEn,
      description: topic.description,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString()
    }))
    
    const formattedTopicDetails = topicDetails.map(detail => ({
      id: detail.id,
      topicId: detail.topicId,
      explanation: detail.explanation,
      bibleVerses: detail.bibleVerses,
      keyPoints: detail.keyPoints,
      references: detail.references,
      version: detail.version,
      createdAt: detail.createdAt.toISOString(),
      updatedAt: detail.updatedAt.toISOString()
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        version: currentVersion,
        lastUpdated: lastUpdated.toISOString(),
        religions: formattedReligions,
        topics: formattedTopics,
        topicDetails: formattedTopicDetails
      }
    })
    
  } catch (error) {
    console.error('Sync download error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to download content' },
      { status: 500 }
    )
  }
}

