/**
 * Swagger/OpenAPI Configuration
 * By Cheva
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf8')
);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CMO REST API',
      version: packageJson.version,
      description: 'Centro de Monitoreo y Operaciones - REST API with Webhooks',
      contact: {
        name: 'CMO Support',
        email: 'support@cmo.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://cmo.com/license'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.cmo.com/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for external system access'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              default: 1
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20
            },
            total: {
              type: 'integer',
              description: 'Total number of items'
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages'
            }
          }
        },
        Precinto: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            codigo: {
              type: 'string',
              description: 'Unique precinto code'
            },
            estado: {
              type: 'string',
              enum: ['activo', 'inactivo', 'en_transito', 'finalizado']
            },
            tipo: {
              type: 'string',
              enum: ['electronico', 'mecanico']
            },
            ubicacion: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' },
                timestamp: { type: 'string', format: 'date-time' }
              }
            },
            bateria: {
              type: 'integer',
              minimum: 0,
              maximum: 100
            },
            temperatura: {
              type: 'number'
            },
            humedad: {
              type: 'number'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Transito: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            numeroViaje: {
              type: 'string'
            },
            dua: {
              type: 'string'
            },
            precintoId: {
              type: 'string',
              format: 'uuid'
            },
            origen: {
              type: 'string'
            },
            destino: {
              type: 'string'
            },
            fechaSalida: {
              type: 'string',
              format: 'date-time'
            },
            fechaLlegadaEstimada: {
              type: 'string',
              format: 'date-time'
            },
            fechaLlegadaReal: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'en_ruta', 'demorado', 'finalizado', 'cancelado']
            },
            chofer: {
              type: 'object',
              properties: {
                nombre: { type: 'string' },
                documento: { type: 'string' },
                telefono: { type: 'string' }
              }
            },
            vehiculo: {
              type: 'object',
              properties: {
                matricula: { type: 'string' },
                tipo: { type: 'string' },
                marca: { type: 'string' },
                modelo: { type: 'string' }
              }
            }
          }
        },
        Alerta: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            tipo: {
              type: 'string',
              enum: ['apertura_no_autorizada', 'desvio_ruta', 'demora_excesiva', 'bateria_baja', 'temperatura_anomala', 'sin_señal']
            },
            severidad: {
              type: 'string',
              enum: ['baja', 'media', 'alta', 'critica']
            },
            precintoId: {
              type: 'string',
              format: 'uuid'
            },
            transitoId: {
              type: 'string',
              format: 'uuid',
              nullable: true
            },
            mensaje: {
              type: 'string'
            },
            ubicacion: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              }
            },
            estado: {
              type: 'string',
              enum: ['activa', 'atendida', 'resuelta', 'descartada']
            },
            metadata: {
              type: 'object',
              additionalProperties: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Webhook: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            url: {
              type: 'string',
              format: 'uri'
            },
            events: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['alerta.created', 'alerta.updated', 'transito.started', 'transito.completed', 'transito.delayed', 'precinto.tampered']
              }
            },
            active: {
              type: 'boolean',
              default: true
            },
            secret: {
              type: 'string',
              description: 'Secret for HMAC signature validation'
            },
            headers: {
              type: 'object',
              additionalProperties: {
                type: 'string'
              }
            },
            retryConfig: {
              type: 'object',
              properties: {
                maxAttempts: { type: 'integer', default: 3 },
                backoffMultiplier: { type: 'number', default: 2 },
                initialDelay: { type: 'integer', default: 1000 }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints'
      },
      {
        name: 'Precintos',
        description: 'Electronic seal management'
      },
      {
        name: 'Transitos',
        description: 'Transit operations'
      },
      {
        name: 'Alertas',
        description: 'Alert management'
      },
      {
        name: 'Webhooks',
        description: 'Webhook configuration'
      },
      {
        name: 'Statistics',
        description: 'Statistics and analytics'
      },
      {
        name: 'Reports',
        description: 'Report generation'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/routes/**/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);