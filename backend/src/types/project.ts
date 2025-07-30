import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional()
})

export const updateProjectDetailsSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  birthday: z.string().datetime().transform(date => new Date(date)).optional(),
  street: z.string().min(1).max(100).optional(),
  houseNumber: z.string().min(1).max(20).optional(),
  zipCode: z.string().min(1).max(20).optional(),
  city: z.string().min(1).max(50).optional(),
  country: z.string().min(1).max(50).optional()
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type UpdateProjectDetailsInput = z.infer<typeof updateProjectDetailsSchema>