import { api } from './api'
import { LoginCredentials, RegisterData, AuthResponse, LoginResponse, TwoFactorSetup, User } from '../types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/profile')
    return response.data
  },

  async generate2FASecret(): Promise<TwoFactorSetup> {
    const response = await api.post<TwoFactorSetup>('/auth/2fa/generate')
    return response.data
  },

  async enable2FA(secret: string, token: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>('/auth/2fa/enable', {
      secret,
      token,
    })
    return response.data
  },

  async disable2FA(): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>('/auth/2fa/disable')
    return response.data
  },
}