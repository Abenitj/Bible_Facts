import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTopicSchema, updateTopicSchema } from '@/lib/validation'

// GET /api/topics - Get all topics
export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        religion: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            color: true
          }
        },
        details: {
          select: {
            id: true,
            version: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: topics
    })

  } catch (error) {
    console.error('Get topics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/topics - Create new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = createTopicSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const topicData = validation.data

    // Check if religion exists
    const religion = await prisma.religion.findUnique({
      where: { id: topicData.religionId }
    })

    if (!religion) {
      return NextResponse.json(
        { error: 'Religion not found' },
        { status: 404 }
      )
    }

    // Create topic
    const topic = await prisma.topic.create({
      data: topicData,
      include: {
        religion: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: topic
    }, { status: 201 })

  } catch (error) {
    console.error('Create topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
