/**
 * Torre de Control Service
 * By Cheva
 */

import { unifiedAPIService } from '../../../services/api/unified.service';
import type { TransitoTorreControl } from '../types';

class TorreControlService {
  async getTransitosEnRuta(): Promise<TransitoTorreControl[]> {
    try {
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        // Return mock data for development
        return this.getMockTransitos();
      }
      
      // Get transitos en viaje from unified API
      const response = await unifiedAPIService.getTransitos({
        estado: 'en_viaje',
        page: 1,
        limit: 100
      });
      
      // Map to TorreControl format
      return response.data.map(transito => this.mapTransitoToTorreControl(transito));
    } catch (error) {
      console.error('Error fetching transitos en ruta:', error);
      // Fallback to mock data
      return this.getMockTransitos();
    }
  }

  private mapTransitoToTorreControl(transito: any): TransitoTorreControl {
    const now = Date.now();
    const salidaTime = new Date(transito.fechaSalida).getTime();
    const etaTime = transito.eta ? new Date(transito.eta).getTime() : now + 3600000;
    
    // Calculate semaforo based on time and alerts
    let semaforo: 'verde' | 'amarillo' | 'rojo' = 'verde';
    if (transito.alertas && transito.alertas.length > 0) {
      semaforo = 'rojo';
    } else if (etaTime - now < 3600000) { // Less than 1 hour to ETA
      semaforo = 'amarillo';
    }
    
    return {
      id: transito.id,
      pvid: transito.precintoId || 'N/A',
      matricula: transito.matricula,
      chofer: transito.chofer,
      choferCI: transito.vehiculo?.conductor?.documento || 'N/A',
      origen: transito.origen,
      destino: transito.destino,
      fechaSalida: new Date(salidaTime),
      eta: new Date(etaTime),
      estado: transito.estado === 'con_alerta' ? 3 : 1,
      semaforo,
      precinto: transito.precinto,
      eslinga_larga: true, // Default value
      eslinga_corta: true, // Default value
      observaciones: transito.observaciones,
      alertas: transito.alertas,
      ubicacionActual: this.generateMockLocation(),
      progreso: transito.progreso || 50,
      dua: transito.dua,
      numeroViaje: transito.numeroViaje,
      numeroMovimiento: transito.numeroMovimiento,
      fotoPrecintado: transito.fotoPrecintado
    };
  }

  private generateMockLocation(): { lat: number; lng: number } {
    // Uruguay bounds
    const minLat = -35.0;
    const maxLat = -30.0;
    const minLng = -58.5;
    const maxLng = -53.0;
    
    return {
      lat: minLat + Math.random() * (maxLat - minLat),
      lng: minLng + Math.random() * (maxLng - minLng)
    };
  }

  private getMockTransitos(): TransitoTorreControl[] {
    const mockData: TransitoTorreControl[] = [
      {
        id: '1',
        pvid: 'STP5678',
        matricula: 'STP1234',
        chofer: 'Juan Pérez',
        choferCI: '1.234.567-8',
        origen: 'Montevideo',
        destino: 'Rivera',
        fechaSalida: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        eta: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        estado: 1,
        semaforo: 'verde',
        precinto: 'BT20240001',
        eslinga_larga: true,
        eslinga_corta: true,
        observaciones: 'En ruta sin novedades',
        ubicacionActual: { lat: -32.5228, lng: -55.7658 },
        progreso: 40,
        dua: '788553',
        numeroViaje: '7581856',
        numeroMovimiento: '1234',
        fotoPrecintado: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
      },
      {
        id: '2',
        pvid: 'STP5678',
        matricula: 'STP1234',
        chofer: 'María Silva',
        choferCI: '2.345.678-9',
        origen: 'Chuy',
        destino: 'Montevideo',
        fechaSalida: new Date(Date.now() - 4 * 60 * 60 * 1000),
        eta: new Date(Date.now() + 1 * 60 * 60 * 1000),
        estado: 1,
        semaforo: 'amarillo',
        precinto: 'BT20240002',
        eslinga_larga: true,
        eslinga_corta: false,
        observaciones: 'Falta eslinga corta',
        alertas: ['Eslinga corta no colocada'],
        ubicacionActual: { lat: -33.2524, lng: -54.1234 },
        progreso: 75,
        dua: '788554',
        numeroViaje: '7581857',
        numeroMovimiento: '1235',
        fotoPrecintado: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80'
      },
      {
        id: '3',
        pvid: 'STP5678',
        matricula: 'STP1234',
        chofer: 'Pedro García',
        choferCI: '3.456.789-0',
        origen: 'Rivera',
        destino: 'Chuy',
        fechaSalida: new Date(Date.now() - 6 * 60 * 60 * 1000),
        eta: new Date(Date.now() + 0.5 * 60 * 60 * 1000),
        estado: 2,
        semaforo: 'rojo',
        precinto: 'BT20240003',
        eslinga_larga: true,
        eslinga_corta: true,
        observaciones: 'Desvío detectado en ruta',
        alertas: ['Desvío de ruta detectado', 'Sin señal GPS por 15 minutos'],
        ubicacionActual: { lat: -31.3833, lng: -55.0333 },
        progreso: 85,
        dua: '788555',
        numeroViaje: '7581858',
        numeroMovimiento: '1236',
        fotoPrecintado: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80'
      },
      {
        id: '4',
        pvid: 'STP5678',
        matricula: 'STP1234',
        chofer: 'Ana Martínez',
        choferCI: '4.567.890-1',
        origen: 'Nueva Palmira',
        destino: 'Montevideo',
        fechaSalida: new Date(Date.now() - 1 * 60 * 60 * 1000),
        eta: new Date(Date.now() + 2 * 60 * 60 * 1000),
        estado: 1,
        semaforo: 'verde',
        precinto: 'BT20240004',
        eslinga_larga: true,
        eslinga_corta: true,
        observaciones: 'Transporte de carga refrigerada',
        ubicacionActual: { lat: -33.8804, lng: -58.2516 },
        progreso: 30,
        dua: '788556',
        numeroViaje: '7581859',
        numeroMovimiento: '1237',
        fotoPrecintado: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80'
      },
      {
        id: '5',
        pvid: 'STP5678',
        matricula: 'STP1234',
        chofer: 'Sebastian Saucedo',
        choferCI: '5.678.901-2',
        origen: 'Salto',
        destino: 'Colonia',
        fechaSalida: new Date(Date.now() - 3 * 60 * 60 * 1000),
        eta: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
        estado: 1,
        semaforo: 'amarillo',
        precinto: 'BT20240005',
        eslinga_larga: true,
        eslinga_corta: true,
        observaciones: 'Parada programada en Young',
        ubicacionActual: { lat: -32.6953, lng: -57.6329 },
        progreso: 65,
        dua: '788557',
        numeroViaje: '7581860',
        numeroMovimiento: '1238',
        fotoPrecintado: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80'
      }
    ];

    return mockData;
  }
}

export const torreControlService = new TorreControlService();