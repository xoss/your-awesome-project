import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().optional()
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number and special character'),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/).optional()
})

export const enable2FASchema = z.object({
  secret: z.string(),
  token: z.string().length(6)
})

export const verify2FASchema = z.object({
  token: z.string().length(6)
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type Enable2FAInput = z.infer<typeof enable2FASchema>
export type Verify2FAInput = z.infer<typeof verify2FASchema>

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}