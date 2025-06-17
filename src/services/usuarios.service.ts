import type { Usuario } from '../types';

// Mock users for development
const mockUsuarios: Usuario[] = [
  {
    id: 'usr-1',
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@blocktracker.uy',
    rol: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=3b82f6&color=fff',
    activo: true
  },
  {
    id: 'usr-2',
    nombre: 'María Fernández',
    email: 'maria.fernandez@blocktracker.uy',
    rol: 'supervisor',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Fernandez&background=8b5cf6&color=fff',
    activo: true
  },
  {
    id: 'usr-3',
    nombre: 'Juan Pérez',
    email: 'juan.perez@blocktracker.uy',
    rol: 'operador',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=10b981&color=fff',
    activo: true
  },
  {
    id: 'usr-4',
    nombre: 'Ana Silva',
    email: 'ana.silva@blocktracker.uy',
    rol: 'operador',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Silva&background=f59e0b&color=fff',
    activo: true
  },
  {
    id: 'usr-5',
    nombre: 'Roberto Gómez',
    email: 'roberto.gomez@blocktracker.uy',
    rol: 'supervisor',
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Gomez&background=ef4444&color=fff',
    activo: false
  }
];

export const usuariosService = {
  getAll: async (): Promise<Usuario[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsuarios;
  },

  getActivos: async (): Promise<Usuario[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsuarios.filter(u => u.activo);
  },

  getById: async (id: string): Promise<Usuario | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsuarios.find(u => u.id === id) || null;
  },

  getCurrentUser: async (): Promise<Usuario> => {
    // Return the first admin user as current user
    return mockUsuarios[0];
  }
};