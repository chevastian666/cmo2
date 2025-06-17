import { useState, useEffect } from 'react';
import { authService } from '../services/shared/auth.service';
import type { Usuario } from '../types';

interface UseAuthReturn {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  canAccessCMO: () => boolean;
  canAccessEncargados: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState({
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null as string | null
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((authState) => {
      setState(authState);
    });

    // Initialize auth check
    authService.checkAuth();

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<Usuario> => {
    try {
      const user = await authService.login(email, password);
      return user;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
  };

  return {
    ...state,
    login,
    logout,
    hasRole: authService.hasRole.bind(authService),
    canAccessCMO: authService.canAccessCMO.bind(authService),
    canAccessEncargados: authService.canAccessEncargados.bind(authService)
  };
}

// Hook for protected routes
export function useRequireAuth(requiredRoles?: string | string[]): {
  isAuthorized: boolean;
  isLoading: boolean;
  user: Usuario | null;
} {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  
  const isAuthorized = isAuthenticated && (!requiredRoles || hasRole(requiredRoles));
  
  return {
    isAuthorized,
    isLoading,
    user
  };
}

// Hook for user info
export function useUserInfo() {
  const { user } = useAuth();
  
  return {
    name: user?.nombre || 'Usuario',
    email: user?.email || '',
    role: user?.rol || 'user',
    avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=3b82f6&color=fff`,
    id: user?.id || '1',
    puntoOperacion: user?.puntoOperacion || ''
  };
}