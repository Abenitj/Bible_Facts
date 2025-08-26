import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTopicDetailSchema, updateTopicDetailSchema } from '@/lib/validation'

// POST /api/topics/[id]/content - Create topic content
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topicId = parseInt(params.id)

    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = createTopicDetailSchema.safeParse({
      ...body,
      topicId
    })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const contentData = validation.data

    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Check if content already exists
    const existingContent = await prisma.topicDetail.findUnique({
      where: { topicId }
    })

    if (existingContent) {
      return NextResponse.json(
        { error: 'Content already exists for this topic. Use PUT to update.' },
        { status: 400 }
      )
    }

    // Create content
    const content = await prisma.topicDetail.create({
      data: {
        topicId,
        explanation: contentData.explanation,
        bibleVerses: contentData.bibleVerses ? JSON.stringify(contentData.bibleVerses) : null,
        keyPoints: contentData.keyPoints ? JSON.stringify(contentData.keyPoints) : null,
        references: contentData.references ? JSON.stringify(contentData.references) : null,
        version: contentData.version || 1
      },
      include: {
        topic: {
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: content
    }, { status: 201 })

  } catch (error) {
    console.error('Create topic content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/topics/[id]/content - Update topic content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topicId = parseInt(params.id)

    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = updateTopicDetailSchema.safeParse({
      ...body,
      topicId
    })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const contentData = validation.data

    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Check if content exists
    const existingContent = await prisma.topicDetail.findUnique({
      where: { topicId }
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found for this topic. Use POST to create.' },
        { status: 404 }
      )
    }

    // Update content
    const content = await prisma.topicDetail.update({
      where: { topicId },
      data: {
        explanation: contentData.explanation,
        bibleVerses: contentData.bibleVerses ? JSON.stringify(contentData.bibleVerses) : existingContent.bibleVerses,
        keyPoints: contentData.keyPoints ? JSON.stringify(contentData.keyPoints) : existingContent.keyPoints,
        references: contentData.references ? JSON.stringify(contentData.references) : existingContent.references,
        version: contentData.version || existingContent.version + 1
      },
      include: {
        topic: {
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: content
    })

  } catch (error) {
    console.error('Update topic content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/topics/[id]/content - Get topic content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topicId = parseInt(params.id)

    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      )
    }

    const content = await prisma.topicDetail.findUnique({
      where: { topicId },
      include: {
        topic: {
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
        }
      }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: content
    })

  } catch (error) {
    console.error('Get topic content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

