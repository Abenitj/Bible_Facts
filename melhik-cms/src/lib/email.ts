import { getActiveSmtpConfig, sendEmail } from './smtp'

export interface WelcomeEmailData {
  username: string
  email: string
  temporaryPassword: string
  loginUrl: string
  adminName?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Generate a secure temporary password
export function generateTemporaryPassword(): string {
  const length = 16
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  let password = ''
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest with random characters from all categories
  const allChars = uppercase + lowercase + numbers + symbols
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password using Fisher-Yates algorithm for better randomization
  const passwordArray = password.split('')
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]]
  }
  
  return passwordArray.join('')
}

// Create welcome email template
export function createWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
  const { username, email, temporaryPassword, loginUrl, adminName } = data
  
  const subject = `Welcome to Melhik CMS - Your Account is Ready!`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Melhik CMS</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .email-wrapper {
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }
        .welcome-text {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 500;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
        }
        .description {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .credentials-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            position: relative;
        }
        .credentials-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa);
            border-radius: 12px 12px 0 0;
        }
        .credential-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .credential-item:last-child {
            border-bottom: none;
        }
        .credential-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        .credential-value {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            background-color: #ffffff;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            color: #1f2937;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.025em;
        }
        .security-notice {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            position: relative;
        }
        .security-notice::before {
            content: '⚠️';
            position: absolute;
            top: -8px;
            left: 20px;
            background: white;
            padding: 0 8px;
            font-size: 16px;
        }
        .security-title {
            color: #d97706;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 8px;
        }
        .security-text {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease;
        }
        .login-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .admin-note {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 1px solid #10b981;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
        }
        .admin-note strong {
            color: #065f46;
            font-weight: 600;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }
        .footer-text:first-child {
            margin-bottom: 8px;
        }
        @media (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            .container {
                border-radius: 12px;
            }
            .header {
                padding: 30px 20px;
            }
            .content {
                padding: 30px 20px;
            }
            .credential-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
        }
            font-size: 14px;
        }
        .admin-note {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">Melhik CMS</div>
                <div class="welcome-text">Welcome to your new account</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${username}!</div>
                <p class="description">Your account has been created successfully. Here are your login details:</p>
                
                <div class="credentials-card">
                    <div class="credential-item">
                        <span class="credential-label">Username:</span>
                        <span class="credential-value">${username}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Password:</span>
                        <span class="credential-value">${temporaryPassword}</span>
                    </div>
                </div>
                
                <div class="security-notice">
                    <div class="security-title">Security Notice</div>
                    <p class="security-text">This is a temporary password. You must change it on your first login.</p>
                </div>
                
                <div class="cta-section">
                    <a href="${loginUrl}" class="login-button">Login Now</a>
                </div>
                
                ${adminName ? `
                <div class="admin-note">
                    <strong>From ${adminName}:</strong> Welcome to the team!
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p class="footer-text">This is an automated message from Melhik CMS. Please do not reply to this email.</p>
                <p class="footer-text">If you did not expect this email, please contact your system administrator.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `
  
  const text = `
Welcome to Melhik CMS!

Your account has been created successfully.

Login Details:
Username: ${username}
Password: ${temporaryPassword}

IMPORTANT: This is a temporary password. You must change it on your first login.

Login: ${loginUrl}

${adminName ? `From ${adminName}: Welcome to the team!` : ''}

---
Melhik CMS - Automated Message
  `
  
  return { subject, html, text }
}

// Send welcome email to new user
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  try {
    // Get active SMTP configuration
    const smtpConfig = await getActiveSmtpConfig()
    if (!smtpConfig) {
      console.error('No active SMTP configuration found')
      return false
    }
    
    // Create email template
    const template = createWelcomeEmailTemplate(data)
    
    // Send email
    await sendEmail(smtpConfig.id, {
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
    
    console.log(`Welcome email sent successfully to ${data.email}`)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<boolean> {
  try {
    const smtpConfig = await getActiveSmtpConfig()
    if (!smtpConfig) {
      console.error('No active SMTP configuration found')
      return false
    }
    
    const subject = 'Password Reset Request - Melhik CMS'
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password for your Melhik CMS account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <div class="warning">
            <strong>Security Notice:</strong> This link will expire in 1 hour. If you did not request this reset, please ignore this email.
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
    </div>
</body>
</html>
    `
    
    const text = `
Password Reset Request - Melhik CMS

You have requested to reset your password for your Melhik CMS account.

Reset your password by visiting: ${resetUrl}

Security Notice: This link will expire in 1 hour. If you did not request this reset, please ignore this email.
    `
    
    await sendEmail(smtpConfig.id, {
      to: email,
      subject,
      html,
      text
    })
    
    console.log(`Password reset email sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}
