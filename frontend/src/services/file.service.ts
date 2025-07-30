import { api } from './api'

export const fileService = {
  async uploadAvatar(file: File): Promise<{ avatarUrl: string; message: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<{ avatarUrl: string; message: string }>('/files/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getAvatarUrl(filename: string): string {
    return `/api/files/avatars/${filename}`
  },

  getDocumentUrl(filename: string): string {
    return `/api/files/documents/${filename}`
  },
}