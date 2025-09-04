import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/religions - Get all religions
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

    // For now, allow all authenticated users to view religions
    // In production, you would check specific permissions here
    const religions = await prisma.religion.findMany({
      include: {
        topics: {
          select: {
            id: true,
            title: true,
            titleEn: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: religions,
      count: religions.length
    });

  } catch (error) {
    console.error('Religions API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get religions',
        message: 'Could not retrieve religions data',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// POST /api/religions - Create new religion
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

    // Check if user has permission to create religions
    // For now, allow admins and content managers
    if (payload.role !== 'admin' && payload.role !== 'content_manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nameEn, description, color, imageUrl, imageAlt } = body;

    if (!name || !description) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Name and description are required'
        }, 
        { status: 400 }
      );
    }

    const religion = await prisma.religion.create({
      data: {
        name,
        nameEn: nameEn || name,
        description,
        color: color || '#3B82F6',
        imageUrl: imageUrl || null,
        imageAlt: imageAlt || null
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        color: true,
        imageUrl: true,
        imageAlt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: religion,
      message: 'Religion created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create religion error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create religion',
        message: 'Could not create religion',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
