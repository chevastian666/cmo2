import React, { useState, useRef, useEffect } from 'react';
import { Search, QrCode, Loader, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nqr.trim()) {
      inputRef.current?.focus();
      return;
    }
    onSearch(nqr.trim());
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-3">
          <Search className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-white">Buscar Precinto</h2>
        </div>
        
        <div className="mt-3 flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={nqr}
              onChange={(e) => setNqr(e.target.value)}
              placeholder="Ingrese código NQR del precinto"
              disabled={loading}
              className={cn(
                "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg",
                "text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "pr-10"
              )}
            />
            <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={loading || !nqr.trim()}
            className={cn(
              "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium",
              "hover:bg-blue-700 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center space-x-2"
            )}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Buscar</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};