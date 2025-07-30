import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      message: 'Login successful',
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        isActive: true,
        twoFactorEnabled: false,
        avatarUrl: null
      },
      token: 'mock-jwt-token'
    })
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      message: 'User registered successfully',
      user: {
        id: '2',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        phone: '+1234567891',
        isActive: true,
        twoFactorEnabled: false,
        avatarUrl: null
      }
    })
  }),

  http.get('/api/auth/profile', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        isActive: true,
        twoFactorEnabled: false,
        avatarUrl: null
      }
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      message: 'Logout successful'
    })
  }),

  // Project endpoints
  http.get('/api/projects', () => {
    return HttpResponse.json({
      projects: [
        {
          id: '1',
          name: 'Test Project 1',
          description: 'First test project',
          userId: '1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          details: {
            id: '1',
            projectId: '1'
          }
        },
        {
          id: '2',
          name: 'Test Project 2',
          description: 'Second test project',
          userId: '1',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          details: {
            id: '2',
            projectId: '2'
          }
        }
      ]
    })
  }),

  http.post('/api/projects', () => {
    return HttpResponse.json({
      message: 'Project created successfully',
      project: {
        id: '3',
        name: 'New Project',
        description: 'A new project',
        userId: '1',
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
        details: {
          id: '3',
          projectId: '3'
        }
      }
    })
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      project: {
        id,
        name: `Project ${id}`,
        description: `Description for project ${id}`,
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        details: {
          id: `${id}-details`,
          projectId: id
        }
      }
    })
  }),

  http.put('/api/projects/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      message: 'Project updated successfully',
      project: {
        id,
        name: 'Updated Project',
        description: 'Updated description',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
        details: {
          id: `${id}-details`,
          projectId: id
        }
      }
    })
  }),

  http.delete('/api/projects/:id', () => {
    return HttpResponse.json({
      success: true
    })
  }),

  // File endpoints
  http.post('/api/files/avatar', () => {
    return HttpResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: '/api/files/avatars/mock-avatar.jpg'
    })
  }),

  http.get('/api/files/avatars/:filename', () => {
    // Return a mock image response
    return new HttpResponse(new Uint8Array([]), {
      headers: {
        'Content-Type': 'image/jpeg'
      }
    })
  }),

  // 2FA endpoints
  http.post('/api/auth/2fa/generate', () => {
    return HttpResponse.json({
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/png;base64,mock-qr-code'
    })
  }),

  http.post('/api/auth/2fa/enable', () => {
    return HttpResponse.json({
      success: true
    })
  }),

  http.post('/api/auth/2fa/disable', () => {
    return HttpResponse.json({
      success: true
    })
  })
]