import { sharedApiService } from '../../../services/shared/sharedApi.service';

interface TransitInfo {
  track: string;
  empresaid: string;
  VjeId: string;
  MovId: string;
  precintoid: string[];
  DUA: string;
  fecha: number;
  MatTra: string;
  MatTraOrg: string;
  MatZrr?: string;
  MatRemo?: string;
  ConNmb: string;
  ConNDoc: string;
  ConTDoc?: string;
  ConODoc?: string;
  ConTel: string;
  plidEnd?: string;
  depEnd?: string;
}

class PrearmadoService {
  private readonly API_BASE = '/api/prearmado';

  async searchTransit(viajeId: string, movimientoId: string): Promise<TransitInfo | null> {
    try {
      // In development, return mock data
      if (import.meta.env.DEV) {
        return this.getMockTransitInfo(viajeId, movimientoId);
      }
      
      const response = await sharedApiService.request('GET', 
        `${this.API_BASE}/search?VjeId=${viajeId}&MovId=${movimientoId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching transit:', error);
      return null;
    }
  }

  private getMockTransitInfo(viajeId: string, movimientoId: string): TransitInfo | null {
    // Simulate not found for some combinations
    if (viajeId === '999999' || movimientoId === '999') {
      return null;
    }

    const empresas = ['176', '45', '123', '89', '201', '156'];
    const conductores = [
      { nombre: 'Juan Pérez', doc: '45678901', tel: '099123456' },
      { nombre: 'Carlos Rodríguez', doc: '34567890', tel: '098765432' },
      { nombre: 'Miguel González', doc: '23456789', tel: '091234567' },
      { nombre: 'Roberto Silva', doc: '12345678', tel: '094567890' },
      { nombre: 'Diego Martínez', doc: '56789012', tel: '092345678' }
    ];
    
    const conductor = conductores[Math.floor(Math.random() * conductores.length)];
    const hasRemolque = Math.random() > 0.5;
    const hasZorra = Math.random() > 0.7;
    
    return {
      track: `${new Date().getFullYear()}-${viajeId.slice(-2)}-${movimientoId}/URAZD`,
      empresaid: empresas[Math.floor(Math.random() * empresas.length)],
      VjeId: viajeId,
      MovId: movimientoId,
      precintoid: [`NQR${Math.floor(Math.random() * 900000 + 100000)}`],
      DUA: Math.floor(Math.random() * 100000 + 700000).toString(),
      fecha: Date.now() / 1000 - Math.random() * 86400 * 7, // Within last 7 days
      MatTra: `MTP${Math.floor(Math.random() * 9000 + 1000)}`,
      MatTraOrg: Math.floor(Math.random() * 999).toString(),
      MatZrr: hasZorra ? `MTP${Math.floor(Math.random() * 9000 + 1000)}` : undefined,
      MatRemo: hasRemolque ? `MTP${Math.floor(Math.random() * 9000 + 1000)}` : undefined,
      ConNmb: conductor.nombre,
      ConNDoc: conductor.doc,
      ConTDoc: '2', // CI uruguaya
      ConODoc: 'UY',
      ConTel: conductor.tel,
      plidEnd: Math.floor(Math.random() * 16 + 1).toString(),
      depEnd: Math.floor(Math.random() * 9000 + 1000).toString()
    };
  }
}

export const prearmadoService = new PrearmadoService();