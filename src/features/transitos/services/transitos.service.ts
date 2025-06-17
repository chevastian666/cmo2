import { sharedApiService } from '../../../services/shared/sharedApi.service';
import { unifiedAPIService } from '../../../services/api/unified.service';
import type { Transito } from '../types';

interface TransitosResponse {
  data: Transito[];
  total: number;
  page: number;
  limit: number;
}

interface TransitosParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

class TransitosService {
  private readonly API_BASE = '/api/transitos';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getTransitos(params: TransitosParams = {}): Promise<TransitosResponse> {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, filters } = params;
      
      // In development, return mock data with pagination
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
        const allData = this.getMockTransitos();
        const filteredData = this.applyFilters(allData, filters);
        const sortedData = this.applySorting(filteredData, sortBy, sortOrder);
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = sortedData.slice(startIndex, endIndex);
        
        return {
          data: paginatedData,
          total: sortedData.length,
          page,
          limit
        };
      }
      
      // Use unified API service for real data
      const response = await unifiedAPIService.getTransitos({
        estado: filters?.estado,
        fechaDesde: filters?.fechaDesde,
        fechaHasta: filters?.fechaHasta,
        empresa: filters?.empresa,
        page,
        limit
      });
      
      // Apply client-side sorting if needed
      if (sortBy && response.data.length > 0) {
        response.data = this.applySorting(response.data, sortBy, sortOrder);
      }
      
      return {
        data: response.data,
        total: response.total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching transitos:', error);
      // Return paginated mock data on error
      return this.getTransitos({ ...params });
    }
  }
  
  private applyFilters(data: Transito[], filters?: Record<string, any>): Transito[] {
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = (item as any)[key];
        if (typeof value === 'string') {
          return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
        }
        return itemValue === value;
      });
    });
  }
  
  private applySorting(data: Transito[], sortBy?: string, sortOrder?: 'asc' | 'desc'): Transito[] {
    if (!sortBy) return data;
    
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  async getTransitoById(id: string): Promise<Transito | null> {
    try {
      if (import.meta.env.DEV) {
        const transitos = this.getMockTransitos();
        return transitos.find(t => t.id === id) || null;
      }
      
      const response = await sharedApiService.request('GET', `${this.API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transito:', error);
      return null;
    }
  }

  async markDesprecintado(id: string): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.clearCache(); // Clear cache after update
        return true;
      }
      
      const response = await sharedApiService.request('PUT', `${this.API_BASE}/${id}/desprecintado`);
      if (response.data.success) {
        this.clearCache(); // Clear cache after successful update
      }
      return response.data.success;
    } catch (error) {
      console.error('Error marking desprecintado:', error);
      return false;
    }
  }

  async updateTransito(id: string, data: { dua?: string; destino?: string }): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.clearCache(); // Clear cache after update
        return true;
      }
      
      const response = await sharedApiService.request('PUT', `${this.API_BASE}/${id}`, data);
      if (response.data.success) {
        this.clearCache(); // Clear cache after successful update
      }
      return response.data.success;
    } catch (error) {
      console.error('Error updating transito:', error);
      throw error;
    }
  }
  
  clearCache(): void {
    this.cache.clear();
  }

  private getMockTransitos(): Transito[] {
    const despachantes = [
      'SKUNCA SPINELLI CAROLINA',
      'SCHRAMM CANABAL AGUSTINA',
      'ZUGASTI BARRIO FERNANDO LUIS',
      'QUEROL CAVANI CARLOS RAFAEL',
      'LUIS LAUREIRO',
      'LAMANNA ACEVEDO MARIO NELSON'
    ];

    const ubicaciones = [
      'Rilcomar',
      'Taminer',
      'Briasol',
      'Murchison',
      'Rincorando',
      'Talfir',
      'Fiancar',
      'Paysandu',
      'Perkinston',
      'Zonamerica',
      'Cavimar',
      'TCU',
      'Trebolir',
      'Pta Pereira ZF',
      'Colonia ZF',
      'Cuecar',
      'Fray Bentos',
      'Salto',
      'Puerto',
      'Campusol',
      'Florida ZF',
      'Rivera CI',
      'Supramar cont',
      'ATM Puerto',
      'TCP Modulo',
      'Montecon Modulo',
      'Godilco',
      'Supramar Yacare',
      'Libertad ZF',
      'Bella Union Puente',
      'Puerto Colonia',
      'Nueva Helvecia ZF',
      'Vimalcor',
      'PDLC',
      'Lobraus',
      'Navinten TCU',
      'Tugentman',
      'Frimaral',
      'Orbiplus',
      'Fioren Artigas',
      'Bomport',
      'Acegua Riasur',
      'Chuy CO',
      'Rio Branco CI',
      'UPM Fray Bentos',
      'Supramar',
      'TCP Enlonados',
      'Depo 20 Montecon',
      'Utilaje',
      'Planir',
      'Drimper',
      'Mirentex Aeropuerto',
      'Bomport Pta Sayago',
      'Gicoral Bella Union',
      'Paysandu Puente',
      'Puerto Nueva Palmira',
      'Nueva Palmira ZF',
      'Mitracont cont',
      'Buquebus Puerto',
      'Depositos Montevideo',
      'Zeinal Buquebus',
      'Obrinel',
      'Bomport cont',
      'TCP',
      'Montecon',
      'Tebetur',
      'DISA',
      'Dapama',
      'Mitracont',
      'Aguada Park',
      'WTC',
      'Frigorifico Modelo',
      'Soldo Hmnos',
      'Visuar',
      'Teyma',
      'Chediack',
      'Pilotes',
      'Mbopicua',
      'Fray Bentos Darok',
      'Zeinal Colonia',
      'Aeropuerto Punta del Este',
      'Navinten Punta del Este',
      'Acegua CI',
      'Puerto Paysandu',
      'Tamer',
      'Murchison Puerto',
      'Marine La Teja',
      'Correo TCU',
      'Correo CV',
      'Mayabel Ruta 5',
      'Rilco La Tablada',
      'CORREO TCU',
      'Expoactiva',
      'Expoactiva ARS',
      'Badonel',
      'Expo Melilla',
      'Terminal Granelera TGU',
      'URUGUAYAN MARINE SAFETY',
      'Encatex',
      'Fadimax',
      'Bomport Contenedores',
      'Expo Prado',
      'Drimper R101',
      'TERMINAL CUENCA DEL PLATA',
      'WTC Punta del Este',
      'Gorfeld Fray Bentos Puente',
      'Reca',
      'DAP Salto',
      'BETOROL',
      'AYAX',
      'Mercomar',
      'URU FOREST',
      'SUPRAMAR S.A.'
    ];

    const estados: Array<'en_viaje' | 'desprecintado' | 'con_alerta'> = ['en_viaje', 'desprecintado', 'con_alerta'];

    const transitos: Transito[] = [];

    for (let i = 1; i <= 50; i++) {
      const fechaSalida = new Date();
      fechaSalida.setDate(fechaSalida.getDate() - Math.floor(Math.random() * 30));
      
      const eta = new Date(fechaSalida);
      eta.setDate(eta.getDate() + Math.floor(Math.random() * 5) + 1);

      const estado = estados[Math.floor(Math.random() * estados.length)];
      const progreso = estado === 'desprecintado' ? 100 : Math.floor(Math.random() * 90) + 10;

      const precintoNum = Math.floor(Math.random() * 1000) + 1;
      
      // Generar datos de camión y conductor
      const matriculas = ['STP1234', 'STP1234', 'STP1234', 'STP1234'];
      const conductores = [
        { nombre: 'Juan Pérez', documento: '12345678' },
        { nombre: 'Sebastian Saucedo', documento: 'ARG987654' },
        { nombre: 'Pedro Silva', documento: 'BRA456789' },
        { nombre: 'Miguel Rodríguez', documento: '87654321' }
      ];
      
      const matriculaSeleccionada = matriculas[Math.floor(Math.random() * matriculas.length)];
      const conductorSeleccionado = conductores[Math.floor(Math.random() * conductores.length)];
      
      transitos.push({
        id: `TR-${i.toString().padStart(5, '0')}`,
        dua: `${788553 + i}`,
        precinto: precintoNum.toString(),
        viaje: String(7581856 + Math.floor(Math.random() * 100000)),
        mov: Math.floor(Math.random() * 9999) + 1,
        precintoId: `PR-${precintoNum}`,
        estado,
        fechaSalida: fechaSalida.toISOString(),
        fechaInicio: fechaSalida,
        eta: estado === 'desprecintado' ? undefined : eta.toISOString(),
        encargado: `Operador ${i}`,
        origen: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
        destino: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
        empresa: despachantes[Math.floor(Math.random() * despachantes.length)],
        matricula: matriculaSeleccionada,
        chofer: conductorSeleccionado.nombre,
        telefonoConductor: `099 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`,
        vehiculo: {
          matricula: matriculaSeleccionada,
          conductor: {
            nombre: conductorSeleccionado.nombre,
            documento: conductorSeleccionado.documento,
            id: `CAM-${i}`
          }
        },
        progreso,
        alertas: estado === 'con_alerta' ? [
          'Desvío de ruta detectado',
          'Sin señal GPS por más de 1 hora'
        ] : undefined,
        observaciones: Math.random() > 0.7 ? 'Carga refrigerada - Mantener cadena de frío' : undefined
      });
    }

    return transitos;
  }
}

export const transitosService = new TransitosService();