import { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import jwt from 'jsonwebtoken'

export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    disableRequestLogging: true
  })
  
  // Register minimal plugins needed for testing
  await app.register(require('@fastify/sensible'))
  
  // Mock auth middleware for testing
  app.addHook('preHandler', async (request: any, _reply) => {
    const authorization = request.headers.authorization
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      
      // Mock authentication based on test tokens
      if (token === 'profile-session-token' || token === 'project-test-token' || token === 'file-test-token' || token === '2fa-generate-token' || token === '2fa-disable-token') {
        request.user = {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          twoFactorEnabled: false
        }
      }
    }
  })
  
  await app.ready()
  return app
}

export function createTestJWT(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h'
  })
}

export function createAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  }
}

export const testUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'USER' as const
}

export const testAdmin = {
  id: '2', 
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN' as const
}