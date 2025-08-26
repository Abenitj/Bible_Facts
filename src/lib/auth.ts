import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export interface JWTPayload {
  userId: number
  username: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.sign(payload, secret, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.verify(token, secret) as JWTPayload
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role
  }
}

export async function createUser(username: string, password: string, role: string = 'admin') {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role
    }
  })
}

