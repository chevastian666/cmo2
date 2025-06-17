import type { Camion, TransitoCamion, EstadisticasCamion, FiltrosCamion, EstadoCamion } from '../types';
import { transitosService } from '../../transitos/services/transitos.service';

class CamionesService {
  private camiones: Map<string, Camion> = new Map();

  constructor() {
    // Inicializar con algunos datos de ejemplo
    this.initMockData();
  }

  private initMockData() {
    const mockCamiones: Camion[] = [
      {
        id: '1',
        matricula: 'ABC 1234',
        observaciones: 'Camión refrigerado, mantenimiento al día',
        estado: 'frecuente',
        foto: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400',
        fechaRegistro: new Date('2024-01-15'),
        fechaActualizacion: new Date('2024-12-20'),
        creadoPor: { id: '1', nombre: 'Admin' }
      },
      {
        id: '2',
        matricula: 'XYZ 5678',
        observaciones: 'Historial de retrasos frecuentes',
        estado: 'sospechoso',
        fechaRegistro: new Date('2024-02-20'),
        fechaActualizacion: new Date('2024-12-18'),
        creadoPor: { id: '1', nombre: 'Admin' }
      },
      {
        id: '3',
        matricula: 'BRA 9012',
        observaciones: 'Camión brasileño, documentación siempre en regla',
        estado: 'normal',
        foto: 'https://images.unsplash.com/photo-1499198116522-4b4cf3b7ff16?w=400',
        fechaRegistro: new Date('2024-03-10'),
        fechaActualizacion: new Date('2024-12-19'),
        creadoPor: { id: '2', nombre: 'Supervisor' }
      },
      {
        id: '4',
        matricula: 'ARG 3456',
        observaciones: 'Múltiples alertas de seguridad',
        estado: 'restringido',
        fechaRegistro: new Date('2024-04-05'),
        fechaActualizacion: new Date('2024-12-15'),
        creadoPor: { id: '2', nombre: 'Supervisor' }
      }
    ];

    mockCamiones.forEach(camion => {
      this.camiones.set(camion.matricula, camion);
    });
  }

  async getCamiones(filtros?: FiltrosCamion): Promise<Camion[]> {
    let camiones = Array.from(this.camiones.values());

    if (filtros) {
      // Filtrar por búsqueda (matrícula)
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        camiones = camiones.filter(c => 
          c.matricula.toLowerCase().includes(busqueda)
        );
      }

      // Filtrar por estado
      if (filtros.estado) {
        camiones = camiones.filter(c => c.estado === filtros.estado);
      }

      // Filtrar por tránsitos recientes
      if (filtros.conTransitosRecientes) {
        // Por ahora solo retornamos los que tienen estado frecuente
        camiones = camiones.filter(c => c.estado === 'frecuente');
      }
    }

    return camiones.sort((a, b) => 
      b.fechaActualizacion.getTime() - a.fechaActualizacion.getTime()
    );
  }

  async getCamionByMatricula(matricula: string): Promise<Camion | null> {
    return this.camiones.get(matricula) || null;
  }

  async getTransitosCamion(matricula: string, limit: number = 5): Promise<TransitoCamion[]> {
    // Obtener todos los tránsitos del sistema
    const todosTransitos = await transitosService.getTransitos();
    
    // Filtrar por matrícula del camión
    const transitosCamion = todosTransitos
      .filter(t => t.vehiculo?.matricula === matricula)
      .slice(0, limit)
      .map(t => ({
        id: t.id,
        fecha: t.fechaInicio,
        origen: t.origen,
        destino: t.destino,
        estado: t.estado,
        precinto: t.precintoId,
        camionero: t.vehiculo?.conductor ? {
          id: t.vehiculo.conductor.id || '1',
          nombre: t.vehiculo.conductor.nombre,
          documento: t.vehiculo.conductor.documento || ''
        } : undefined
      }));

    return transitosCamion;
  }

  async getEstadisticasCamion(matricula: string): Promise<EstadisticasCamion> {
    const todosTransitos = await transitosService.getTransitos();
    const transitosCamion = todosTransitos.filter(t => t.vehiculo?.matricula === matricula);
    
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const transitosRecientes = transitosCamion.filter(t => t.fechaInicio > hace30Dias);

    // Contar camioneros frecuentes
    const camioneroCount = new Map<string, { nombre: string; cantidad: number }>();
    transitosCamion.forEach(t => {
      if (t.vehiculo?.conductor) {
        const key = t.vehiculo.conductor.documento || t.vehiculo.conductor.nombre;
        const current = camioneroCount.get(key) || { nombre: t.vehiculo.conductor.nombre, cantidad: 0 };
        current.cantidad++;
        camioneroCount.set(key, current);
      }
    });

    // Encontrar el camionero más frecuente
    let camioneroFrecuente;
    let maxViajes = 0;
    camioneroCount.forEach((value, key) => {
      if (value.cantidad > maxViajes) {
        maxViajes = value.cantidad;
        camioneroFrecuente = {
          id: key,
          nombre: value.nombre,
          cantidadViajes: value.cantidad
        };
      }
    });

    // Contar rutas frecuentes
    const rutasCount = new Map<string, number>();
    transitosCamion.forEach(t => {
      const ruta = `${t.origen}-${t.destino}`;
      rutasCount.set(ruta, (rutasCount.get(ruta) || 0) + 1);
    });

    const rutasFrecuentes = Array.from(rutasCount.entries())
      .map(([ruta, cantidad]) => {
        const [origen, destino] = ruta.split('-');
        return { origen, destino, cantidad };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return {
      totalTransitos: transitosCamion.length,
      transitosUltimos30Dias: transitosRecientes.length,
      camioneroFrecuente,
      rutasFrecuentes
    };
  }

  async createCamion(data: Omit<Camion, 'id' | 'fechaRegistro' | 'fechaActualizacion'>): Promise<Camion> {
    const camion: Camion = {
      ...data,
      id: Date.now().toString(),
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    };

    this.camiones.set(camion.matricula, camion);
    return camion;
  }

  async updateCamion(matricula: string, data: Partial<Camion>): Promise<Camion | null> {
    const camion = this.camiones.get(matricula);
    if (!camion) return null;

    const updated = {
      ...camion,
      ...data,
      matricula: camion.matricula, // No permitir cambiar la matrícula
      fechaActualizacion: new Date()
    };

    this.camiones.set(matricula, updated);
    return updated;
  }

  async updateEstadoCamion(matricula: string, estado: EstadoCamion): Promise<boolean> {
    const camion = this.camiones.get(matricula);
    if (!camion) return false;

    camion.estado = estado;
    camion.fechaActualizacion = new Date();
    return true;
  }

  async uploadFotoCamion(matricula: string, foto: File): Promise<string> {
    // Simular upload y retornar URL
    return `https://images.unsplash.com/photo-${Date.now()}?w=400`;
  }
}

export const camionesService = new CamionesService();