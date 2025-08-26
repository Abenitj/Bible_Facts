import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sync/download - Download all content for mobile app
export async function GET() {
  try {
    // Get all data with relationships
    const religions = await prisma.religion.findMany({
      include: {
        topics: {
          include: {
            details: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform data for mobile app
    const mobileData = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      religions: religions.map(religion => ({
        id: religion.id,
        name: religion.name,
        nameEn: religion.nameEn,
        description: religion.description,
        color: religion.color,
        createdAt: religion.createdAt,
        updatedAt: religion.updatedAt
      })),
      topics: religions.flatMap(religion => 
        religion.topics.map(topic => ({
          id: topic.id,
          religionId: topic.religionId,
          title: topic.title,
          titleEn: topic.titleEn,
          description: topic.description,
          createdAt: topic.createdAt,
          updatedAt: topic.updatedAt
        }))
      ),
      topicDetails: religions.flatMap(religion => 
        religion.topics.flatMap(topic => 
          topic.details ? [{
            id: topic.details.id,
            topicId: topic.details.topicId,
            explanation: topic.details.explanation,
            bibleVerses: topic.details.bibleVerses ? JSON.parse(topic.details.bibleVerses) : [],
            keyPoints: topic.details.keyPoints ? JSON.parse(topic.details.keyPoints) : [],
            references: topic.details.references ? JSON.parse(topic.details.references) : [],
            version: topic.details.version,
            createdAt: topic.details.createdAt,
            updatedAt: topic.details.updatedAt
          }] : []
        )
      )
    }

    return NextResponse.json({
      success: true,
      data: mobileData
    })

  } catch (error) {
    console.error('Sync download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
