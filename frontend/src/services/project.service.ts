import { api } from './api'
import { Project, CreateProjectData, UpdateProjectData, UpdateProjectDetailsData } from '../types/project'

export const projectService = {
  async getProjects(): Promise<{ projects: Project[] }> {
    const response = await api.get<{ projects: Project[] }>('/projects')
    return response.data
  },

  async getProject(id: string): Promise<{ project: Project }> {
    const response = await api.get<{ project: Project }>(`/projects/${id}`)
    return response.data
  },

  async createProject(data: CreateProjectData): Promise<{ project: Project; message: string }> {
    const response = await api.post<{ project: Project; message: string }>('/projects', data)
    return response.data
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<{ project: Project; message: string }> {
    const response = await api.put<{ project: Project; message: string }>(`/projects/${id}`, data)
    return response.data
  },

  async updateProjectDetails(id: string, data: UpdateProjectDetailsData): Promise<{ details: any; message: string }> {
    const response = await api.put<{ details: any; message: string }>(`/projects/${id}/details`, data)
    return response.data
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/projects/${id}`)
    return response.data
  },
}