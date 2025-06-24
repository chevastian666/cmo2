import React, { useState } from 'react'
import { Shield, Loader, AlertCircle} from 'lucide-react'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Label} from '@/components/ui/label'
import { Alert, AlertDescription} from '@/components/ui/alert'
export const LoginPage: React.FC = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (!email || !password) {
      setLocalError('Por favor completa todos los campos')
      return
    }

    try {
      await login(_email, password)
      // Navigation will be handled by the auth state change
    } catch (err: unknown) {
      setLocalError(err.message || 'Error al iniciar sesión')
    }
  }
  const displayError = localError || error
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

        <form className="mt-8 space-y-6" onSubmit={_handleSubmit}>
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{_displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={_email}
                onChange={(_e) => setEmail(e.target.value)}
                placeholder="usuario@blocktracker.uy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={_password}
                onChange={(_e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={_isLoading}
              className="w-full"
              size="default"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
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
  )
}