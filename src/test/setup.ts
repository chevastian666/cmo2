/**
 * Vitest setup file
 * By Cheva
 */
import '@testing-library/jest-dom'
import { cleanup} from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi} from 'vitest'
import { server} from './mocks/server'
// Establecer zona horaria para tests consistentes
process.env.TZ = 'UTC'
// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
// Mock de navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
  },
  writable: true,
})

// Mock de Google Maps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).google = {
  maps: {
    Map: vi.fn(() => ({
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      setOptions: vi.fn(),
    })),
    Marker: vi.fn(() => ({
      setPosition: vi.fn(),
      setMap: vi.fn(),
    })),
    InfoWindow: vi.fn(() => ({
      open: vi.fn(),
      close: vi.fn(),
    })),
    LatLng: vi.fn((lat, lng) => ({ lat, lng })),
    event: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
} as unknown
// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
// Mock de localStorage
const localStorageMock: Storage = (function() {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key(index: number) {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
// Mock de sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})