# WebSocket Differential Compression System

Sistema de compresión diferencial para WebSocket optimizado para el monitoreo de precintos electrónicos aduaneros. Reduce el ancho de banda en **90%+** transmitiendo solo los cambios (deltas) entre estados.

## 🚀 Características Principales

### 1. **Protocolo Binario Eficiente**
- Mensajes binarios compactos con headers mínimos
- Serialización rápida sin overhead de JSON
- Tipos de mensaje optimizados (1 byte)
- Payload con solo campos modificados

### 2. **Sistema de Deltas Inteligente**
- Mantiene estado anterior de cada precinto
- Calcula diferencias automáticamente
- Transmite solo campos que cambiaron
- Snapshots completos periódicos para sincronización

### 3. **Compresión Brotli en Tiempo Real**
- Compresión Brotli nativa de Node.js
- Buffer inteligente para agrupar deltas
- Nivel de compresión optimizado para baja latencia
- Marcador de compresión en mensajes

### 4. **WebSocket de Alto Rendimiento**
- Gestión eficiente de miles de conexiones
- Reconexión automática con recuperación de estado
- Heartbeat para detectar conexiones muertas
- Rate limiting y backpressure

## 📊 Métricas de Rendimiento

- **Reducción de ancho de banda**: ≥ 90%
- **Latencia**: < 50ms
- **CPU del servidor**: < 30% con 10,000 conexiones
- **Recuperación**: < 3 segundos tras desconexión
- **Memoria**: < 200MB para 10,000 precintos

## 📁 Estructura del Proyecto

```
websocket-compression/
├── protocol/
│   └── MessageTypes.js      # Protocolo binario y tipos de mensaje
├── server/
│   ├── WebSocketServer.js   # Servidor WebSocket principal
│   ├── DeltaCompressor.js   # Sistema de compresión diferencial
│   └── StateManager.js      # Gestión de estados con Redis
├── client/
│   ├── WebSocketClient.js   # Cliente con auto-reconexión
│   └── DeltaDecompressor.js # Reconstrucción de estados
├── tests/
│   ├── compression.test.js  # Tests unitarios
│   └── simulation.js        # Simulación de 1000 precintos
└── README.md
```

## 🔧 Instalación

```bash
# Instalar dependencias
npm install ws redis zlib

# Para desarrollo y testing
npm install --save-dev nodemon
```

## 🚀 Uso Rápido

### Servidor

```javascript
import { CompressedWebSocketServer } from './server/WebSocketServer.js';

const server = new CompressedWebSocketServer({
  port: 8080,
  compression: true,
  compressionLevel: 4,
  batchInterval: 100
});

await server.start();

// Enviar actualización de estado
server.broadcastUpdate('PRECINTO-001', {
  latitude: -34.6037,
  longitude: -58.3816,
  status: 1, // ACTIVE
  temperature: 25.5,
  battery: 85,
  timestamp: Date.now()
});
```

### Cliente

```javascript
import { CompressedWebSocketClient } from './client/WebSocketClient.js';

const client = new CompressedWebSocketClient('ws://localhost:8080', {
  compression: true,
  reconnect: true
});

// Escuchar actualizaciones
client.on('stateUpdate', (data) => {
  console.log(`Update for ${data.precintoId}:`, data.state);
});

// Conectar y suscribirse
await client.connect();
client.subscribe(['PRECINTO-001', 'PRECINTO-002']);
```

## 🧪 Testing

### Tests Unitarios

```bash
node tests/compression.test.js
```

### Simulación de 1000 Precintos

```bash
node tests/simulation.js
```

Esto iniciará:
- 1 servidor WebSocket
- 5 clientes conectados
- 1000 precintos simulados enviando actualizaciones cada 5-30 segundos

## 📈 Protocolo Binario

### Estructura de Mensaje Full State (ejemplo)

```
[Type:1][PrecintoID:n][Timestamp:4][Lat:4][Lng:4][Status:1][Temp:4][Battery:1]...
Total: ~50 bytes
```

### Estructura de Mensaje Delta (ejemplo)

```
[Type:1][PrecintoID:n][Timestamp:4][FieldCount:1][FieldID:1][Value:n]...
Total: ~15-20 bytes (3-4 campos cambiados)
```

### Tipos de Mensaje

- `0x01` - FULL_STATE: Estado completo del precinto
- `0x02` - DELTA_UPDATE: Solo campos modificados
- `0x03` - BATCH_DELTA: Múltiples deltas en un mensaje
- `0x10` - HEARTBEAT: Keep-alive
- `0x20` - HELLO: Handshake inicial

## ⚙️ Configuración

### Servidor

```javascript
{
  port: 8080,                    // Puerto WebSocket
  compression: true,             // Habilitar Brotli
  compressionLevel: 4,           // Nivel 1-11 (4 = balance)
  heartbeatInterval: 30000,      // Intervalo heartbeat (ms)
  connectionTimeout: 60000,      // Timeout de conexión (ms)
  maxConnections: 10000,         // Máximo de conexiones
  batchInterval: 100            // Intervalo de batch (ms)
}
```

### Cliente

```javascript
{
  reconnect: true,               // Auto-reconexión
  reconnectInterval: 1000,       // Intervalo inicial (ms)
  reconnectDecay: 1.5,          // Factor de incremento
  reconnectAttempts: 10,        // Intentos máximos
  compression: true,            // Usar compresión
  heartbeatInterval: 25000      // Intervalo heartbeat
}
```

## 🔍 Monitoreo

El sistema incluye métricas detalladas:

```
=== WebSocket Server Metrics ===
Active Connections: 5/10000
Messages: 125431 sent, 5234 received
Bandwidth: 1.23 MB sent, 523.4 KB received
Compression Ratio: 92.35%
Bandwidth Saved: 12.45 MB
Memory Usage: 45.23 MB
Errors: 0
================================
```

## 🚨 Manejo de Errores

- Reconexión automática con backoff exponencial
- Resincronización de estado tras reconexión
- Cola de mensajes durante desconexión
- Detección y limpieza de conexiones muertas

## 🔐 Seguridad

- Validación de tamaño de mensajes
- Rate limiting por conexión
- Timeout de conexiones inactivas
- Posibilidad de agregar autenticación JWT

## 📝 Notas de Implementación

1. **Redis** es opcional pero recomendado para persistencia
2. **Brotli** ofrece mejor compresión que gzip para este caso
3. Los **deltas** se agrupan para mayor eficiencia
4. El **heartbeat** mantiene conexiones NAT/firewall abiertas
5. Los **snapshots completos** previenen deriva de estado

## 🤝 Contribución

Para contribuir:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -am 'Agrega mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Crea un Pull Request

## 📄 Licencia

Sistema propietario para uso en monitoreo aduanero.