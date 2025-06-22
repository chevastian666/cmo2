/**
 * Treemap Error Boundary
 * Catches errors in treemap rendering
 * By Cheva
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class TreemapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(_props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Treemap Error:', error)
    console.error('Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h3 className="text-red-400 font-semibold mb-2">Error al renderizar el Treemap</h3>
          <p className="text-gray-400 mb-4">Ha ocurrido un error al mostrar la visualización.</p>
          {this.state.error && (
            <details className="text-left bg-gray-800 rounded p-4">
              <summary className="cursor-pointer text-sm text-gray-300">Detalles del error</summary>
              <pre className="text-xs text-red-400 mt-2 overflow-auto">
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default TreemapErrorBoundary