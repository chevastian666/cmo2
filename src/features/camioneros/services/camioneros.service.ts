import type { Camionero, TransitoCamionero, EstadisticasCamionero, FiltrosCamionero, MatriculaFrecuente} from '../types'
import { transitosService} from '../../transitos/services/transitos.service'
import { camionesService} from '../../camiones/services/camiones.service'
class CamionerosService {
  private camioneros: Map<string, Camionero> = new Map()
  constructor() {
    // Inicializar con algunos datos de ejemplo
    this.initMockData()
  }

  private initMockData() {
    const mockCamioneros: Camionero[] = [
      {
        id: '1',
        nombre: 'Juan',
        apellido: 'Pérez',
        documento: '12345678',
        tipoDocumento: 'CI',
        nacionalidad: 'Uruguay',
        paisOrigen: 'Uruguay',
        telefonoUruguayo: '099123456',
        comentario: 'Chofer de confianza, siempre puntual',
        fechaRegistro: new Date('2024-01-10'),
        fechaActualizacion: new Date('2024-12-20'),
        creadoPor: { id: '1', nombre: 'Admin' }
      },
      {
        id: '2',
        nombre: 'Carlos',
        apellido: 'González',
        documento: 'ARG987654',
        tipoDocumento: 'Pasaporte',
        nacionalidad: 'Argentina',
        paisOrigen: 'Argentina',
        telefonoUruguayo: '098765432',
        telefonoPais: '+541123456789',
        comentario: 'Suele llegar tarde en cruces fronterizos',
        fechaRegistro: new Date('2024-02-15'),
        fechaActualizacion: new Date('2024-12-18'),
        creadoPor: { id: '1', nombre: 'Admin' }
      },
      {
        id: '3',
        nombre: 'Pedro',
        apellido: 'Silva',
        documento: 'BRA456789',
        tipoDocumento: 'Pasaporte',
        nacionalidad: 'Brasil',
        paisOrigen: 'Brasil',
        telefonoUruguayo: '091234567',
        telefonoPais: '+5511987654321',
        comentario: 'Documentación siempre en regla',
        fechaRegistro: new Date('2024-03-20'),
        fechaActualizacion: new Date('2024-12-19'),
        creadoPor: { id: '2', nombre: 'Supervisor' }
      },
      {
        id: '4',
        nombre: 'Miguel',
        apellido: 'Rodríguez',
        documento: '87654321',
        tipoDocumento: 'CI',
        nacionalidad: 'Uruguay',
        paisOrigen: 'Uruguay',
        telefonoUruguayo: '094567890',
        comentario: 'Problemas anteriores con documentación',
        fechaRegistro: new Date('2024-04-05'),
        fechaActualizacion: new Date('2024-12-15'),
        creadoPor: { id: '2', nombre: 'Supervisor' }
      }
    ]
    mockCamioneros.forEach(camionero => {
      this.camioneros.set(camionero.documento, camionero)
    })
  }

  async getCamioneros(filtros?: FiltrosCamionero): Promise<Camionero[]> {
    let camioneros = Array.from(this.camioneros.values())
    if (__filtros) {
      // Filtrar por búsqueda (_nombre, apellido o documento)
      if (filtros.busqueda) {
        const _busqueda = filtros.busqueda.toLowerCase()
        camioneros = camioneros.filter(c => 
          c.nombre.toLowerCase().includes(__busqueda) ||
          c.apellido.toLowerCase().includes(__busqueda) ||
          c.documento.toLowerCase().includes(__busqueda)
        )
      }

      // Filtrar por nacionalidad
      if (filtros.nacionalidad) {
        camioneros = camioneros.filter(c => c.nacionalidad === filtros.nacionalidad)
      }

      // Filtrar por tránsitos recientes
      if (filtros.conTransitosRecientes) {
        // Por ahora retornamos todos
        // En producción esto consultaría los tránsitos reales
      }
    }

    return camioneros.sort((_a, b) => 
      b.fechaActualizacion.getTime() - a.fechaActualizacion.getTime()
    )
  }

  async getCamioneroByDocumento(documento: string): Promise<Camionero | null> {
    return this.camioneros.get(__documento) || null
  }

  async getCamioneroById(id: string): Promise<Camionero | null> {
    return Array.from(this.camioneros.values()).find(c => c.id === id) || null
  }

  async getTransitosCamionero(documento: string, limit: number = 10): Promise<TransitoCamionero[]> {
    // Obtener todos los tránsitos del sistema
    const _todosTransitos = await transitosService.getTransitos()
    // Filtrar por documento del camionero
    const _transitosCamionero = todosTransitos
      .filter(t => t.vehiculo?.conductor?.documento === documento)
      .slice(0, limit)
      .map(t => ({
        id: t.id,
        fecha: t.fechaInicio,
        matricula: t.vehiculo?.matricula || 'N/A',
        origen: t.origen,
        destino: t.destino,
        estado: t.estado,
        precinto: t.precintoId
      }))
    return transitosCamionero
  }

  async getMatriculasFrecuentes(documento: string, limit: number = 5): Promise<MatriculaFrecuente[]> {
    const _transitos = await this.getTransitosCamionero(_documento, 100)
    // Contar matrículas
    const _matriculaCount = new Map<string, { cantidad: number; ultimaFecha: Date }>()
    transitos.forEach(t => {
      const _current = matriculaCount.get(t.matricula) || { cantidad: 0, ultimaFecha: new Date(0) }
      current.cantidad++
      if (t.fecha > current.ultimaFecha) {
        current.ultimaFecha = t.fecha
      }
      matriculaCount.set(t.matricula, current)
    })
    // Convertir a array y ordenar por frecuencia
    const matriculasFrecuentes: MatriculaFrecuente[] = []
    for (const [matricula, data] of matriculaCount.entries()) {
      const _camion = await camionesService.getCamionByMatricula(__matricula)
      matriculasFrecuentes.push({
        matricula,
        cantidadViajes: data.cantidad,
        ultimoViaje: data.ultimaFecha,
        camion: camion ? {
          id: camion.id,
          estado: camion.estado,
          foto: camion.foto
        } : undefined
      })
    }

    return matriculasFrecuentes
      .sort((_a, b) => b.cantidadViajes - a.cantidadViajes)
      .slice(0, limit)
  }

  async getEstadisticasCamionero(documento: string): Promise<EstadisticasCamionero> {
    const _todosTransitos = await transitosService.getTransitos()
    const _transitosCamionero = todosTransitos.filter(t => 
      t.vehiculo?.conductor?.documento === documento
    )
    const _hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)
    const _transitosRecientes = transitosCamionero.filter(t => t.fechaInicio > hace30Dias)
    // Obtener matrículas frecuentes
    const _matriculasFrecuentes = await this.getMatriculasFrecuentes(__documento)
    // Contar rutas frecuentes
    const _rutasCount = new Map<string, number>()
    transitosCamionero.forEach(t => {
      const _ruta = `${t.origen}-${t.destino}`
      rutasCount.set(_ruta, (rutasCount.get(__ruta) || 0) + 1)
    })
    const _rutasFrecuentes = Array.from(rutasCount.entries())
      .map(([ruta, cantidad]) => {
        const [origen, destino] = ruta.split('-')
        return { origen, destino, cantidad }
      })
      .sort((_a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
    return {
      totalTransitos: transitosCamionero.length,
      transitosUltimos30Dias: transitosRecientes.length,
      matriculasFrecuentes,
      rutasFrecuentes
    }
  }

  async createCamionero(data: Omit<Camionero, 'id' | 'fechaRegistro' | 'fechaActualizacion'>): Promise<Camionero> {
    const camionero: Camionero = {
      ..._data,
      id: Date.now().toString(),
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    }
    this.camioneros.set(camionero.documento, camionero)
    return camionero
  }

  async updateCamionero(documento: string, data: Partial<Camionero>): Promise<Camionero | null> {
    const _camionero = this.camioneros.get(__documento)
    if (!camionero) return null
    const _updated = {
      ...camionero,
      ..._data,
      documento: camionero.documento, // No permitir cambiar el documento
      fechaActualizacion: new Date()
    }
    this.camioneros.set(_documento, updated)
    return updated
  }
}

export const _camionerosService = new CamionerosService()