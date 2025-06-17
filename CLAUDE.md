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