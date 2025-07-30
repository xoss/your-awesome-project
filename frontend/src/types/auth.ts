export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  isActive: boolean
  twoFactorEnabled: boolean
  avatarUrl: string | null
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  totpCode?: string
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface LoginResponse {
  message: string
  user?: User
  token?: string
  requiresTwoFactor?: boolean
}

export interface TwoFactorSetup {
  secret: string
  qrCode: string
}