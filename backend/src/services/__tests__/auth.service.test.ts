import { describe, it, expect, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock database config first
vi.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  }
}))

// Mock bcrypt
vi.mock('bcryptjs')
const mockBcrypt = vi.mocked(bcrypt)

// Mock speakeasy
vi.mock('speakeasy', () => ({
  generateSecret: vi.fn(() => ({
    base32: 'JBSWY3DPEHPK3PXP',
    otpauth_url: 'otpauth://totp/test'
  })),
  totp: {
    verify: vi.fn()
  }
}))

// Mock QRCode
vi.mock('qrcode', () => ({
  toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mock-qr-code'))
}))

// Import after mocks
import { AuthService } from '../auth.service'
import { prisma } from '../../config/database'

const mockPrisma = vi.mocked(prisma)

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(async () => {
    authService = new AuthService()
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      }

      // Mock prisma calls
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed-password')
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
        twoFactorEnabled: false,
        avatarUrl: null,
        createdAt: new Date()
      })

      const result = await authService.register(userData)

      expect(result).toMatchObject({
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
        twoFactorEnabled: false
      })
      expect(result).not.toHaveProperty('password')
    })

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      }

      // Mock existing user
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: userData.email,
        password: 'hashed-password',
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await expect(authService.register(userData)).rejects.toThrow('User already exists')
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockUser = {
        id: '1',
        email: loginData.email,
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        isActive: true,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)

      const result = await authService.login(loginData)

      expect(result).toHaveProperty('user')
      expect(result.user).toMatchObject({
        id: '1',
        email: loginData.email,
        firstName: 'Test',
        lastName: 'User'
      })
    })

    it('should throw error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
    })

    it('should require 2FA when enabled', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockUser = {
        id: '1',
        email: loginData.email,
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        isActive: true,
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)

      const result = await authService.login(loginData)

      expect(result).toEqual({
        requiresTwoFactor: true
      })
    })
  })

  describe('createSession', () => {
    it('should create a new session', async () => {
      const userId = '1'
      const mockSession = {
        id: '1',
        userId,
        token: 'mock-session-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.session.create.mockResolvedValue(mockSession)

      const result = await authService.createSession(userId)

      expect(result).toMatchObject({
        userId,
        token: expect.any(String)
      })
    })
  })

  describe('validateSession', () => {
    it('should validate a valid session', async () => {
      const token = 'valid-token'
      const mockSession = {
        id: '1',
        userId: '1',
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
          isActive: true,
          twoFactorEnabled: false,
          avatarUrl: null
        }
      }

      mockPrisma.session.findUnique.mockResolvedValue(mockSession)

      const result = await authService.validateSession(token)

      expect(result).toEqual(mockSession)
    })

    it('should return null for expired session', async () => {
      const token = 'expired-token'
      const mockSession = {
        id: '1',
        userId: '1',
        token,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
          isActive: true,
          twoFactorEnabled: false,
          avatarUrl: null
        }
      }

      mockPrisma.session.findUnique.mockResolvedValue(mockSession)

      const result = await authService.validateSession(token)

      expect(result).toBeNull()
    })
  })

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const token = 'session-to-delete'

      mockPrisma.session.delete.mockResolvedValue({
        id: '1',
        userId: '1',
        token,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await authService.deleteSession(token)

      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { token }
      })
    })
  })
})