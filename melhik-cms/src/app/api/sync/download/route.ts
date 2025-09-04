import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sync/download - Download all content for mobile app
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lastSync = searchParams.get('lastSync') || '0'
    const appVersion = searchParams.get('version') || '1.0.0'

    console.log(`Sync request: lastSync=${lastSync}, appVersion=${appVersion}`)

    // Get only new/updated data since last sync that has been synced
    const religions = await prisma.religion.findMany({
      where: {
        updatedAt: { gt: new Date(parseInt(lastSync)) },
        syncStatus: 'synced' // Only get synced content
      },
      include: {
        topics: {
          where: {
            updatedAt: { gt: new Date(parseInt(lastSync)) },
            syncStatus: 'synced' // Only get synced topics
          },
          include: {
            details: {
              where: {
                updatedAt: { gt: new Date(parseInt(lastSync)) },
                syncStatus: 'synced' // Only get synced details
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // If no lastSync or first time, get all synced data
    if (lastSync === '0') {
      const allReligions = await prisma.religion.findMany({
        where: {
          syncStatus: 'synced' // Only get synced content
        },
        include: {
          topics: {
            where: {
              syncStatus: 'synced' // Only get synced topics
            },
            include: {
              details: {
                where: {
                  syncStatus: 'synced' // Only get synced details
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      
      const mobileData = {
        version: Date.now(), // Use timestamp as version
        lastUpdated: new Date().toISOString(),
        syncType: 'full',
        religions: allReligions.map(religion => ({
          id: religion.id,
          name: religion.name,
          nameEn: religion.nameEn,
          description: religion.description,
          color: religion.color,
          icon: religion.icon,
          createdAt: religion.createdAt,
          updatedAt: religion.updatedAt
        })),
        topics: allReligions.flatMap(religion => 
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
        topicDetails: allReligions.flatMap(religion => 
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
        data: mobileData,
        syncTimestamp: Date.now(),
        message: 'Full sync completed'
      })
    }

    // Incremental sync - only new/updated data
    const mobileData = {
      version: Date.now(),
      lastUpdated: new Date().toISOString(),
      syncType: 'incremental',
      religions: religions.map(religion => ({
        id: religion.id,
        name: religion.name,
        nameEn: religion.nameEn,
        description: religion.description,
        color: religion.color,
        icon: religion.icon,
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
      data: mobileData,
      syncTimestamp: Date.now(),
      message: 'Incremental sync completed'
    })

  } catch (error) {
    console.error('Sync download error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to sync content',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
