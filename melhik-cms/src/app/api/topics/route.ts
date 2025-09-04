import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/topics - Get all topics
export async function GET(request: NextRequest) {
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

    // For now, allow all authenticated users to view topics
    // In production, you would check specific permissions here
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
        title: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: topics,
      count: topics.length
    });

  } catch (error) {
    console.error('Topics API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get topics',
        message: 'Could not retrieve topics data',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// POST /api/topics - Create new topic
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

    // Check if user has permission to create topics
    // For now, allow admins and content managers
    if (payload.role !== 'admin' && payload.role !== 'content_manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { title, titleEn, description, religionId, imageUrl, imageAlt } = body;

    if (!title || !description || !religionId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Title, description, and religionId are required'
        }, 
        { status: 400 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        titleEn: titleEn || title,
        description,
        religionId: parseInt(religionId),
        imageUrl: imageUrl || null,
        imageAlt: imageAlt || null
      },
      select: {
        id: true,
        title: true,
        titleEn: true,
        description: true,
        religionId: true,
        imageUrl: true,
        imageAlt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: topic,
      message: 'Topic created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create topic',
        message: 'Could not create topic',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
