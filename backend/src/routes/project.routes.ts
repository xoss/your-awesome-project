import { FastifyInstance } from 'fastify'
import { ProjectController } from '../controllers/project.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const projectController = new ProjectController()

export async function projectRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware)
  
  fastify.get('/', projectController.getProjects)
  fastify.post('/', projectController.createProject)
  fastify.get('/:id', projectController.getProject)
  fastify.put('/:id', projectController.updateProject)
  fastify.put('/:id/details', projectController.updateProjectDetails)
  fastify.delete('/:id', projectController.deleteProject)
}