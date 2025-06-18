# CMO REST API

Complete REST API with webhooks and Swagger documentation for the CMO system.

## Features

- **RESTful Endpoints** for all entities (precintos, transitos, alertas)
- **Webhook System** for real-time event notifications
- **Swagger/OpenAPI** interactive documentation
- **JWT Authentication** with refresh tokens
- **API Key Authentication** for external systems
- **Rate Limiting** to prevent abuse
- **WebSocket Support** for real-time updates
- **Comprehensive Error Handling**
- **Request Validation** with Joi
- **Logging System** with Winston
- **Database Integration** with Sequelize

## Installation

```bash
cd api
npm install
cp .env.example .env
# Edit .env with your configuration
```

## Running the API

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

Once running, access the interactive Swagger documentation at:
- http://localhost:3001/api-docs

## Authentication

### JWT Authentication
Used for web clients:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Include the token in subsequent requests:
```http
Authorization: Bearer <token>
```

### API Key Authentication
Used for external systems:
```http
X-API-Key: your-api-key
```

## Webhooks

### Registering a Webhook
```http
POST /api/v1/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-system.com/webhook",
  "events": ["alerta.created", "transito.started"],
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

### Available Events
- `alerta.created` - New alert created
- `alerta.updated` - Alert status changed
- `transito.started` - Transit started
- `transito.completed` - Transit completed
- `transito.delayed` - Transit delayed
- `precinto.tampered` - Tampering detected

### Webhook Security
All webhooks are signed with HMAC-SHA256. Verify the signature:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- API Key: 60 requests per minute

## WebSocket Events

Connect to receive real-time updates:

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

// Subscribe to precinto updates
socket.emit('subscribe', 'precinto:123');

// Listen for location updates
socket.on('location:update', (data) => {
  console.log('Location updated:', data);
});

// Listen for new alerts
socket.on('alerta:new', (alert) => {
  console.log('New alert:', alert);
});
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human readable message",
  "details": {},
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

## Environment Variables

Key configuration options:

- `PORT` - API port (default: 3001)
- `JWT_SECRET` - Secret for JWT signing
- `API_KEY` - API key for external access
- `DB_MAIN_*` - Main database configuration
- `DB_AUX_*` - Auxiliary database configuration
- `REDIS_*` - Redis configuration (optional)
- `WEBHOOK_*` - Webhook configuration

## API Endpoints Overview

### Precintos
- `GET /api/v1/precintos` - List precintos
- `GET /api/v1/precintos/:id` - Get precinto details
- `POST /api/v1/precintos` - Create precinto
- `PUT /api/v1/precintos/:id` - Update precinto
- `DELETE /api/v1/precintos/:id` - Delete precinto
- `POST /api/v1/precintos/:id/location` - Update location
- `POST /api/v1/precintos/:id/status` - Update status

### Transitos
- `GET /api/v1/transitos` - List transits
- `POST /api/v1/transitos` - Create transit
- `POST /api/v1/transitos/:id/start` - Start transit
- `POST /api/v1/transitos/:id/complete` - Complete transit

### Alertas
- `GET /api/v1/alertas` - List alerts
- `GET /api/v1/alertas/:id` - Get alert details
- `POST /api/v1/alertas/:id/acknowledge` - Acknowledge alert
- `POST /api/v1/alertas/:id/resolve` - Resolve alert

### Webhooks
- `GET /api/v1/webhooks` - List webhooks
- `POST /api/v1/webhooks` - Register webhook
- `PUT /api/v1/webhooks/:id` - Update webhook
- `DELETE /api/v1/webhooks/:id` - Delete webhook
- `POST /api/v1/webhooks/:id/test` - Test webhook

### Statistics & Reports
- `GET /api/v1/statistics/overview` - System overview
- `GET /api/v1/statistics/performance` - Performance metrics
- `POST /api/v1/reports/generate` - Generate report
- `GET /api/v1/reports/:id/download` - Download report

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Security Considerations

1. Always use HTTPS in production
2. Rotate JWT secrets regularly
3. Implement IP whitelisting for API keys
4. Monitor webhook delivery failures
5. Enable CORS only for trusted domains
6. Use environment variables for sensitive data
7. Implement request logging for audit trails

## Support

For issues or questions, contact support@cmo.com

---
By Cheva