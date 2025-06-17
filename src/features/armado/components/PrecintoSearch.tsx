import React, { useState, useRef } from 'react';
import { Search, Loader, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface PrecintoSearchProps {
  onSearch: (nqr: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const PrecintoSearch: React.FC<PrecintoSearchProps> = ({
  onSearch,
  loading = false,
  error = null
}) => {
  const [nqr, setNqr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nqr.trim()) {
      inputRef.current?.focus();
      return;
    }

    onSearch(nqr.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Search className="h-5 w-5 text-blue-500" />
        Buscar Precinto
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nqr" className="block text-sm font-medium text-gray-300 mb-2">
            Número de Precinto (NQR)
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="nqr"
              type="text"
              value={nqr}
              onChange={(e) => setNqr(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Ej: ABC123456"
              className={cn(
                "w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "text-lg font-mono",
                error ? "border-red-500" : "border-gray-600"
              )}
              disabled={loading}
              autoComplete="off"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !nqr.trim()}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg font-medium transition-colors",
              "flex items-center justify-center space-x-2",
              "bg-blue-600 text-white hover:bg-blue-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Buscar Precinto</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setNqr('');
              inputRef.current?.focus();
            }}
            disabled={loading}
            className={cn(
              "px-4 py-3 rounded-lg font-medium transition-colors",
              "bg-gray-700 text-gray-300 hover:bg-gray-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong>Tip:</strong> Ingrese el código NQR del precinto. 
          También puede escanear el código QR si tiene un lector conectado.
        </p>
      </div>
    </div>
  );
};