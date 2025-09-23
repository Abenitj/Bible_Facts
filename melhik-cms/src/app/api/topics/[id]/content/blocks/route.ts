import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/topics/[id]/content/blocks - Get all content blocks for a topic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: idParam } = await params
    const topicId = parseInt(idParam)
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 })
    }

    // First check if the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Get topic details with content blocks
    const topicDetail = await prisma.topicDetail.findUnique({
      where: { topicId },
      include: {
        contentBlocks: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    // If no content exists yet, return empty content blocks
    if (!topicDetail) {
      return NextResponse.json({
        success: true,
        data: {
          topicDetail: null,
          contentBlocks: []
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        topicDetail,
        contentBlocks: topicDetail.contentBlocks
      }
    })
  } catch (error) {
    console.error('Error fetching content blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/topics/[id]/content/blocks - Create new content blocks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: idParam } = await params
    const topicId = parseInt(idParam)
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 })
    }

    const body = await request.json()
    const { blocks, useBlocks = true } = body

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Blocks array is required' }, { status: 400 })
    }

    // Validate blocks structure
    for (const block of blocks) {
      if (!block.blockType || !['text', 'image', 'mixed', 'gallery'].includes(block.blockType)) {
        return NextResponse.json({ 
          error: 'Invalid block type. Must be text, image, mixed, or gallery' 
        }, { status: 400 })
      }
      
      if (!block.contentData) {
        return NextResponse.json({ 
          error: 'Content data is required for each block' 
        }, { status: 400 })
      }
    }

    // First check if the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Get or create topic detail
    let topicDetail = await prisma.topicDetail.findUnique({
      where: { topicId },
      include: { contentBlocks: true }
    })

    // If no topic detail exists, create one
    if (!topicDetail) {
      topicDetail = await prisma.topicDetail.create({
        data: {
          topicId,
          explanation: '', // Empty explanation for block-based content
          useBlocks: true,
          version: 1
        },
        include: { contentBlocks: true }
      })
    }

    // Start transaction to update topic detail and content blocks
    const result = await prisma.$transaction(async (tx) => {
      // Update topic detail to use blocks
      const updatedTopicDetail = await tx.topicDetail.update({
        where: { topicId },
        data: {
          useBlocks,
          version: topicDetail.version + 1,
          updatedAt: new Date()
        }
      })

      // Delete existing content blocks
      await tx.contentBlock.deleteMany({
        where: { topicDetailId: topicDetail.id }
      })

      // Create new content blocks
      const newBlocks = await Promise.all(
        blocks.map((block, index) =>
          tx.contentBlock.create({
            data: {
              topicDetailId: topicDetail.id,
              blockType: block.blockType,
              contentData: JSON.stringify(block.contentData),
              orderIndex: index + 1
            }
          })
        )
      )

      return { topicDetail: updatedTopicDetail, contentBlocks: newBlocks }
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error creating content blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/topics/[id]/content/blocks - Update content blocks
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: idParam } = await params
    const topicId = parseInt(idParam)
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 })
    }

    const body = await request.json()
    const { blocks } = body

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Blocks array is required' }, { status: 400 })
    }

    // First check if the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Get topic detail
    const topicDetail = await prisma.topicDetail.findUnique({
      where: { topicId },
      include: { contentBlocks: true }
    })

    if (!topicDetail) {
      return NextResponse.json({ error: 'Topic content not found' }, { status: 404 })
    }

    // Update content blocks in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update topic detail version
      const updatedTopicDetail = await tx.topicDetail.update({
        where: { topicId },
        data: {
          version: topicDetail.version + 1,
          updatedAt: new Date()
        }
      })

      // Delete existing content blocks
      await tx.contentBlock.deleteMany({
        where: { topicDetailId: topicDetail.id }
      })

      // Create updated content blocks
      const newBlocks = await Promise.all(
        blocks.map((block, index) =>
          tx.contentBlock.create({
            data: {
              topicDetailId: topicDetail.id,
              blockType: block.blockType,
              contentData: JSON.stringify(block.contentData),
              orderIndex: index + 1
            }
          })
        )
      )

      return { topicDetail: updatedTopicDetail, contentBlocks: newBlocks }
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error updating content blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/topics/[id]/content/blocks - Delete all content blocks
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: idParam } = await params
    const topicId = parseInt(idParam)
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 })
    }

    // First check if the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Get topic detail
    const topicDetail = await prisma.topicDetail.findUnique({
      where: { topicId }
    })

    if (!topicDetail) {
      return NextResponse.json({ error: 'Topic content not found' }, { status: 404 })
    }

    // Delete all content blocks and reset to use traditional content
    const result = await prisma.$transaction(async (tx) => {
      // Delete content blocks
      await tx.contentBlock.deleteMany({
        where: { topicDetailId: topicDetail.id }
      })

      // Update topic detail to not use blocks
      const updatedTopicDetail = await tx.topicDetail.update({
        where: { topicId },
        data: {
          useBlocks: false,
          version: topicDetail.version + 1,
          updatedAt: new Date()
        }
      })

      return updatedTopicDetail
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error deleting content blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
