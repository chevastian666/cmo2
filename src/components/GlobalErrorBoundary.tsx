/**
 * Global Error Boundary Component
 * Catches React errors and displays fallback UI
 * By Cheva
 */

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw} from 'lucide-react'
interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Algo salió mal
            </h1>
            <p className="text-gray-400 mb-4">
              Se produjo un error inesperado. Por favor, intenta recargar la página.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer mb-2">
                  Detalles del error
                </summary>
                <pre className="text-xs text-red-400 bg-gray-900 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="space-y-2">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary