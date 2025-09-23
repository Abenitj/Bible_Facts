import { z } from 'zod'

// User validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'content_manager']).default('content_manager'),
  status: z.enum(['active', 'inactive']).default('active'),
})

export const updateUserSchema = createUserSchema.partial().omit({ password: true })

export const updateUserPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const resetPasswordSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

// Religion validation schemas
export const createReligionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').default('#8B4513'),
})

export const updateReligionSchema = createReligionSchema.partial()

// Topic validation schemas
export const createTopicSchema = z.object({
  religionId: z.number().int().positive('Religion ID must be a positive integer'),
  title: z.string().min(1, 'Title is required'),
  titleEn: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),
  imageAlt: z.string().optional(),
})

export const updateTopicSchema = createTopicSchema.partial()

// Content Block validation schemas
export const contentBlockSchema = z.object({
  blockType: z.enum(['text', 'image', 'mixed', 'gallery']),
  contentData: z.any(), // JSON object - will be validated based on blockType
  orderIndex: z.number().int().positive().optional(),
})

// Topic Detail validation schemas
export const createTopicDetailSchema = z.object({
  topicId: z.number().int().positive('Topic ID must be a positive integer'),
  version: z.number().int().positive().default(1),
  useBlocks: z.boolean().default(true),
})

export const updateTopicDetailSchema = createTopicDetailSchema.partial()

// Content Blocks API validation schemas
export const createContentBlocksSchema = z.object({
  topicId: z.number().int().positive('Topic ID must be a positive integer'),
  useBlocks: z.boolean().default(true),
  blocks: z.array(contentBlockSchema).min(1, 'At least one content block is required'),
})

export const updateContentBlocksSchema = z.object({
  blocks: z.array(contentBlockSchema).min(1, 'At least one content block is required'),
})

// Image validation schemas
export const imageUploadSchema = z.object({
  file: z.any(), // File object
  alt: z.string().optional(),
  caption: z.string().optional(),
})

export const imageUrlValidationSchema = z.object({
  url: z.string().url('Invalid URL format'),
  alt: z.string().optional(),
  caption: z.string().optional(),
})

// Sync validation schemas
export const syncCheckSchema = z.object({
  lastSync: z.string().datetime().optional(),
  version: z.number().int().positive().optional(),
})

// User activity validation schemas
export const createUserActivitySchema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer'),
  action: z.string().min(1, 'Action is required'),
  resource: z.string().optional(),
  resourceId: z.number().int().positive().optional(),
  details: z.string().optional(), // JSON string
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

