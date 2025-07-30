export interface Project {
  id: string
  name: string
  description: string | null
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  userId: string
  details: ProjectDetails | null
  createdAt: string
  updatedAt: string
}

export interface ProjectDetails {
  id: string
  firstName: string | null
  lastName: string | null
  birthday: string | null
  street: string | null
  houseNumber: string | null
  zipCode: string | null
  city: string | null
  country: string | null
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectData {
  name: string
  description?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
}

export interface UpdateProjectDetailsData {
  firstName?: string
  lastName?: string
  birthday?: string
  street?: string
  houseNumber?: string
  zipCode?: string
  city?: string
  country?: string
}