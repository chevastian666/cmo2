/**
 * Test utilities
 * By Cheva
 */
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Create a custom render that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  queryClient?: QueryClient
}

const customRender = (
  ui: ReactElement,
  {
    route = '/',
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  window.history.pushState({}, 'Test page', route)
  
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={_queryClient}>
        <BrowserRouter>
          {_children}
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
  
  return render(_ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }

// Test helpers
const waitForLoadingToFinish = () =>
  Promise.resolve()

// Mock navigation
const mockNavigate = vi.fn()

// Mock user data
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin'
}

// Mock auth
export const mockAuth = {
  user: mockUser,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  hasPermission: vi.fn(() => true)
}

// Export test helpers
export { waitForLoadingToFinish, mockNavigate, mockUser }