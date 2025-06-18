# JWT Implementation - CMO Dashboard

## Overview
JWT (JSON Web Tokens) authentication has been successfully implemented in the CMO dashboard application.

## Key Components

### 1. JWT Service (`src/services/jwt.service.ts`)
- Manages JWT tokens (access & refresh)
- Token validation and expiration checks
- User information extraction from tokens
- Authorization header formatting
- Singleton pattern for global access

Key methods:
- `saveTokens()` - Stores access and refresh tokens
- `getAccessToken()` / `getRefreshToken()` - Retrieves tokens
- `isTokenExpired()` - Checks if token is expired
- `shouldRefreshToken()` - Determines if refresh is needed
- `decodeToken()` - Extracts user info from JWT
- `hasRole()` / `hasPermission()` - Authorization checks

### 2. JWT Types (`src/types/jwt.d.ts`)
- `DecodedToken` - JWT payload structure
- `TokenPair` - Access & refresh token pair
- `LoginResponse` - Login API response format
- `RefreshTokenResponse` - Token refresh response

### 3. Enhanced Auth Service (`src/services/shared/auth.service.ts`)
- Integrates JWT service for authentication
- Automatic token refresh (1-minute intervals)
- Session management and expiry tracking
- Auth state broadcasting to subscribers
- Role-based access control

Features:
- Auto-refresh before token expiry
- Session extension capabilities
- Time until expiry calculation
- Persistent auth state

### 4. API Service Updates (`src/services/shared/sharedApi.service.ts`)
- JWT headers in all API requests
- Automatic token refresh on 401 responses
- Mock JWT generation for development
- Seamless retry after token refresh

### 5. WebSocket Integration (`src/services/shared/sharedWebSocket.service.ts`)
- JWT authentication for WebSocket connections
- Token-based authentication on connect

## Development Mode

Mock JWT tokens are generated in development mode with:
- 1-hour expiration time
- User info embedded in payload
- Base64 encoded for realism

Example mock token structure:
```javascript
{
  id: "usr-1",
  email: "user@example.com",
  nombre: "User Name",
  rol: "admin",
  iat: 1234567890,
  exp: 1234571490
}
```

## Usage

### Login
```typescript
const { login } = useAuth();
await login(email, password);
// JWT tokens are automatically stored
```

### Check Authentication
```typescript
const { isAuthenticated, user } = useAuth();
if (isAuthenticated) {
  console.log(`Logged in as ${user.nombre}`);
}
```

### Role-Based Access
```typescript
const { hasRole } = useAuth();
if (hasRole(['admin', 'supervisor'])) {
  // Show admin features
}
```

## Token Flow

1. **Login**: User credentials → JWT tokens received → Stored locally
2. **API Requests**: JWT automatically added to headers
3. **Token Expiry**: Auto-refresh 5 minutes before expiry
4. **401 Response**: Refresh token → Retry request
5. **Logout**: Clear tokens → Redirect to login

## Security Features

- Tokens stored in localStorage (can be changed to httpOnly cookies)
- Automatic refresh prevents session expiry
- Token validation on every auth check
- WebSocket authentication
- Role and permission-based authorization

## Testing

In development mode:
- Use any email with password "password123"
- Mock tokens are generated automatically
- Token refresh simulated realistically

## Next Steps

1. Configure actual API endpoints
2. Implement httpOnly cookie storage (optional)
3. Add token blacklisting for logout
4. Set up refresh token rotation
5. Add session timeout warnings

By Cheva