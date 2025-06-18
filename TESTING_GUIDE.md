# Guía de Testing para Componentes shadcn/ui

## Configuración Recomendada

Para agregar tests al proyecto CMO, se recomienda usar **Vitest** con **React Testing Library**.

### Instalación

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuración de Vitest

Crear `vitest.config.ts` en la raíz del proyecto:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Setup de Tests

Crear `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### Agregar Scripts a package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Ejemplos de Tests para Componentes shadcn/ui

### 1. Test de Button

```typescript
// src/components/ui/__tests__/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive');
    
    rerender(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByText('Cancel')).toHaveClass('bg-secondary');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### 2. Test de Dialog/Modal

```typescript
// src/components/ui/__tests__/dialog.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';

describe('Dialog Component', () => {
  it('shows content when open', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('hides content when closed', () => {
    render(
      <Dialog open={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when closing', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    // Click outside to close
    const overlay = document.querySelector('[data-radix-dialog-overlay]');
    if (overlay) fireEvent.click(overlay);
    
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
```

### 3. Test de Form con Validación

```typescript
// src/features/camioneros/components/__tests__/FormularioCamioneroV2.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioCamioneroV2 } from '../FormularioCamioneroV2';

describe('FormularioCamioneroV2', () => {
  const mockOnClose = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required fields', async () => {
    render(<FormularioCamioneroV2 isOpen={true} onClose={mockOnClose} />);
    
    // Submit without filling required fields
    const submitButton = screen.getByText('Registrar Camionero');
    await user.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('El documento es requerido')).toBeInTheDocument();
      expect(screen.getByText('El teléfono es requerido')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<FormularioCamioneroV2 isOpen={true} onClose={mockOnClose} />);
    
    // Fill form fields
    await user.type(screen.getByLabelText('Nombre Completo'), 'Juan Pérez');
    await user.type(screen.getByLabelText('Documento'), '12345678');
    await user.type(screen.getByLabelText('Teléfono'), '+598 99 123 456');
    await user.type(screen.getByLabelText('Email'), 'juan@example.com');
    
    // Submit form
    const submitButton = screen.getByText('Registrar Camionero');
    await user.click(submitButton);
    
    // Verify form was submitted
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
```

### 4. Test de DataTable

```typescript
// src/components/ui/data-table/__tests__/DataTableV2.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTableV2 } from '../DataTableV2';
import { ColumnDef } from '@tanstack/react-table';

interface TestData {
  id: string;
  name: string;
  status: string;
}

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

const testData: TestData[] = [
  { id: '1', name: 'Item 1', status: 'Active' },
  { id: '2', name: 'Item 2', status: 'Inactive' },
  { id: '3', name: 'Item 3', status: 'Active' },
];

describe('DataTableV2', () => {
  it('renders data correctly', () => {
    render(<DataTableV2 columns={columns} data={testData} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('filters data based on search', async () => {
    render(
      <DataTableV2 
        columns={columns} 
        data={testData} 
        searchPlaceholder="Search items..."
      />
    );
    
    const searchInput = screen.getByPlaceholder('Search items...');
    fireEvent.change(searchInput, { target: { value: 'Item 1' } });
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
  });

  it('sorts data when clicking column headers', () => {
    render(<DataTableV2 columns={columns} data={testData} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    // Verify sorting indicator appears
    expect(nameHeader.closest('button')).toHaveAttribute('aria-sort');
  });
});
```

### 5. Test de Chart Component

```typescript
// src/features/dashboard/components/__tests__/NetworkChartV2.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkChartV2 } from '../NetworkChartV2';

describe('NetworkChartV2', () => {
  const mockData = [
    { timestamp: 1234567890, value: 45 },
    { timestamp: 1234567950, value: 52 },
  ];

  it('renders chart with title', () => {
    render(
      <NetworkChartV2 
        data={mockData} 
        title="Test Chart"
        type="line"
      />
    );
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders with correct chart type', () => {
    const { container } = render(
      <NetworkChartV2 
        data={mockData} 
        title="Area Chart"
        type="area"
      />
    );
    
    // Check for area chart specific elements
    const areaElement = container.querySelector('path[fill]');
    expect(areaElement).toBeInTheDocument();
  });

  it('shows correct data count in description', () => {
    render(
      <NetworkChartV2 
        data={mockData} 
        title="Test Chart"
      />
    );
    
    expect(screen.getByText('Últimas 2 lecturas')).toBeInTheDocument();
  });
});
```

## Mejores Prácticas

### 1. Estructura de Tests

```
src/
  components/
    ui/
      button.tsx
      __tests__/
        button.test.tsx
  features/
    [feature]/
      components/
        Component.tsx
        __tests__/
          Component.test.tsx
```

### 2. Nombrado de Tests

- Usar descripciones claras y en presente
- Agrupar tests relacionados con `describe`
- Usar `it` o `test` para casos individuales

### 3. Testing de Accesibilidad

```typescript
it('has proper ARIA labels', () => {
  render(
    <Button size="icon" aria-label="Delete item">
      <Trash className="h-4 w-4" />
    </Button>
  );
  
  expect(screen.getByLabelText('Delete item')).toBeInTheDocument();
});
```

### 4. Mocking de Servicios

```typescript
// Mock de servicios
vi.mock('@/services/notification.service', () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
```

### 5. Testing de Estados de Carga

```typescript
it('shows skeleton while loading', () => {
  render(<MyComponent loading={true} />);
  
  expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
});
```

## Utils de Testing Personalizados

### Render con Providers

```typescript
// src/test/utils.tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar tests de un archivo específico
npm test button.test.tsx
```

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Nota**: Esta guía proporciona ejemplos de cómo se pueden testear los componentes shadcn/ui. Para implementar los tests, primero es necesario instalar y configurar las dependencias mencionadas.