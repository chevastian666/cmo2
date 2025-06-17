import { sharedApiService } from '../../../services/shared/sharedApi.service';
import { PrecintoStatus } from '../types';
import type { Precinto, PrecintoFilters } from '../types';

class PrecintosService {
  private readonly API_BASE = '/api/precintos';

  async getPrecintos(filters?: PrecintoFilters): Promise<Precinto[]> {
    console.log('PrecintosService: getPrecintos called with filters:', filters);
    try {
      // In development, return mock data
      if (import.meta.env.DEV) {
        console.log('PrecintosService: DEV mode, returning mock data');
        return this.getMockPrecintos(filters);
      }
      
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status.toString());
      if (filters?.empresa) params.append('empresa', filters.empresa);
      if (filters?.bateriaBaja !== undefined) params.append('bateriaBaja', filters.bateriaBaja.toString());
      if (filters?.ubicacion) params.append('ubicacion', filters.ubicacion);
      if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      
      const response = await sharedApiService.request('GET', `${this.API_BASE}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching precintos:', error);
      return this.getMockPrecintos(filters);
    }
  }

  async getPrecintoById(id: string): Promise<Precinto | null> {
    try {
      if (import.meta.env.DEV) {
        const precintos = this.getMockPrecintos();
        return precintos.find(p => p.id === id) || null;
      }
      
      const response = await sharedApiService.request('GET', `${this.API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching precinto:', error);
      return null;
    }
  }

  async updatePrecinto(id: string, data: Partial<Precinto>): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
      
      const response = await sharedApiService.request('PUT', `${this.API_BASE}/${id}`, data);
      return response.data.success;
    } catch (error) {
      console.error('Error updating precinto:', error);
      return false;
    }
  }

  async assignPrecinto(id: string, empresaId: string, ubicacion: string): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
      
      const response = await sharedApiService.request('POST', `${this.API_BASE}/${id}/assign`, {
        empresaId,
        ubicacion
      });
      return response.data.success;
    } catch (error) {
      console.error('Error assigning precinto:', error);
      return false;
    }
  }

  async sendCommand(id: string, command: string, params?: any): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
      
      const response = await sharedApiService.request('POST', `${this.API_BASE}/${id}/command`, {
        command,
        params
      });
      return response.data.success;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }

  private getMockPrecintos(filters?: PrecintoFilters): Precinto[] {
    const empresas = [
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
      'TCU',
      'Montecon',
      'TCP',
      'Zonamerica',
      'Puerto Nueva Palmira'
    ];

    const precintos: Precinto[] = [];
    const statuses = [
      PrecintoStatus.LISTO,
      PrecintoStatus.ARMADO,
      PrecintoStatus.ALARMA,
      PrecintoStatus.FIN_MONITOREO,
      PrecintoStatus.ROTO
    ];

    for (let i = 1; i <= 100; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const hasUbicacion = status !== PrecintoStatus.ROTO && Math.random() > 0.3;
      const hasGPS = status !== PrecintoStatus.ROTO && Math.random() > 0.2;
      const bateria = status === PrecintoStatus.ROTO ? 0 : Math.floor(Math.random() * 100);
      
      // Generate a number between 1 and 1000 for nqr
      const nqrNumber = Math.floor(Math.random() * 1000) + 1;
      
      precintos.push({
        id: i.toString(),
        nserie: `BT${Math.floor(Math.random() * 899999 + 100000)}`,
        nqr: nqrNumber.toString(),
        telefono: `09${Math.floor(Math.random() * 8999999 + 1000000)}`,
        telefono2: Math.random() > 0.5 ? `09${Math.floor(Math.random() * 8999999 + 1000000)}` : undefined,
        status,
        bateria,
        ultimoReporte: this.generateTimeAgo(),
        inicioReporte: this.generateTimeAgo(true),
        ubicacion: hasUbicacion ? ubicaciones[Math.floor(Math.random() * ubicaciones.length)] : undefined,
        eslinga: Math.random() > 0.5,
        asignadoTransito: status === PrecintoStatus.ARMADO ? `TR-${Math.floor(Math.random() * 9999).toString().padStart(5, '0')}` : undefined,
        empresa: empresas[Math.floor(Math.random() * empresas.length)],
        empresaId: Math.floor(Math.random() * 10 + 1).toString(),
        fechaActivacion: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        gps: hasGPS ? {
          lat: -34.9011 + (Math.random() - 0.5) * 0.1,
          lng: -56.1645 + (Math.random() - 0.5) * 0.1
        } : undefined,
        signal: hasGPS ? Math.floor(Math.random() * 100) : undefined,
        muestreoLocal: Math.floor(Math.random() * 50 + 10),
        muestreoServidor: Math.floor(Math.random() * 50 + 10)
      });
    }

    // Apply filters
    let filtered = precintos;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.id.includes(search) ||
        p.nserie.toLowerCase().includes(search) ||
        p.nqr.includes(search) ||
        p.telefono.includes(search) ||
        p.empresa?.toLowerCase().includes(search)
      );
    }

    if (filters?.status !== undefined) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters?.empresa) {
      filtered = filtered.filter(p => p.empresa === filters.empresa);
    }

    if (filters?.bateriaBaja) {
      filtered = filtered.filter(p => (p.bateria || 0) < 20);
    }

    if (filters?.ubicacion) {
      filtered = filtered.filter(p => p.ubicacion?.toLowerCase().includes(filters.ubicacion.toLowerCase()));
    }

    return filtered;
  }

  private generateTimeAgo(longer = false): string {
    const units = longer ? 
      ['año', 'mes', 'día'] : 
      ['minuto', 'hora', 'día'];
    
    const ranges = longer ?
      [365 * 24 * 60, 30 * 24 * 60, 24 * 60] :
      [1, 60, 24 * 60];
    
    const randomMinutes = Math.floor(Math.random() * (longer ? 525600 : 10080)); // Up to 1 year or 1 week
    
    for (let i = ranges.length - 1; i >= 0; i--) {
      const value = Math.floor(randomMinutes / ranges[i]);
      if (value > 0) {
        return `${value} ${units[i]}${value > 1 ? 's' : ''}`;
      }
    }
    
    return 'Ahora';
  }

  async exportToCSV(filters?: PrecintoFilters): Promise<string> {
    const precintos = await this.getPrecintos(filters);
    
    const headers = [
      'ID',
      'N° Serie',
      'NQR',
      'Teléfono',
      'Teléfono 2',
      'Estado',
      'Batería',
      'Último Reporte',
      'Ubicación',
      'Eslinga',
      'Empresa'
    ];
    
    const rows = precintos.map(p => [
      p.id,
      p.nserie,
      p.nqr,
      p.telefono,
      p.telefono2 || '',
      this.getStatusText(p.status),
      p.bateria ? `${p.bateria}%` : '',
      p.ultimoReporte || '',
      p.ubicacion || '',
      p.eslinga ? 'Sí' : 'No',
      p.empresa || ''
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
  }

  private getStatusText(status: PrecintoStatus): string {
    const statusTexts: Record<PrecintoStatus, string> = {
      [PrecintoStatus.LISTO]: 'Listo',
      [PrecintoStatus.ARMADO]: 'Armado',
      [PrecintoStatus.ALARMA]: 'Alarma',
      [PrecintoStatus.FIN_MONITOREO]: 'Fin de Monitoreo',
      [PrecintoStatus.ROTO]: 'Roto/Inutilizable'
    };
    return statusTexts[status] || 'Desconocido';
  }
}

export const precintosService = new PrecintosService();