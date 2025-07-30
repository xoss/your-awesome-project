import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { loginSchema, registerSchema, enable2FASchema } from '../types/auth'

const authService = new AuthService()

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerSchema.parse(request.body)
      const user = await authService.register(data)
      
      reply.status(201).send({
        message: 'User registered successfully',
        user
      })
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body)
      const result = await authService.login(data)
      
      if ('requiresTwoFactor' in result) {
        return reply.status(200).send({
          requiresTwoFactor: true,
          message: 'Please provide 2FA code'
        })
      }

      const session = await authService.createSession(result.user.id)
      
      reply.status(200).send({
        message: 'Login successful',
        user: result.user,
        token: session.token
      })
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authorization = request.headers.authorization
      
      if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.replace('Bearer ', '')
        await authService.deleteSession(token)
      }
      
      reply.status(200).send({ message: 'Logout successful' })
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      reply.status(200).send({
        user: request.user
      })
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async generate2FASecret(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const result = await authService.generateTwoFactorSecret(request.user.id)
      
      reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async enable2FA(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const data = enable2FASchema.parse(request.body)
      const result = await authService.enableTwoFactor(request.user.id, data.secret, data.token)
      
      reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async disable2FA(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const result = await authService.disableTwoFactor(request.user.id)
      
      reply.status(200).send(result)
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' })
    }
  }
}