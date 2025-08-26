import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateReligionSchema } from '@/lib/validation'

// GET /api/religions/[id] - Get specific religion
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid religion ID' },
        { status: 400 }
      )
    }
    
    const religion = await prisma.religion.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            details: true
          }
        }
      }
    })
    
    if (!religion) {
      return NextResponse.json(
        { success: false, message: 'Religion not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: religion
    })
    
  } catch (error) {
    console.error('Error fetching religion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch religion' },
      { status: 500 }
    )
  }
}

// PUT /api/religions/[id] - Update religion
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid religion ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateReligionSchema.parse(body)
    
    const religion = await prisma.religion.update({
      where: { id },
      data: validatedData
    })
    
    return NextResponse.json({
      success: true,
      message: 'Religion updated successfully',
      data: religion
    })
    
  } catch (error) {
    console.error('Error updating religion:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to update religion' },
      { status: 500 }
    )
  }
}

// DELETE /api/religions/[id] - Delete religion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid religion ID' },
        { status: 400 }
      )
    }
    
    await prisma.religion.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Religion deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting religion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete religion' },
      { status: 500 }
    )
  }
}

