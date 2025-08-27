import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createReligionSchema, updateReligionSchema } from '@/lib/validation'

// GET /api/religions - Get all religions
export async function GET() {
  try {
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
    })

    return NextResponse.json({
      success: true,
      data: religions
    })

  } catch (error) {
    console.error('Get religions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/religions - Create new religion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = createReligionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const religionData = validation.data

    // Check if religion with same name already exists
    const existingReligion = await prisma.religion.findFirst({
      where: { name: religionData.name }
    })

    if (existingReligion) {
      return NextResponse.json(
        { error: 'Religion with this name already exists' },
        { status: 409 }
      )
    }

    // Create religion
    const religion = await prisma.religion.create({
      data: religionData
    })

    return NextResponse.json({
      success: true,
      data: religion
    }, { status: 201 })

  } catch (error) {
    console.error('Create religion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
