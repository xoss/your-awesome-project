import { FastifyRequest, FastifyReply } from 'fastify'
import { ProjectService } from '../services/project.service'
import { createProjectSchema, updateProjectSchema, updateProjectDetailsSchema } from '../types/project'

const projectService = new ProjectService()

export class ProjectController {
  async createProject(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const data = createProjectSchema.parse(request.body)
      const project = await projectService.createProject(request.user.id, data)
      
      reply.status(201).send({
        message: 'Project created successfully',
        project
      })
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async getProjects(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const projects = await projectService.getUserProjects(request.user.id)
      
      reply.status(200).send({
        projects
      })
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getProject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const project = await projectService.getProjectById(request.user.id, request.params.id)
      
      reply.status(200).send({
        project
      })
    } catch (error) {
      if (error instanceof Error) {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async updateProject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const data = updateProjectSchema.parse(request.body)
      const project = await projectService.updateProject(request.user.id, request.params.id, data)
      
      reply.status(200).send({
        message: 'Project updated successfully',
        project
      })
    } catch (error) {
      if (error instanceof Error) {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async updateProjectDetails(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const data = updateProjectDetailsSchema.parse(request.body)
      const details = await projectService.updateProjectDetails(request.user.id, request.params.id, data)
      
      reply.status(200).send({
        message: 'Project details updated successfully',
        details
      })
    } catch (error) {
      if (error instanceof Error) {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  async deleteProject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const result = await projectService.deleteProject(request.user.id, request.params.id)
      
      reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        reply.status(404).send({ error: error.message })
      } else {
        reply.status(500).send({ error: 'Internal server error' })
      }
    }
  }
}