import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'

const authService = new AuthService()

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authorization = request.headers.authorization
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' })
    }

    const token = authorization.replace('Bearer ', '')
    
    const session = await authService.validateSession(token)
    
    if (!session || !session.user.isActive) {
      return reply.status(401).send({ error: 'Invalid or expired session' })
    }

    request.user = session.user
  } catch (error) {
    return reply.status(401).send({ error: 'Authentication failed' })
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      phone: string | null
      isActive: boolean
      twoFactorEnabled: boolean
      avatarUrl: string | null
    }
  }
}