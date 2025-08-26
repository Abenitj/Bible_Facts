import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createReligionSchema } from '@/lib/validation'

// GET /api/religions - Get all religions
export async function GET() {
  try {
    const religions = await prisma.religion.findMany({
      include: {
        _count: {
          select: {
            topics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: religions
    })
    
  } catch (error) {
    console.error('Error fetching religions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch religions' },
      { status: 500 }
    )
  }
}

// POST /api/religions - Create new religion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createReligionSchema.parse(body)
    
    // Create religion
    const religion = await prisma.religion.create({
      data: validatedData
    })
    
    return NextResponse.json({
      success: true,
      message: 'Religion created successfully',
      data: religion
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating religion:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create religion' },
      { status: 500 }
    )
  }
}

