import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '../../components/Navigation'

describe('Navigation', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  const baseProps = {
    isDark: false,
    onThemeToggle: () => {},
    isAuthenticated: true,
    isAdmin: false,
    onSignOut: () => {},
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    } as any,
  }

  it('renders all navigation buttons', () => {
    render(<Navigation viewMode="form" {...baseProps} />)

    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Create CV')).toBeInTheDocument()
    expect(screen.getByText('My CVs')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('highlights active introduction button', () => {
    render(<Navigation viewMode="introduction" {...baseProps} />)

    const introductionButton = screen.getByText('Introduction')
    expect(introductionButton).toHaveClass('bg-blue-600')
  })

  it('highlights active form button', () => {
    render(<Navigation viewMode="form" {...baseProps} />)

    const createButton = screen.getByText('Create CV')
    expect(createButton).toHaveClass('bg-blue-600')
  })

  it('highlights active list button', () => {
    render(<Navigation viewMode="list" {...baseProps} />)

    const listButton = screen.getByText('My CVs')
    expect(listButton).toHaveClass('bg-blue-600')
  })

  it('highlights active profile button', () => {
    render(<Navigation viewMode="profile" {...baseProps} />)

    const profileButton = screen.getByText('Profile')
    expect(profileButton).toHaveClass('bg-blue-600')
  })

  it('shows Edit CV label in edit mode', () => {
    render(<Navigation viewMode="edit" {...baseProps} />)

    expect(screen.getByText('Edit CV')).toBeInTheDocument()
  })

  it('calls onThemeToggle when theme button clicked', async () => {
    const user = userEvent.setup()
    const onThemeToggle = vi.fn()
    render(<Navigation viewMode="form" {...baseProps} onThemeToggle={onThemeToggle} />)

    const themeButton = screen.getByText('Dark mode')
    await act(async () => {
      await user.click(themeButton)
    })

    expect(onThemeToggle).toHaveBeenCalledOnce()
  })

  it('displays Light mode when dark', () => {
    render(<Navigation viewMode="form" {...baseProps} isDark={true} />)

    expect(screen.getByText('Light mode')).toBeInTheDocument()
  })

  it('navigates to form when Create CV clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation viewMode="list" {...baseProps} />)

    const createButton = screen.getByText('Create CV')
    await act(async () => {
      await user.click(createButton)
    })

    expect(window.location.hash).toBe('#form')
  })

  it('navigates to list when My CVs clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation viewMode="form" {...baseProps} />)

    const listButton = screen.getByText('My CVs')
    await act(async () => {
      await user.click(listButton)
    })

    expect(window.location.hash).toBe('#list')
  })

  it('navigates to profile when Profile clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation viewMode="form" {...baseProps} />)

    const profileButton = screen.getByText('Profile')
    await act(async () => {
      await user.click(profileButton)
    })

    expect(window.location.hash).toBe('#profile')
  })

  it('navigates to introduction when Introduction clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation viewMode="form" {...baseProps} />)

    const introductionButton = screen.getByText('Introduction')
    await act(async () => {
      await user.click(introductionButton)
    })

    expect(window.location.hash).toBe('#introduction')
  })

  it('calls onSignOut when sign out button clicked', async () => {
    const user = userEvent.setup()
    const onSignOut = vi.fn().mockResolvedValue(undefined)
    render(<Navigation viewMode="form" {...baseProps} onSignOut={onSignOut} />)

    // Open the user dropdown menu
    const userMenuButton = screen.getByText('Test User')
    await act(async () => {
      await user.click(userMenuButton)
    })

    // Now click the sign out button
    const signOutButton = screen.getByText('Sign out')
    await act(async () => {
      await user.click(signOutButton)
    })

    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
