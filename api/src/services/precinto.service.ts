/**
 * Precinto Service
 * Business logic for electronic seals
 * By Cheva
 */

import { ApiError } from '../middleware/errorHandler';

interface Precinto {
  id: string;
  codigo: string;
  tipo: 'RFID' | 'GPS' | 'HIBRIDO';
  estado: string;
  companyId?: string;
  ubicacion?: {
    lat: number;
    lng: number;
    direccion?: string;
    timestamp: Date;
  };
  bateria?: number;
  temperatura?: number;
  createdAt: Date;
  updatedAt: Date;
}

class PrecintoService {
  private precintos: Map<string, Precinto> = new Map();

  async getAll(
    page: number, 
    limit: number, 
    filters: { estado?: string; tipo?: string; companyId?: string }
  ): Promise<{ data: Precinto[]; total: number }> {
    let precintos = Array.from(this.precintos.values());
    
    // Apply filters
    if (filters.estado) {
      precintos = precintos.filter(p => p.estado === filters.estado);
    }
    if (filters.tipo) {
      precintos = precintos.filter(p => p.tipo === filters.tipo);
    }
    if (filters.companyId) {
      precintos = precintos.filter(p => p.companyId === filters.companyId);
    }
    
    // Pagination
    const start = (page - 1) * limit;
    const paginatedPrecintos = precintos.slice(start, start + limit);
    
    return {
      data: paginatedPrecintos,
      total: precintos.length
    };
  }

  async getById(id: string): Promise<Precinto | null> {
    return this.precintos.get(id) || null;
  }

  async create(data: Partial<Precinto>): Promise<Precinto> {
    const precinto: Precinto = {
      id: crypto.randomUUID(),
      codigo: data.codigo!,
      tipo: data.tipo!,
      estado: 'creado',
      companyId: data.companyId,
      bateria: 100,
      temperatura: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.precintos.set(precinto.id, precinto);
    return precinto;
  }

  async update(id: string, data: Partial<Precinto>): Promise<Precinto> {
    const precinto = this.precintos.get(id);
    if (!precinto) {
      throw new ApiError(404, 'Precinto not found');
    }
    
    const updated = {
      ...precinto,
      ...data,
      id,
      updatedAt: new Date()
    };
    
    this.precintos.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.precintos.delete(id);
  }

  async activate(id: string, transitId?: string, userId?: string): Promise<Precinto> {
    const precinto = await this.getById(id);
    if (!precinto) {
      throw new ApiError(404, 'Precinto not found');
    }
    
    if (precinto.estado !== 'creado') {
      throw new ApiError(400, 'Precinto cannot be activated in current state');
    }
    
    return this.update(id, { estado: 'activado' });
  }

  async deactivate(id: string, reason?: string, userId?: string): Promise<Precinto> {
    const precinto = await this.getById(id);
    if (!precinto) {
      throw new ApiError(404, 'Precinto not found');
    }
    
    return this.update(id, { estado: 'desactivado' });
  }

  async updateLocation(
    id: string, 
    location: { lat: number; lng: number; address?: string; timestamp: Date }
  ): Promise<any> {
    const precinto = await this.getById(id);
    if (!precinto) {
      throw new ApiError(404, 'Precinto not found');
    }
    
    await this.update(id, { ubicacion: location });
    return location;
  }
}

export const precintoService = new PrecintoService();