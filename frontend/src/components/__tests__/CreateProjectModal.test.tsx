import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createTestQueryClient } from '../../test/utils'
import CreateProjectModal from '../CreateProjectModal'
import * as projectService from '../../services/project.service'

// Mock the project service
vi.mock('../../services/project.service')

describe('CreateProjectModal', () => {
  const mockOnClose = vi.fn()
  const mockProjectService = projectService.projectService as any
  let queryClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnClose.mockClear()
    queryClient = createTestQueryClient()
    
    // Mock projectService.createProject
    mockProjectService.createProject = vi.fn()
  })

  it('renders modal when open', () => {
    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('does not render modal when closed', () => {
    render(
      <CreateProjectModal isOpen={false} onClose={mockOnClose} />,
      { queryClient }
    )

    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
  })

  it('creates project successfully', async () => {
    const user = userEvent.setup()
    const mockProject = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      userId: '1'
    }

    mockProjectService.createProject.mockResolvedValue({
      message: 'Project created successfully',
      project: mockProject
    })

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill out form
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')
    await user.type(screen.getByLabelText('Description (optional)'), 'Test Description')

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(mockProjectService.createProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description'
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('creates project without description', async () => {
    const user = userEvent.setup()
    const mockProject = {
      id: '1',
      name: 'Test Project',
      userId: '1'
    }

    mockProjectService.createProject.mockResolvedValue({
      message: 'Project created successfully',
      project: mockProject
    })

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill only name field
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(mockProjectService.createProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: ''
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('displays validation error for empty name', async () => {
    const user = userEvent.setup()

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Try to submit without filling name
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument()
    })

    // Should not call service or close modal
    expect(mockProjectService.createProject).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('displays validation error for name too long', async () => {
    const user = userEvent.setup()

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill name with more than 100 characters
    const longName = 'a'.repeat(101)
    await user.type(screen.getByLabelText('Project Name'), longName)
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(screen.getByText('String must contain at most 100 character(s)')).toBeInTheDocument()
    })
  })

  it('displays validation error for description too long', async () => {
    const user = userEvent.setup()

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill valid name and long description
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')
    const longDescription = 'a'.repeat(501)
    await user.type(screen.getByLabelText('Description (optional)'), longDescription)
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(screen.getByText('String must contain at most 500 character(s)')).toBeInTheDocument()
    })
  })

  it('displays error message on creation failure', async () => {
    const user = userEvent.setup()
    const errorResponse = {
      response: {
        data: {
          error: 'Project creation failed'
        }
      }
    }

    mockProjectService.createProject.mockRejectedValue(errorResponse)

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill and submit form
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(screen.getByText('Project creation failed')).toBeInTheDocument()
    })

    // Should not close modal on error
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('displays generic error message for unknown errors', async () => {
    const user = userEvent.setup()

    mockProjectService.createProject.mockRejectedValue(new Error('Network error'))

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill and submit form
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to create project')).toBeInTheDocument()
    })
  })

  it('closes modal when clicking cancel button', async () => {
    const user = userEvent.setup()

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when clicking close button', async () => {
    const user = userEvent.setup()

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    const closeButton = screen.getByRole('button', { name: 'Close' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('resets form when modal is closed', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill form
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')
    await user.type(screen.getByLabelText('Description (optional)'), 'Test Description')

    // Close modal
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    // Reopen modal
    rerender(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)

    // Form should be reset
    expect(screen.getByLabelText('Project Name')).toHaveValue('')
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('')
  })

  it('disables submit button during creation', async () => {
    const user = userEvent.setup()

    // Make createProject hang to test loading state
    mockProjectService.createProject.mockImplementation(() => new Promise(() => {}))

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill and submit form
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    // Button should be disabled and show loading text
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Creating...' })
      expect(submitButton).toBeDisabled()
    })
  })

  it('handles form submission with Enter key', async () => {
    const user = userEvent.setup()
    const mockProject = {
      id: '1',
      name: 'Test Project',
      userId: '1'
    }

    mockProjectService.createProject.mockResolvedValue({
      message: 'Project created successfully',
      project: mockProject
    })

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill form and press Enter
    const nameInput = screen.getByLabelText('Project Name')
    await user.type(nameInput, 'Test Project')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockProjectService.createProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: ''
      })
    })
  })

  it('invalidates projects query on successful creation', async () => {
    const user = userEvent.setup()
    const mockProject = {
      id: '1',
      name: 'Test Project',
      userId: '1'
    }

    mockProjectService.createProject.mockResolvedValue({
      message: 'Project created successfully',
      project: mockProject
    })

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Fill and submit form
    await user.type(screen.getByLabelText('Project Name'), 'Test Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['projects'] })
    })
  })

  it('has proper accessibility attributes', () => {
    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} />,
      { queryClient }
    )

    // Check dialog has proper role
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // Check form elements have proper labels
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument()

    // Check close button has screen reader text
    expect(screen.getByText('Close')).toHaveClass('sr-only')
  })
})