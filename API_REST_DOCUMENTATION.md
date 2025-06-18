# CMO REST API Documentation

## Overview
Complete REST API implementation for Centro de Monitoreo de Operaciones (CMO) with Swagger documentation, webhooks, and real-time WebSocket support.

## Features Implemented

### 1. Core API Infrastructure
- **Express.js Server**: High-performance Node.js server
- **TypeScript**: Full type safety and modern JavaScript features
- **Swagger/OpenAPI**: Interactive API documentation at `/api-docs`
- **CORS Support**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **Compression**: Response compression for better performance
- **Rate Limiting**: Configurable rate limits per endpoint

### 2. Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Refresh Tokens**: Long-lived tokens for seamless user experience
- **Role-Based Access Control**: Admin, Operator, Viewer roles
- **Company Isolation**: Multi-tenant data isolation

### 3. RESTful Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /login` - User authentication
- `POST /refresh` - Refresh access token
- `POST /logout` - Invalidate tokens

#### Precintos (`/api/v1/precintos`)
- `GET /` - List all precintos (paginated)
- `GET /:id` - Get precinto details
- `POST /` - Create new precinto
- `PUT /:id` - Update precinto
- `DELETE /:id` - Delete precinto
- `POST /:id/activate` - Activate precinto
- `POST /:id/deactivate` - Deactivate precinto
- `POST /:id/location` - Update location

#### Transits (`/api/v1/transits`)
- `GET /` - List all transits
- `GET /:id` - Get transit details
- `POST /` - Create new transit
- `PUT /:id` - Update transit
- `POST /:id/start` - Start transit
- `POST /:id/complete` - Complete transit
- `POST /:id/cancel` - Cancel transit

#### Alerts (`/api/v1/alerts`)
- `GET /` - List all alerts
- `GET /:id` - Get alert details
- `POST /` - Create alert
- `PUT /:id` - Update alert
- `POST /:id/acknowledge` - Acknowledge alert
- `POST /:id/resolve` - Resolve alert

#### Statistics (`/api/v1/statistics`)
- `GET /dashboard` - Dashboard statistics
- `GET /precintos` - Precinto statistics
- `GET /transits` - Transit statistics
- `GET /alerts` - Alert statistics
- `GET /performance` - Performance metrics

#### Webhooks (`/api/v1/webhooks`)
- `GET /` - List configured webhooks
- `POST /` - Register new webhook
- `PUT /:id` - Update webhook
- `DELETE /:id` - Delete webhook
- `POST /:id/test` - Test webhook
- `GET /:id/logs` - Get delivery logs

### 4. Webhook Events
Supported webhook events:
- `precinto.created` - New precinto created
- `precinto.updated` - Precinto updated
- `precinto.activated` - Precinto activated
- `precinto.deactivated` - Precinto deactivated
- `transit.started` - Transit started
- `transit.completed` - Transit completed
- `alert.created` - New alert generated
- `alert.resolved` - Alert resolved

### 5. WebSocket Real-time Events
Socket.IO integration for real-time updates:
- Authentication required via JWT
- Room-based subscriptions
- Events:
  - `precinto:updated` - Precinto state changes
  - `location:updated` - Location updates
  - `transit:updated` - Transit status changes
  - `alert:new` - New alerts
  - `alert:resolved` - Alert resolutions

### 6. Security Features
- **HMAC Signatures**: Webhook payload verification
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Express-validator for all inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Helmet.js security headers
- **CORS Configuration**: Whitelist-based origins

### 7. Error Handling
- Centralized error handler
- Consistent error response format
- Detailed logging with Winston
- Stack traces in development mode

### 8. Database Integration
- **Main Database**: PostgreSQL with Sequelize ORM
- **Auxiliary Database**: Secondary database support
- **Connection Pooling**: Optimized database connections
- **Migrations**: Database version control
- **Models**: TypeScript decorators

## API Usage Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cmo.com", "password": "password123"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "admin@cmo.com",
    "role": "admin"
  }
}
```

### Create Precinto
```bash
curl -X POST http://localhost:3001/api/v1/precintos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PRE-2024-001",
    "tipo": "GPS"
  }'
```

### Register Webhook
```bash
curl -X POST http://localhost:3001/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/webhook",
    "events": ["precinto.created", "alert.created"],
    "secret": "your-webhook-secret"
  }'
```

### WebSocket Connection
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  // Subscribe to precinto updates
  socket.emit('subscribe:precinto', 'precinto-id-123');
});

socket.on('precinto:updated', (data) => {
  console.log('Precinto updated:', data);
});
```

## Deployment

### Development
```bash
cd api
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Variables
See `.env.example` for all configuration options.

## Testing
```bash
# Run tests
npm test

# Test specific endpoint
curl http://localhost:3001/health
```

## Performance Optimizations
- Response caching with Redis
- Database query optimization
- Connection pooling
- Gzip compression
- Lazy loading of resources

---
By Cheva