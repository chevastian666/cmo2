import { sharedApiService } from '../../../services/shared/sharedApi.service';
import type { Precinto } from '../../../types';

interface ArmadoCommand {
  precintoId: string;
  transitoData: any;
  fotos: File[];
}

class ArmadoService {
  private readonly API_BASE = '/api/armado';

  async searchPrecinto(nqr: string): Promise<Precinto | null> {
    try {
      // In development, return mock data
      if (import.meta.env.DEV) {
        return this.getMockPrecinto(nqr);
      }
      
      const response = await sharedApiService.request('GET', `${this.API_BASE}/precinto/${nqr}`);
      return response.data;
    } catch (error) {
      console.error('Error searching precinto:', error);
      return null;
    }
  }

  async getPendingPrecintos(): Promise<any[]> {
    try {
      // In development, return mock data
      if (import.meta.env.DEV) {
        return this.getMockPendingPrecintos();
      }
      
      const response = await sharedApiService.request('GET', `${this.API_BASE}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending precintos:', error);
      return [];
    }
  }

  async uploadPhotos(precintoId: string, photos: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      formData.append('precintoId', precintoId);
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      // In development, return mock URLs
      if (import.meta.env.DEV) {
        return photos.map((_, index) => `/uploads/precinto_${precintoId}_${index}.jpg`);
      }

      const response = await sharedApiService.request('POST', `${this.API_BASE}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.urls;
    } catch (error) {
      console.error('Error uploading photos:', error);
      return [];
    }
  }

  async executeArmado(command: ArmadoCommand): Promise<{ success: boolean; transitId: string }> {
    try {
      // In development, simulate success
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const transitId = Math.floor(Math.random() * 900000 + 100000).toString();
        return { success: true, transitId };
      }

      const response = await sharedApiService.request('POST', `${this.API_BASE}/execute`, command);
      return response.data;
    } catch (error) {
      console.error('Error executing armado:', error);
      throw error;
    }
  }

  async validateRUT(rut: string): Promise<boolean> {
    // Uruguayan RUT validation
    const cleanRUT = rut.replace(/\D/g, '');
    
    if (cleanRUT.length !== 12) {
      return false;
    }

    // Basic validation - can be enhanced with checksum
    return /^\d{12}$/.test(cleanRUT);
  }

  // Mock data helpers for development
  private getMockPrecinto(nqr: string): Precinto {
    const randomNum = parseInt(nqr.slice(-3)) || Math.floor(Math.random() * 1000) + 1;
    const bateria = Math.floor(Math.random() * 80) + 20;
    const estados = ['SAL', 'LLE', 'FMF', 'CFM', 'CNP'];
    
    return {
      id: `p${randomNum}`,
      codigo: nqr,
      tipo: 'RF-01',
      viaje: Math.floor(Math.random() * 100000 + 7581856).toString(),
      mov: Math.floor(Math.random() * 9999) + 1,
      dua: Math.floor(Math.random() * 11000 + 788553).toString(),
      estado: estados[Math.floor(Math.random() * estados.length)] as 'SAL' | 'LLE' | 'FMF' | 'CFM' | 'CNP',
      ubicacion: {
        lat: -34.8661 + (Math.random() - 0.5) * 0.1,
        lng: -56.1674 + (Math.random() - 0.5) * 0.1,
        direccion: 'Puerto de Montevideo',
        ultimaActualizacion: Date.now() / 1000 - Math.random() * 7200
      },
      bateria,
      gps: {
        estado: Math.random() > 0.2 ? 'activo' : 'sin señal',
        precision: Math.random() > 0.2 ? 5 : 50,
        satelites: Math.floor(Math.random() * 8) + 4
      },
      eslinga: {
        estado: Math.random() > 0.95 ? 'violada' : 'cerrada',
        contador: Math.floor(Math.random() * 5)
      },
      fechaUltimaLectura: Date.now() / 1000 - Math.random() * 7200,
      sensores: {
        temperatura: 22 + Math.random() * 5,
        humedad: 60 + Math.random() * 20,
        movimiento: Math.random() > 0.8,
        luz: Math.random() > 0.5
      }
    };
  }

  private getMockPendingPrecintos(): any[] {
    const locations = ['Puerto de Montevideo', 'Nueva Palmira', 'Colonia', 'Rivera', 'Chuy'];
    const precintos = [];
    
    for (let i = 0; i < 8; i++) {
      const nqr = `NQR${Math.floor(Math.random() * 900000 + 100000)}`;
      const battery = Math.floor(Math.random() * 80) + 20;
      const lastReport = Date.now() / 1000 - Math.random() * 10800; // Up to 3 hours ago
      
      precintos.push({
        nqr,
        battery,
        lastReport,
        location: locations[Math.floor(Math.random() * locations.length)],
        status: battery < 30 || (Date.now() / 1000 - lastReport) > 7200 ? 'warning' : 'ready'
      });
    }
    
    return precintos;
  }
}

export const armadoService = new ArmadoService();