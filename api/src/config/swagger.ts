/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 * By Cheva
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CMO REST API',
      version: '1.0.0',
      description: 'Centro de Monitoreo de Operaciones - REST API Documentation',
      contact: {
        name: 'CMO Development Team',
        email: 'dev@cmo.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.api.prefix}`,
        description: 'Development server'
      },
      {
        url: `https://api.cmo.com${config.api.prefix}`,
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
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
            timestamp: {
              type: 'string',
              format: 'date-time'
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
              type: 'integer'
            },
            totalPages: {
              type: 'integer'
            }
          }
        },
        Precinto: {
          type: 'object',
          required: ['codigo', 'tipo', 'estado'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            codigo: {
              type: 'string',
              description: 'Unique code of the precinto'
            },
            tipo: {
              type: 'string',
              enum: ['RFID', 'GPS', 'HIBRIDO']
            },
            estado: {
              type: 'string',
              enum: ['creado', 'activado', 'en_transito', 'completado', 'desactivado', 'alarma']
            },
            ubicacion: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' },
                direccion: { type: 'string' },
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
        Transit: {
          type: 'object',
          required: ['origen', 'destino', 'precintoId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            origen: {
              type: 'string'
            },
            destino: {
              type: 'string'
            },
            precintoId: {
              type: 'string',
              format: 'uuid'
            },
            camionId: {
              type: 'string',
              format: 'uuid'
            },
            conductorId: {
              type: 'string',
              format: 'uuid'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'en_curso', 'completado', 'cancelado', 'retrasado']
            },
            fechaInicio: {
              type: 'string',
              format: 'date-time'
            },
            fechaFinEstimada: {
              type: 'string',
              format: 'date-time'
            },
            fechaFinReal: {
              type: 'string',
              format: 'date-time'
            },
            ruta: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            tipo: {
              type: 'string',
              enum: ['critica', 'alta', 'media', 'baja']
            },
            origen: {
              type: 'string'
            },
            mensaje: {
              type: 'string'
            },
            precintoId: {
              type: 'string',
              format: 'uuid'
            },
            transitoId: {
              type: 'string',
              format: 'uuid'
            },
            estado: {
              type: 'string',
              enum: ['activa', 'reconocida', 'resuelta', 'descartada']
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            resolucion: {
              type: 'object',
              properties: {
                usuario: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                comentario: { type: 'string' }
              }
            }
          }
        },
        WebhookEvent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            event: {
              type: 'string',
              enum: ['precinto.created', 'precinto.updated', 'transit.started', 'transit.completed', 'alert.created', 'alert.resolved']
            },
            data: {
              type: 'object'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
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
        name: 'Transits',
        description: 'Transit management'
      },
      {
        name: 'Alerts',
        description: 'Alert management'
      },
      {
        name: 'Statistics',
        description: 'Statistical data and analytics'
      },
      {
        name: 'Webhooks',
        description: 'Webhook configuration and management'
      },
      {
        name: 'Users',
        description: 'User management'
      },
      {
        name: 'Companies',
        description: 'Company management'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);