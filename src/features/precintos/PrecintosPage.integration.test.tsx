/**
 * PrecintosPage Integration Tests
 * By Cheva
 */
import { describe, it, expect, beforeEach, vi} from 'vitest';
import { render, screen, waitFor, within} from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { PrecintosPage} from './PrecintosPage';
import { server} from '@/test/mocks/server';
import { http, HttpResponse} from 'msw';
import { createMockPrecinto} from '@/test/utils/test-utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

describe('PrecintosPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays precintos on mount', async () => {
    render(<PrecintosPage />);
    
    // Should show loading state initially
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });
    
    // Should display precintos
    const precintoCards = screen.getAllByTestId('precinto-card');
    expect(precintoCards.length).toBeGreaterThan(0);
  });

  it('filters precintos by search term', async () => {
    const mockPrecintos = [
      createMockPrecinto({ id: '1', codigo: 'PRE-001', empresa: 'Empresa A' }),
      createMockPrecinto({ id: '2', codigo: 'PRE-002', empresa: 'Empresa B' }),
      createMockPrecinto({ id: '3', codigo: 'PRE-003', empresa: 'Empresa A' }),
    ];

    server.use(http.get(`${API_URL}/precintos`, () => {
        return HttpResponse.json({
          data: mockPrecintos,
          pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
        });
      })
    );

    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('precinto-card')).toHaveLength(3);
    });
    
    // Search for specific codigo
    const searchInput = screen.getByPlaceholderText(/buscar/i);
    await user.type(searchInput, 'PRE-002');
    
    await waitFor(() => {
      const visibleCards = screen.getAllByTestId('precinto-card').filter(
        el => !el.classList.contains('hidden')
      );
      expect(visibleCards).toHaveLength(1);
      expect(within(visibleCards[0]).getByText('PRE-002')).toBeInTheDocument();
    });
  });

  it('filters precintos by estado', async () => {
    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });
    
    // Open filter dropdown
    const filterButton = screen.getByRole('button', { name: /filtrar/i });
    await user.click(filterButton);
    
    // Select "Activo" estado
    const activoOption = screen.getByRole('option', { name: /activo/i });
    await user.click(activoOption);
    
    // Apply filter
    const applyButton = screen.getByRole('button', { name: /aplicar/i });
    await user.click(applyButton);
    
    // Verify filtered results
    await waitFor(() => {
      const precintoCards = screen.getAllByTestId('precinto-card');
      precintoCards.forEach(card => {
        expect(within(card).getByText(/activo/i)).toBeInTheDocument();
      });
    });
  });

  it('handles pagination correctly', async () => {
    // Mock paginated response
    server.use(http.get(`${API_URL}/precintos`, ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        
        const mockData = Array.from({ length: 10 }, (_, i) => 
          createMockPrecinto({ 
            id: `${page}-${i}`, 
            codigo: `PRE-${page}${i.toString().padStart(2, '0')}` 
          })
        );
        
        return HttpResponse.json({
          data: mockData,
          pagination: { page, limit: 10, total: 25, totalPages: 3 },
        });
      })
    );

    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
    });
    
    // Go to next page
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText(/página 2 de 3/i)).toBeInTheDocument();
      expect(screen.getByText('PRE-200')).toBeInTheDocument();
    });
  });

  it('creates new precinto', async () => {
    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });
    
    // Open create modal
    const createButton = screen.getByRole('button', { name: /nuevo precinto/i });
    await user.click(createButton);
    
    // Fill form
    const modal = screen.getByRole('dialog');
    const codigoInput = within(modal).getByLabelText(/código/i);
    const empresaInput = within(modal).getByLabelText(/empresa/i);
    const descripcionInput = within(modal).getByLabelText(/descripción/i);
    
    await user.type(codigoInput, 'PRE-NEW');
    await user.type(empresaInput, 'Nueva Empresa');
    await user.type(descripcionInput, 'Nuevo precinto de prueba');
    
    // Submit
    const submitButton = within(modal).getByRole('button', { name: /crear/i });
    await user.click(submitButton);
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/precinto creado exitosamente/i)).toBeInTheDocument();
    });
    
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('activates precinto', async () => {
    const mockPrecinto = createMockPrecinto({ 
      id: '1', 
      codigo: 'PRE-001', 
      estado: 'inactivo' 
    });

    server.use(http.get(`${API_URL}/precintos`, () => {
        return HttpResponse.json({
          data: [mockPrecinto],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      }),
      http.post(`${API_URL}/precintos/:id/activar`, ({ params }) => {
        return HttpResponse.json({
          data: { ...mockPrecinto, id: params.id, estado: 'activo' },
        });
      })
    );

    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('PRE-001')).toBeInTheDocument();
    });
    
    // Click activate button
    const activateButton = screen.getByRole('button', { name: /activar/i });
    await user.click(activateButton);
    
    // Confirm activation
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    await user.click(confirmButton);
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/precinto activado/i)).toBeInTheDocument();
      expect(screen.getByText(/activo/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(http.get(`${API_URL}/precintos`, () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        );
      })
    );

    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error al cargar precintos/i)).toBeInTheDocument();
    });
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('exports precintos data', async () => {
    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });
    
    // Open export menu
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    await user.click(exportButton);
    
    // Mock successful export
    server.use(http.get(`${API_URL}/precintos/export`, () => {
        return new HttpResponse('csv data', {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="precintos.csv"',
          },
        });
      })
    );
    
    // Click CSV option
    const csvOption = screen.getByRole('menuitem', { name: /csv/i });
    await user.click(csvOption);
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/exportación completada/i)).toBeInTheDocument();
    });
  });

  it('updates precinto details', async () => {
    const mockPrecinto = createMockPrecinto({ 
      id: '1', 
      codigo: 'PRE-001',
      descripcion: 'Descripción original'
    });

    server.use(http.get(`${API_URL}/precintos`, () => {
        return HttpResponse.json({
          data: [mockPrecinto],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      })
    );

    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('PRE-001')).toBeInTheDocument();
    });
    
    // Click edit button
    const editButton = screen.getByRole('button', { name: /editar/i });
    await user.click(editButton);
    
    // Update description in modal
    const modal = screen.getByRole('dialog');
    const descripcionInput = within(modal).getByLabelText(/descripción/i);
    
    await user.clear(descripcionInput);
    await user.type(descripcionInput, 'Nueva descripción');
    
    // Submit
    const saveButton = within(modal).getByRole('button', { name: /guardar/i });
    await user.click(saveButton);
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/actualizado exitosamente/i)).toBeInTheDocument();
    });
  });

  it('shows precinto details in modal', async () => {
    const mockPrecinto = createMockPrecinto({ 
      id: '1', 
      codigo: 'PRE-001',
      empresa: 'Test Company',
      ubicacion_actual: { lat: -34.603722, lng: -58.381592 },
      bateria: 85,
      temperatura: 25.5
    });

    server.use(http.get(`${API_URL}/precintos`, () => {
        return HttpResponse.json({
          data: [mockPrecinto],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      }),
      http.get(`${API_URL}/precintos/:id`, ({ params }) => {
        return HttpResponse.json({
          data: { ...mockPrecinto, id: params.id },
        });
      })
    );

    const user = userEvent.setup();
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('PRE-001')).toBeInTheDocument();
    });
    
    // Click on precinto card
    const precintoCard = screen.getByTestId('precinto-card');
    await user.click(precintoCard);
    
    // Verify modal content
    const modal = screen.getByRole('dialog');
    expect(within(modal).getByText('PRE-001')).toBeInTheDocument();
    expect(within(modal).getByText('Test Company')).toBeInTheDocument();
    expect(within(modal).getByText(/85%/)).toBeInTheDocument(); // Battery
    expect(within(modal).getByText(/25.5°C/)).toBeInTheDocument(); // Temperature
  });
});