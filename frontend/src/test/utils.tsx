import React, { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Test utilities for rendering components with providers

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  queryClient?: QueryClient
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

const AllTheProviders = ({ 
  children, 
  initialEntries = ['/'],
  queryClient = createTestQueryClient()
}: {
  children: ReactNode
  initialEntries?: string[]
  queryClient?: QueryClient
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries, queryClient, ...renderOptions } = options
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders 
      initialEntries={initialEntries}
      queryClient={queryClient}
    >
      {children}
    </AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock user for testing
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
  isActive: true,
  twoFactorEnabled: false,
  avatarUrl: null
}

// Mock project for testing
export const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'A test project',
  userId: '1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  details: {
    id: '1',
    projectId: '1'
  }
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render, createTestQueryClient }