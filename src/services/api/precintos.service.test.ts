/**
 * Precintos Service Tests
 * By Cheva
 */
import { describe, it, expect, beforeEach, vi} from 'vitest'
import { precintosService} from './precintos.service'
import { server} from '@/test/mocks/server'
import { http, HttpResponse} from 'msw'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
describe('PrecintosService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  describe('getPrecintos', () => {
    it('fetches precintos successfully', async () => {
      const result = await precintosService.getPrecintos()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
    })
    it('handles pagination parameters', async () => {
      const result = await precintosService.getPrecintos({ page: 2, limit: 20 })
      expect(result.pagination.page).toBe(2)
      expect(result.pagination.limit).toBe(20)
    })
    it('handles filter parameters', async () => {
      const filters = { estado: 'activo', empresa: 'Test Company' }
      const result = await precintosService.getPrecintos({ filters })
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })
    it('handles API errors gracefully', async () => {
      server.use(http.get(`${API_URL}/precintos`, () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )
      await expect(precintosService.getPrecintos()).rejects.toThrow()
    })
    it('caches responses appropriately', async () => {
      // First call
      const result1 = await precintosService.getPrecintos()
      // Second call (should use cache)
      const result2 = await precintosService.getPrecintos()
      expect(result1._data).toEqual(result2._data)
    })
  })
  describe('getPrecinto', () => {
    it('fetches single precinto by ID', async () => {
      const result = await precintosService.getPrecinto('123')
      expect(result.data).toBeDefined()
      expect(result.data?.id).toBe('123')
    })
    it('handles not found error', async () => {
      server.use(http.get(`${API_URL}/precintos/:id`, () => {
          return HttpResponse.json(
            { error: 'Precinto not found' },
            { status: 404 }
          )
        })
      )
      await expect(precintosService.getPrecinto('999')).rejects.toThrow()
    })
  })
  describe('createPrecinto', () => {
    it('creates new precinto successfully', async () => {
      const newPrecinto = {
        codigo: 'PRE-NEW',
        empresa: 'New Company',
        descripcion: 'New precinto',
      }
      const result = await precintosService.createPrecinto(newPrecinto)
      expect(result.data).toBeDefined()
      expect(result.data?.codigo).toBe(newPrecinto.codigo)
      expect(result.data?.empresa).toBe(newPrecinto.empresa)
    })
    it('handles validation errors', async () => {
      server.use(http.post(`${API_URL}/precintos`, () => {
          return HttpResponse.json(
            { 
              error: 'Validation failed',
              details: {
                codigo: 'Código ya existe',
              }
            },
            { status: 400 }
          )
        })
      )
      const invalidPrecinto = { codigo: '' }
      await expect(precintosService.createPrecinto(invalidPrecinto)).rejects.toThrow()
    })
  })
  describe('updatePrecinto', () => {
    it('updates precinto successfully', async () => {
      server.use(http.patch(`${API_URL}/precintos/:id`, async ({ params, request }) => {
          const body = await request.json()
          return HttpResponse.json({
            data: {
              id: params.id,
              ...body,
            },
          })
        })
      )
      const updates = { estado: 'inactivo' }
      const result = await precintosService.updatePrecinto('123', updates)
      expect(result.data.estado).toBe('inactivo')
    })
  })
  describe('activatePrecinto', () => {
    it('activates precinto successfully', async () => {
      server.use(http.post(`${API_URL}/precintos/:id/activar`, ({ params }) => {
          return HttpResponse.json({
            data: {
              id: params.id,
              estado: 'activo',
              fecha_activacion: new Date().toISOString(),
            },
          })
        })
      )
      const result = await precintosService.activatePrecinto('123')
      expect(result.data.estado).toBe('activo')
      expect(result.data.fecha_activacion).toBeDefined()
    })
  })
  describe('getPrecintoHistory', () => {
    it('fetches precinto history', async () => {
      server.use(http.get(`${API_URL}/precintos/:id/historial`, () => {
          return HttpResponse.json({
            data: [
              {
                fecha: new Date().toISOString(),
                evento: 'Activación',
                descripcion: 'Precinto activado',
              },
              {
                fecha: new Date().toISOString(),
                evento: 'Movimiento',
                descripcion: 'Precinto en tránsito',
              },
            ],
          })
        })
      )
      const result = await precintosService.getPrecintoHistory('123')
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data?.length).toBeGreaterThan(0)
    })
  })
  describe('exportPrecintos', () => {
    it('exports precintos to CSV', async () => {
      server.use(http.get(`${API_URL}/precintos/export`, () => {
          return new HttpResponse('csv data', {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename="precintos.csv"',
            },
          })
        })
      )
      const blob = await precintosService.exportPrecintos('csv')
      expect(blob).toBeInstanceOf(Blob)
    })
    it('exports precintos to Excel', async () => {
      server.use(http.get(`${API_URL}/precintos/export`, () => {
          return new HttpResponse(new ArrayBuffer(8), {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': 'attachment; filename="precintos.xlsx"',
            },
          })
        })
      )
      const blob = await precintosService.exportPrecintos('excel')
      expect(blob).toBeInstanceOf(Blob)
    })
  })
})