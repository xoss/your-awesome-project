import { prisma } from '../config/database'
import { CreateProjectInput, UpdateProjectInput, UpdateProjectDetailsInput } from '../types/project'

export class ProjectService {
  async createProject(userId: string, data: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        userId,
        details: {
          create: {}
        }
      },
      include: {
        details: true
      }
    })

    return project
  }

  async getUserProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        details: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return projects
  }

  async getProjectById(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId
      },
      include: {
        details: true
      }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    return project
  }

  async updateProject(userId: string, projectId: string, data: UpdateProjectInput) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId
      }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        details: true
      }
    })

    return updatedProject
  }

  async updateProjectDetails(userId: string, projectId: string, data: UpdateProjectDetailsInput) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId
      }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    const details = await prisma.projectDetails.upsert({
      where: { projectId },
      create: {
        projectId,
        ...data
      },
      update: data,
      include: {
        project: true
      }
    })

    return details
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId
      }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    await prisma.project.delete({
      where: { id: projectId }
    })

    return { success: true }
  }
}