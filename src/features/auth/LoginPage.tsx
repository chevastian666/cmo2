import React, { useState } from 'react';
import { Shield, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    try {
      await login(email, password);
      // Navigation will be handled by the auth state change
    } catch (err: any) {
      setLocalError(err.message || 'Error al iniciar sesión');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Block Tracker
          </h2>
          <p className="mt-2 text-base text-gray-400">
            Centro de Monitoreo de Operaciones
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {displayError && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-base text-red-400">{displayError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-300">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-base text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="usuario@blocktracker.uy"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-base text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-base text-gray-400">
              ¿Problemas para acceder?{' '}
              <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                Contacta al administrador
              </a>
            </p>
          </div>
        </form>

        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="text-center text-sm text-gray-500">
            <p>Sistema autorizado por la Dirección Nacional de Aduanas</p>
            <p className="mt-1">© 2024 Block Tracker - Todos los derechos reservados</p>
          </div>
        </div>

        {/* Demo credentials hint (remove in production) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Credenciales de prueba:</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">Admin: sebastian.saucedo@blocktracker.uy</p>
              <p className="text-gray-300">Supervisor: maria.fernandez@blocktracker.uy</p>
              <p className="text-gray-300">Operador: juan.perez@blocktracker.uy</p>
              <p className="text-gray-400 mt-2">Contraseña: password123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};