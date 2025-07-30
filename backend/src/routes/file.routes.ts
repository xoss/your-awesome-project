import { FastifyInstance } from 'fastify'
import { FileController } from '../controllers/file.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const fileController = new FileController()

export async function fileRoutes(fastify: FastifyInstance) {
  fastify.get('/avatars/:filename', fileController.getAvatar)
  
  fastify.register(async function protectedRoutes(fastify) {
    fastify.addHook('preHandler', authMiddleware)
    
    fastify.post('/avatar', fileController.uploadAvatar)
    fastify.get('/documents/:filename', fileController.getDocument)
  })
}