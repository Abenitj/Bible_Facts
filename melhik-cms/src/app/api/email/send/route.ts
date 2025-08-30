import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendEmailWithActiveConfig, getActiveSmtpConfig } from '@/lib/smtp'

// POST - Send email using active SMTP configuration
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      to,
      subject,
      html,
      text,
      from,
      fromName
    } = body

    // Validation
    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Recipient and subject are required' },
        { status: 400 }
      )
    }

    // Check if there's an active SMTP configuration
    const activeConfig = await getActiveSmtpConfig()
    if (!activeConfig) {
      return NextResponse.json(
        { error: 'No active SMTP configuration found. Please configure SMTP settings first.' },
        { status: 400 }
      )
    }

    // Send email
    const result = await sendEmailWithActiveConfig({
      to,
      subject,
      html,
      text,
      from: from || activeConfig.fromEmail,
      fromName: fromName || activeConfig.fromName
    })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        to,
        subject,
        configUsed: activeConfig.name
      }
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Check if there's an active SMTP configuration
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const activeConfig = await getActiveSmtpConfig()
    
    if (!activeConfig) {
      return NextResponse.json({
        success: false,
        message: 'No active SMTP configuration found',
        data: null
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Active SMTP configuration found',
      data: {
        id: activeConfig.id,
        name: activeConfig.name,
        host: activeConfig.host,
        port: activeConfig.port,
        secure: activeConfig.secure,
        username: activeConfig.username,
        fromEmail: activeConfig.fromEmail,
        fromName: activeConfig.fromName,
        isActive: activeConfig.isActive
      }
    })
  } catch (error) {
    console.error('Error checking SMTP configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
