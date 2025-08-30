import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { testSmtpConfig, sendEmailWithActiveConfig } from '@/lib/smtp'

// POST - Test SMTP configuration
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
    const { configId, testEmail } = body

    if (!configId) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 })
    }

    // Test the SMTP configuration
    const testResult = await testSmtpConfig(configId)
    
    if (!testResult.success) {
      return NextResponse.json({
        success: false,
        error: testResult.error
      })
    }

    // If test email is provided, send a test email
    if (testEmail) {
      const emailResult = await sendEmailWithActiveConfig({
        to: testEmail,
        subject: 'SMTP Configuration Test',
        html: `
          <h2>SMTP Configuration Test</h2>
          <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
          <p><strong>Configuration ID:</strong> ${configId}</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p><em>This email was sent automatically by the Melhik CMS system.</em></p>
        `,
        text: `
          SMTP Configuration Test
          
          This is a test email to verify that your SMTP configuration is working correctly.
          
          Configuration ID: ${configId}
          Test Time: ${new Date().toISOString()}
          
          This email was sent automatically by the Melhik CMS system.
        `
      })

      if (!emailResult.success) {
        return NextResponse.json({
          success: false,
          error: `Configuration test passed but email sending failed: ${emailResult.error}`
        })
      }

      return NextResponse.json({
        success: true,
        message: 'SMTP configuration test passed and test email sent successfully',
        data: {
          configId,
          testEmail
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration test passed',
      data: {
        configId
      }
    })
  } catch (error) {
    console.error('Error testing SMTP configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
