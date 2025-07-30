import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const authController = new AuthController()

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', authController.register)
  fastify.post('/login', authController.login)
  fastify.post('/logout', authController.logout)
  
  fastify.register(async function protectedRoutes(fastify) {
    fastify.addHook('preHandler', authMiddleware)
    
    fastify.get('/profile', authController.getProfile)
    fastify.post('/2fa/generate', authController.generate2FASecret)
    fastify.post('/2fa/enable', authController.enable2FA)
    fastify.post('/2fa/disable', authController.disable2FA)
  })
}