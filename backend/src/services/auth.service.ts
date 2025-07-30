import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { prisma } from '../config/database'
import { RegisterInput, LoginInput, JWTPayload } from '../types/auth'

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        twoFactorEnabled: true,
        avatarUrl: true,
        createdAt: true
      }
    })

    return user
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!data.totpCode) {
        return { requiresTwoFactor: true }
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: data.totpCode,
        window: 2
      })

      if (!isValid) {
        throw new Error('Invalid 2FA code')
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    }
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const secret = speakeasy.generateSecret({
      name: `Customer Portal (${user.email})`,
      issuer: 'Customer Portal'
    })

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    }
  }

  async enableTwoFactor(userId: string, secret: string, token: string) {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    })

    if (!isValid) {
      throw new Error('Invalid verification code')
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret
      }
    })

    return { success: true }
  }

  async disableTwoFactor(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    })

    return { success: true }
  }

  async createSession(userId: string) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const session = await prisma.session.create({
      data: {
        userId,
        token: this.generateSessionToken(),
        expiresAt
      }
    })

    return session
  }

  async validateSession(token: string) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            twoFactorEnabled: true,
            avatarUrl: true
          }
        }
      }
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return session
  }

  async deleteSession(token: string) {
    await prisma.session.delete({
      where: { token }
    })
  }

  private generateSessionToken(): string {
    return require('crypto').randomBytes(32).toString('hex')
  }
}