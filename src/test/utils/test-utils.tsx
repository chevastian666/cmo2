/**
 * Test utilities
 * By Cheva
 */
import React from 'react'
import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import type { Precinto } from '@/types/monitoring'

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
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
  
  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }

// Test helpers
export const waitForLoadingToFinish = () =>
  Promise.resolve()

// Mock navigation
export const mockNavigate = vi.fn()

// Mock user data
export const mockUser = {
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

// Mock precinto factory
export const createMockPrecinto = (overrides: Partial<Precinto> = {}): Precinto => ({
  id: '1',
  codigo: 'PRE-001',
  tipo: 'standard',
  estado: 'SAL' as const,
  fechaUltimaLectura: Date.now(),
  bateria: 100,
  gps: {
    estado: 'activo',
    precision: 10,
    satelites: 8,
    activo: true,
    señal: 90
  },
  eslinga: {
    estado: 'cerrada' as const,
    contador: 0,
    ultimoCambio: Date.now()
  },
  ubicacionActual: { 
    lat: -34.603722, 
    lng: -58.381592,
    direccion: 'Test Address'
  },
  temperatura: 20,
  ...overrides
})

