import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const nodemailer = require('nodemailer')

const prisma = new PrismaClient()

export interface SmtpConfigData {
  id: number
  name: string
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName?: string
  isActive: boolean
}

export interface EmailData {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  fromName?: string
}

// Decrypt password from database
async function decryptPassword(encryptedPassword: string): Promise<string> {
  try {
    // Since we're using bcrypt (one-way hash), we need to store the password differently
    // For now, we'll assume the password is stored as plain text for SMTP usage
    // In production, you should implement proper reversible encryption
    return encryptedPassword
  } catch (error) {
    console.error('Error decrypting password:', error)
    throw new Error('Failed to decrypt password')
  }
}

// Fetch active SMTP configuration from database
export async function getActiveSmtpConfig(): Promise<SmtpConfigData | null> {
  try {
    const config = await prisma.smtpConfig.findFirst({
      where: { isActive: true }
    })

    if (!config) {
      return null
    }

    return {
      id: config.id,
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password,
      fromEmail: config.fromEmail,
      fromName: config.fromName || undefined,
      isActive: config.isActive
    }
  } catch (error) {
    console.error('Error fetching active SMTP configuration:', error)
    return null
  }
}

// Fetch SMTP configuration by ID
export async function getSmtpConfigById(id: number): Promise<SmtpConfigData | null> {
  try {
    const config = await prisma.smtpConfig.findUnique({
      where: { id }
    })

    if (!config) {
      return null
    }

    return {
      id: config.id,
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password,
      fromEmail: config.fromEmail,
      fromName: config.fromName || undefined,
      isActive: config.isActive
    }
  } catch (error) {
    console.error('Error fetching SMTP configuration by ID:', error)
    return null
  }
}

// Test SMTP configuration
export async function testSmtpConfig(configId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getSmtpConfigById(configId)
    if (!config) {
      return { success: false, error: 'SMTP configuration not found' }
    }

    if (!config.host || !config.port || !config.username) {
      return { success: false, error: 'Invalid SMTP configuration' }
    }

    // Decrypt password
    const decryptedPassword = await decryptPassword(config.password)
    
    console.log('SMTP Debug - Config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      passwordLength: decryptedPassword ? decryptedPassword.length : 0,
      passwordPreview: decryptedPassword ? `${decryptedPassword.substring(0, 4)}...${decryptedPassword.substring(decryptedPassword.length - 4)}` : 'null'
    })

    // Create transporter with additional options for Gmail
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: decryptedPassword
      },
      // Additional options for Gmail
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    })

    // Verify connection
    await transporter.verify()
    
    return { success: true }
  } catch (error) {
    console.error('Error testing SMTP configuration:', error)
    return { success: false, error: `Failed to test SMTP configuration: ${error.message}` }
  }
}

// Send email using SMTP configuration
export async function sendEmail(
  configId: number,
  emailData: EmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getSmtpConfigById(configId)
    if (!config) {
      return { success: false, error: 'SMTP configuration not found' }
    }

    if (!config.isActive) {
      return { success: false, error: 'SMTP configuration is not active' }
    }

    // Decrypt password
    const decryptedPassword = await decryptPassword(config.password)

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: decryptedPassword
      }
    })

    // Prepare email options
    const mailOptions = {
      from: emailData.from || config.fromEmail,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: `Failed to send email: ${error.message}` }
  }
}

// Send email using active SMTP configuration
export async function sendEmailWithActiveConfig(
  emailData: EmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getActiveSmtpConfig()
    if (!config) {
      return { success: false, error: 'No active SMTP configuration found' }
    }

    return await sendEmail(config.id, emailData)
  } catch (error) {
    console.error('Error sending email with active config:', error)
    return { success: false, error: `Failed to send email: ${error.message}` }
  }
}

// Get all SMTP configurations (for management)
export async function getAllSmtpConfigs() {
  try {
    const configs = await prisma.smtpConfig.findMany({
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        fromEmail: true,
        fromName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return configs
  } catch (error) {
    console.error('Error fetching all SMTP configurations:', error)
    return []
  }
}
