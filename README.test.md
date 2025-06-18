# Testing Documentation - CMO Project

## Overview
This project has a comprehensive testing strategy covering unit tests, integration tests, and end-to-end tests.

## Test Structure

```
src/
├── test/                    # Test utilities and setup
│   ├── setup.ts            # Vitest setup with mocks
│   ├── mocks/              # MSW request handlers
│   └── utils/              # Test utilities and helpers
├── components/             # Component tests (*.test.tsx)
├── services/               # Service tests (*.test.ts)
├── features/               # Integration tests (*.integration.test.tsx)
└── store/                  # Store tests (*.test.ts)

e2e/
├── fixtures/               # Playwright fixtures
├── pages/                  # Page Object Models
└── tests/                  # E2E test specs
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

### All Tests
```bash
# Run linting, unit tests, and E2E tests
npm run test:all
```

## Test Categories

### 1. Unit Tests
- **Components**: Testing UI components in isolation
  - Button, Card, Form components
  - Custom hooks
  - Utility functions
- **Services**: Testing API services with MSW
  - Request/response handling
  - Error scenarios
  - Data transformations
- **Stores**: Testing Zustand stores
  - State updates
  - Actions
  - Selectors

### 2. Integration Tests
- **Page Components**: Testing feature pages with all dependencies
  - Data fetching
  - User interactions
  - State management
- **API Integration**: Testing service integration
  - Real API calls (in CI)
  - Mock responses (local)

### 3. E2E Tests
- **User Flows**: Testing complete user journeys
  - Authentication flow
  - CRUD operations
  - Multi-page workflows
- **Critical Paths**: Testing business-critical features
  - Precinto lifecycle
  - Alert management
  - Export functionality

## Test Configuration

### Vitest Configuration
- Environment: `jsdom`
- Coverage: V8 provider
- Setup: Global mocks and test utilities

### Playwright Configuration
- Browsers: Chromium, Firefox, WebKit
- Mobile viewports: Pixel 5, iPhone 12
- Trace and video on failure
- Automatic retries on CI

### MSW (Mock Service Worker)
- Intercepts API calls in tests
- Provides consistent mock data
- Handles error scenarios

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Integration Test Example
```typescript
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { PrecintosPage } from './PrecintosPage';

describe('PrecintosPage Integration', () => {
  it('loads and displays precintos', async () => {
    render(<PrecintosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('PRE-001')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('create new precinto', async ({ page }) => {
  await page.goto('/precintos');
  await page.click('button:has-text("Nuevo Precinto")');
  await page.fill('input[name="codigo"]', 'PRE-TEST');
  await page.click('button:has-text("Crear")');
  
  await expect(page.locator('text=creado exitosamente')).toBeVisible();
});
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests

GitHub Actions workflow includes:
1. Linting and type checking
2. Unit and integration tests
3. E2E tests on multiple browsers
4. Build verification
5. Lighthouse performance tests

## Best Practices

1. **Isolation**: Tests should not depend on each other
2. **Mocking**: Use MSW for API mocking, avoid manual mocks
3. **Fixtures**: Use consistent test data via fixtures
4. **Page Objects**: Use Page Object Model for E2E tests
5. **Coverage**: Aim for >80% coverage on critical paths
6. **Performance**: Keep tests fast and focused

## Debugging

### Vitest
- Use `test.only` to run single test
- Use `--reporter=verbose` for detailed output
- Use VS Code Vitest extension for debugging

### Playwright
- Use `--debug` flag for step-by-step debugging
- Use `page.pause()` to pause execution
- View traces in Playwright Trace Viewer

## Coverage Reports

Coverage reports are generated in:
- `coverage/` - HTML coverage report
- Open with: `npx vite preview --outDir coverage`

## Common Issues

1. **Flaky Tests**: Use proper waitFor assertions
2. **Timeout Errors**: Increase timeout for slow operations
3. **State Pollution**: Reset stores between tests
4. **Mock Conflicts**: Clear mocks in beforeEach

By Cheva