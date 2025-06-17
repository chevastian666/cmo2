import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary: Error caught:', error);
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary: Error details:', {
      componentName: this.props.componentName,
      error: error,
      errorInfo: errorInfo
    });
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <h2 className="text-red-400 font-bold mb-2">
            Error en {this.props.componentName || 'Component'}
          </h2>
          <p className="text-red-300 mb-2">
            {this.state.error?.message || 'Un error inesperado ha ocurrido'}
          </p>
          {this.state.errorInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer text-red-400 hover:text-red-300">
                Ver detalles del error
              </summary>
              <pre className="mt-2 text-xs text-gray-400 overflow-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}