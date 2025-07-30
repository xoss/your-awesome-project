import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/utils'
import LoginPage from '../LoginPage'
import { useAuthStore } from '../../store/auth.store'
import * as authService from '../../services/auth.service'

// Mock dependencies
vi.mock('../../store/auth.store')
vi.mock('../../services/auth.service')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  const mockLogin = vi.fn()
  const mockAuthService = authService.authService as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockLogin.mockClear()
    
    // Mock useAuthStore
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      logout: vi.fn(),
      login: mockLogin,
      isAuthenticated: false,
      token: null,
    })

    // Mock authService.login
    mockAuthService.login = vi.fn()
  })

  it('renders login form correctly', () => {
    render(<LoginPage />)

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText('Don\'t have an account? Sign up')).toBeInTheDocument()
  })

  it('handles successful login without 2FA', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      },
      token: 'mock-jwt-token'
    }

    mockAuthService.login.mockResolvedValue(mockResponse)

    render(<LoginPage />)

    // Fill out form
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockLogin).toHaveBeenCalledWith(mockResponse.user, mockResponse.token)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('handles 2FA requirement', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      requiresTwoFactor: true,
      message: 'Please provide 2FA code'
    }

    mockAuthService.login.mockResolvedValue(mockResponse)

    render(<LoginPage />)

    // Fill out initial form
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    // Should show 2FA input field
    await waitFor(() => {
      expect(screen.getByPlaceholderText('2FA Code')).toBeInTheDocument()
    })

    // Fill 2FA code and submit again
    const successResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      },
      token: 'mock-jwt-token'
    }

    mockAuthService.login.mockResolvedValue(successResponse)

    await user.type(screen.getByPlaceholderText('2FA Code'), '123456')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenLastCalledWith({
        email: 'test@example.com',
        password: 'password123',
        totpCode: '123456'
      })
      expect(mockLogin).toHaveBeenCalledWith(successResponse.user, successResponse.token)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('displays validation errors for invalid input', async () => {
    const user = userEvent.setup()
    
    render(<LoginPage />)

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('displays login error message', async () => {
    const user = userEvent.setup()
    const errorResponse = {
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    }

    mockAuthService.login.mockRejectedValue(errorResponse)

    render(<LoginPage />)

    // Fill out form with valid data
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('displays generic error message for unknown errors', async () => {
    const user = userEvent.setup()
    
    mockAuthService.login.mockRejectedValue(new Error('Network error'))

    render(<LoginPage />)

    // Fill out form
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument()
    })
  })

  it('disables submit button during login request', async () => {
    const user = userEvent.setup()
    
    // Make login hang to test loading state
    mockAuthService.login.mockImplementation(() => new Promise(() => {}))

    render(<LoginPage />)

    // Fill out form
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    // Button should be disabled and show loading text
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Signing in...' })
      expect(submitButton).toBeDisabled()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    
    render(<LoginPage />)

    // Enter short password
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), '123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('limits 2FA code input to 6 characters', async () => {
    const user = userEvent.setup()
    
    // First trigger 2FA requirement
    mockAuthService.login.mockResolvedValue({
      requiresTwoFactor: true,
      message: 'Please provide 2FA code'
    })

    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('2FA Code')).toBeInTheDocument()
    })

    const twoFAInput = screen.getByPlaceholderText('2FA Code')
    expect(twoFAInput).toHaveAttribute('maxLength', '6')
  })

  it('has proper form accessibility', () => {
    render(<LoginPage />)

    // Check form structure and inputs are accessible
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
    
    // Check that inputs have proper IDs for accessibility
    expect(emailInput).toHaveAttribute('id', 'email')
    expect(passwordInput).toHaveAttribute('id', 'password')
  })

  it('navigation link to register page works', () => {
    render(<LoginPage />)

    const registerLink = screen.getByText('Don\'t have an account? Sign up')
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('handles form submission with Enter key', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      user: { id: '1', email: 'test@example.com' },
      token: 'mock-token'
    }

    mockAuthService.login.mockResolvedValue(mockResponse)

    render(<LoginPage />)

    // Fill form and press Enter
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})