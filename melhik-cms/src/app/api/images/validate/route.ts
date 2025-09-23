import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// POST /api/images/validate - Validate external image URL
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { url, alt = '', caption = '' } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Check if URL is an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const urlLower = url.toLowerCase()
    const isImageUrl = imageExtensions.some(ext => urlLower.includes(ext)) || 
                      urlLower.includes('image') ||
                      urlLower.includes('img')

    if (!isImageUrl) {
      return NextResponse.json({ 
        error: 'URL does not appear to be an image' 
      }, { status: 400 })
    }

    // Try to fetch image metadata (optional - for validation)
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CMS-Image-Validator/1.0)'
        }
      })

      if (!response.ok) {
        return NextResponse.json({ 
          error: 'Image URL is not accessible',
          accessible: false
        }, { status: 400 })
      }

      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')

      // Validate content type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (contentType && !allowedTypes.some(type => contentType.includes(type))) {
        return NextResponse.json({ 
          error: 'URL does not point to a valid image type',
          contentType
        }, { status: 400 })
      }

      // Check file size if available
      if (contentLength) {
        const sizeInMB = parseInt(contentLength) / (1024 * 1024)
        if (sizeInMB > 10) {
          return NextResponse.json({ 
            error: 'Image is too large (max 10MB)',
            size: `${sizeInMB.toFixed(2)}MB`
          }, { status: 400 })
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          url,
          alt,
          caption,
          accessible: true,
          contentType,
          size: contentLength ? `${(parseInt(contentLength) / (1024 * 1024)).toFixed(2)}MB` : 'Unknown'
        }
      })
    } catch (fetchError) {
      // If we can't validate, still allow the URL but mark as unverified
      return NextResponse.json({
        success: true,
        data: {
          url,
          alt,
          caption,
          accessible: false,
          warning: 'Could not validate image accessibility'
        }
      })
    }
  } catch (error) {
    console.error('Error validating image URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
