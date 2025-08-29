import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  userId: number
  username: string
  role: string
}

// Role hierarchy - higher roles have more permissions
export const ROLES = {
  ADMIN: 'admin',
  CONTENT_MANAGER: 'content_manager'
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

// Permission definitions
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  RESET_USER_PASSWORD: 'reset_user_password',
  
  // Content Management
  VIEW_RELIGIONS: 'view_religions',
  CREATE_RELIGIONS: 'create_religions',
  EDIT_RELIGIONS: 'edit_religions',
  DELETE_RELIGIONS: 'delete_religions',
  
  VIEW_TOPICS: 'view_topics',
  CREATE_TOPICS: 'create_topics',
  EDIT_TOPICS: 'edit_topics',
  DELETE_TOPICS: 'delete_topics',
  
  VIEW_CONTENT: 'view_content',
  EDIT_CONTENT: 'edit_content',
  
  // System Management
  VIEW_SYNC: 'view_sync',
  MANAGE_SYNC: 'manage_sync',
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings'
} as const

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [ROLES.ADMIN]: [
    // Full access to everything
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.RESET_USER_PASSWORD,
    PERMISSIONS.VIEW_RELIGIONS,
    PERMISSIONS.CREATE_RELIGIONS,
    PERMISSIONS.EDIT_RELIGIONS,
    PERMISSIONS.DELETE_RELIGIONS,
    PERMISSIONS.VIEW_TOPICS,
    PERMISSIONS.CREATE_TOPICS,
    PERMISSIONS.EDIT_TOPICS,
    PERMISSIONS.DELETE_TOPICS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.VIEW_SYNC,
    PERMISSIONS.MANAGE_SYNC,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.MANAGE_SETTINGS
  ],
  [ROLES.CONTENT_MANAGER]: [
    // Content management only
    PERMISSIONS.VIEW_RELIGIONS,
    PERMISSIONS.CREATE_RELIGIONS,
    PERMISSIONS.EDIT_RELIGIONS,
    PERMISSIONS.DELETE_RELIGIONS,
    PERMISSIONS.VIEW_TOPICS,
    PERMISSIONS.CREATE_TOPICS,
    PERMISSIONS.EDIT_TOPICS,
    PERMISSIONS.DELETE_TOPICS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.VIEW_SYNC,
    PERMISSIONS.VIEW_SETTINGS
  ]
}

// Authorization functions
export function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || []
  return userPermissions.includes(requiredPermission)
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = [ROLES.CONTENT_MANAGER, ROLES.ADMIN]
  const userRoleIndex = roleHierarchy.indexOf(userRole)
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
  return userRoleIndex >= requiredRoleIndex
}

export function canAccessUserManagement(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.VIEW_USERS);
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.CREATE_USERS) || 
         hasPermission(userRole, PERMISSIONS.EDIT_USERS) || 
         hasPermission(userRole, PERMISSIONS.DELETE_USERS)
}

export function canAccessContentManagement(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.VIEW_RELIGIONS) || 
         hasPermission(userRole, PERMISSIONS.VIEW_TOPICS) || 
         hasPermission(userRole, PERMISSIONS.VIEW_CONTENT)
}

export function canAccessSystemSettings(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.VIEW_SETTINGS)
}

export function canManageSystemSettings(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.MANAGE_SETTINGS)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

