# CMO Project Documentation

## API Integration Status

The CMO system has been prepared to consume data from two databases:

### Database Structure
1. **Main Database (trokor)** - Primary operational data
   - precintos (electronic seals)
   - precinto_viaje (trips)
   - alarm_system (alarms)
   - empresas (companies)
   - app_user (users)
   - precinto_location (locations)

2. **Auxiliary Database (satoshi)** - Customs and administrative data
   - aduana (customs records)
   - DUA (customs declarations)
   - alerts
   - offices

### API Services Created

1. **maindb.service.ts** - Handles main database operations
2. **auxdb.service.ts** - Handles auxiliary database operations  
3. **unified.service.ts** - Combines both databases with business logic

### Updated Services
All feature services have been updated to use the unified API service:
- precintos.service.ts
- transitos.service.ts
- alertas.service.ts
- estadisticas.service.ts
- torreControl.service.ts

### Development Mode
Services check `import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API` to determine whether to use mock data or real API calls.

To enable real API calls in development:
```bash
VITE_USE_REAL_API=true npm run dev
```

### Pending Tasks
1. Configure actual API endpoints in environment variables
2. Test database synchronization functionality
3. Implement real-time updates via WebSocket
4. Add comprehensive error handling for production

## Linting and Type Checking Commands
```bash
npm run lint
npm run typecheck
```

## UI Component Library - shadcn/ui

### Installation Status
shadcn/ui has been successfully integrated with the following configuration:
- Style: New York
- Base color: Neutral (customized to match dark theme)
- CSS Variables: Enabled
- Components path: `@/components/ui`

### Available Components
Core components installed:
- **Button** - Multiple variants (default, secondary, destructive, outline, ghost, link)
- **Input** - Form inputs with consistent styling
- **Select** - Dropdown selectors with search
- **Dialog** - Accessible modals
- **Card** - Content containers with header/footer
- **Badge** - Status indicators
- **Tabs** - Tab navigation
- **Alert** - Notification messages
- **Form** - React Hook Form integration
- **Label**, **Textarea**, **Checkbox**, **Radio Group**, **Switch**

### Migration Examples
Three components have been migrated as examples:
1. **AlertaDetalleModalV2** - Modal using Dialog component
2. **AlertsTableV2** - Table with shadcn/ui Buttons and Badges
3. **ArmFormV2** - Form with react-hook-form and shadcn/ui components

### Theme Configuration
The dark theme has been configured in `src/index.css` to match the existing CMO design:
- Background: gray-900 equivalent
- Cards: gray-800 equivalent
- Borders: gray-700 equivalent
- Primary: Blue theme
- Destructive: Red for errors/warnings

### Usage
Import components from `@/components/ui`:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
```

### Demo
View the component showcase at `/demo` route.

## Key Features Implemented
- Server-side pagination for large datasets
- Response caching with TTL
- API retry logic with exponential backoff
- Skeleton loaders during data fetching
- React.memo optimization for performance
- Unified error handling across services

## Mock Data
All services fall back to mock data when:
1. In development mode without VITE_USE_REAL_API flag
2. API calls fail
3. No data is returned from API

This ensures the application remains functional during development and testing.

By Cheva