/**
 * Testing utilities and custom render
 * By Cheva
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

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
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  queryClient?: QueryClient;
}

export const customRender = (
  ui: ReactElement,
  {
    route = '/',
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  window.history.pushState(_, 'Test page', route);

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };

// Test helpers
export const waitForLoadingToFinish = () =>
  screen.findByText((content, element) => {
    return !element?.className?.includes('loading');
  });

// Mock navigation
export const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Zustand stores
export const createMockStore = (initialState: unknown) => {
  return {
    getState: () => initialState,
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  };
};

// Date helpers for consistent testing
export const TEST_DATE = new Date('2024-01-01T00:00:00.000Z');

// Mock auth context
export const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@cmo.com',
    nombre: 'Test User',
    rol: 'admin',
    permisos: ['cmo:access', 'cmo:admin'],
  },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  canAccess: vi.fn(() => true),
  canAccessCMO: vi.fn(() => true),
};

// Mock WebSocket
export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView) {
    // Mock implementation
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

global.WebSocket = MockWebSocket as unknown;

// Helper to create mock data
export const createMockPrecinto = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  codigo: 'PRE-001',
  estado: 'activo',
  empresa: 'Test Company',
  descripcion: 'Test precinto',
  fecha_activacion: TEST_DATE.toISOString(),
  ubicacion_actual: { lat: -34.603722, lng: -58.381592 },
  bateria: 85,
  temperatura: 25.5,
  ...overrides,
});

export const createMockTransito = (overrides = {}) => ({
  id: '1',
  codigo: 'TRN-001',
  estado: 'en_curso',
  origen: 'Buenos Aires',
  destino: 'Córdoba',
  fecha_inicio: TEST_DATE.toISOString(),
  fecha_estimada: new Date(TEST_DATE.getTime() + 86400000).toISOString(),
  progreso: 45,
  camion: {
    patente: 'ABC123',
    marca: 'Mercedes',
    modelo: 'Actros',
  },
  conductor: {
    nombre: 'Juan Pérez',
    documento: '12345678',
  },
  ...overrides,
});

export const createMockAlerta = (overrides = {}) => ({
  id: '1',
  tipo: 'temperatura',
  severidad: 'alta',
  mensaje: 'Temperatura fuera de rango',
  fecha: TEST_DATE.toISOString(),
  precinto_id: '1',
  estado: 'activa',
  ...overrides,
});