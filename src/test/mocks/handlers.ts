/**
 * MSW Request Handlers
 * By Cheva
 */
import { http, HttpResponse} from 'msw'
import { faker} from '@faker-js/faker'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// Generar datos mock
const generateMockPrecinto = () => ({
  id: faker.string.uuid(),
  codigo: `PRE-${faker.number.int({ min: 1000, max: 9999 })}`,
  estado: faker.helpers.arrayElement(['activo', 'en_transito', 'completado', 'inactivo']),
  empresa: faker.company.name(),
  descripcion: faker.lorem.sentence(),
  fecha_activacion: faker.date.recent().toISOString(),
  ubicacion_actual: {
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  },
  bateria: faker.number.int({ min: 0, max: 100 }),
  temperatura: faker.number.float({ min: -10, max: 40, fractionDigits: 1 }),
})
const generateMockTransito = () => ({
  id: faker.string.uuid(),
  codigo: `TRN-${faker.number.int({ min: 1000, max: 9999 })}`,
  estado: faker.helpers.arrayElement(['en_curso', 'completado', 'retrasado', 'pendiente']),
  origen: faker.location.city(),
  destino: faker.location.city(),
  fecha_inicio: faker.date.recent().toISOString(),
  fecha_estimada: faker.date.future().toISOString(),
  progreso: faker.number.int({ min: 0, max: 100 }),
  camion: {
    patente: faker.vehicle.vrm(),
    marca: faker.vehicle.manufacturer(),
    modelo: faker.vehicle.model(),
  },
  conductor: {
    nombre: faker.person.fullName(),
    documento: faker.string.numeric(8),
  },
})
const generateMockAlerta = () => ({
  id: faker.string.uuid(),
  tipo: faker.helpers.arrayElement(['temperatura', 'bateria', 'desviacion_ruta', 'apertura_no_autorizada']),
  severidad: faker.helpers.arrayElement(['critica', 'alta', 'media', 'baja']),
  mensaje: faker.lorem.sentence(),
  fecha: faker.date.recent().toISOString(),
  precinto_id: faker.string.uuid(),
  estado: faker.helpers.arrayElement(['activa', 'reconocida', 'resuelta']),
})
export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async () => {
    const body = await request.json()
    const { email } = body as { email: string; password: string }
    if (email === 'test@cmo.com' && password === 'test123') {
      return HttpResponse.json({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@cmo.com',
          nombre: 'Test User',
          rol: 'admin',
          permisos: ['cmo:access', 'cmo:admin'],
        },
      })
    }
    
    return HttpResponse.json(
      { success: false, error: 'Credenciales inválidas' },
      { status: 401 }
    )
  }),

  // Precintos endpoints
  http.get(`${API_URL}/precintos`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const precintos = Array.from({ length: limit }, generateMockPrecinto)
    return HttpResponse.json({
      data: precintos,
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: 10,
      },
    })
  }),

  http.get(`${API_URL}/precintos/:id`, ({ params }) => {
    return HttpResponse.json({
      data: {
        ...generateMockPrecinto(),
        id: params.id,
      },
    })
  }),

  http.post(`${API_URL}/precintos`, async () => {

    return HttpResponse.json({
      data: {
        ...generateMockPrecinto(),
        ...data,
      },
    })
  }),

  // Transitos endpoints
  http.get(`${API_URL}/transitos`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const transitos = Array.from({ length: limit }, generateMockTransito)
    return HttpResponse.json({
      data: transitos,
      pagination: {
        page,
        limit,
        total: 50,
        totalPages: 5,
      },
    })
  }),

  http.get(`${API_URL}/transitos/:id`, ({ params }) => {
    return HttpResponse.json({
      data: {
        ...generateMockTransito(),
        id: params.id,
      },
    })
  }),

  // Alertas endpoints
  http.get(`${API_URL}/alertas`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const alertas = Array.from({ length: limit }, generateMockAlerta)
    return HttpResponse.json({
      data: alertas,
      pagination: {
        page,
        limit,
        total: 30,
        totalPages: 3,
      },
    })
  }),

  http.patch(`${API_URL}/alertas/:id/reconocer`, ({ params }) => {
    return HttpResponse.json({
      data: {
        ...generateMockAlerta(),
        id: params.id,
        estado: 'reconocida',
      },
    })
  }),

  // Statistics endpoints
  http.get(`${API_URL}/estadisticas/dashboard`, () => {
    return HttpResponse.json({
      data: {
        totalPrecintos: 450,
        precintosActivos: 145,
        totalTransitos: 162,
        transitosEnCurso: 45,
        alertasActivas: 89,
        alertasCriticas: 8,
        tasaCompletitud: 87.5,
        tiempoPromedioTransito: '4h 32m',
      },
    })
  }),

  // WebSocket mock (simulación)
  http.get(`${API_URL}/ws`, () => {
    return new HttpResponse(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
      },
    })
  }),

  // Google Maps mock
  http.get('https://maps.googleapis.com/maps/api/js', () => {
    return new HttpResponse('// Google Maps Mock Script', {
      headers: {
        'Content-Type': 'application/javascript',
      },
    })
  }),

  // Catch all handler
  http.get('*', () => {
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),
]