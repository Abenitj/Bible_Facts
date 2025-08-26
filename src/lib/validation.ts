import { z } from 'zod'

// Religion validation schemas
export const createReligionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').default('#8B4513')
})

export const updateReligionSchema = createReligionSchema.partial()

// Topic validation schemas
export const createTopicSchema = z.object({
  religionId: z.number().int().positive('Religion ID must be a positive integer'),
  title: z.string().min(1, 'Title is required'),
  titleEn: z.string().optional(),
  description: z.string().optional()
})

export const updateTopicSchema = createTopicSchema.partial()

// Topic Detail validation schemas
export const createTopicDetailSchema = z.object({
  topicId: z.number().int().positive('Topic ID must be a positive integer'),
  explanation: z.string().min(1, 'Explanation is required'),
  bibleVerses: z.array(z.string()).optional(),
  keyPoints: z.array(z.string()).optional(),
  references: z.array(z.object({
    verse: z.string(),
    text: z.string(),
    explanation: z.string()
  })).optional(),
  version: z.number().int().positive().default(1)
})

export const updateTopicDetailSchema = createTopicDetailSchema.partial()

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'editor']).default('admin')
})

// Sync schemas
export const syncCheckSchema = z.object({
  appVersion: z.string(),
  lastSync: z.string().datetime().optional(),
  localVersion: z.number().int().positive()
})

export const syncDownloadSchema = z.object({
  version: z.number().int().positive(),
  lastUpdated: z.string().datetime(),
  religions: z.array(z.any()),
  topics: z.array(z.any()),
  topicDetails: z.array(z.any())
})

