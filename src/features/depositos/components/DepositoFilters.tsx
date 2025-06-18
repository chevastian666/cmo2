import React from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEPOSITO_TIPOS, DEPOSITO_ZONAS } from '../types';
import type { DepositoFilters as Filters } from '../types';

interface DepositoFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

export const DepositoFilters: React.FC<DepositoFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const handleReset = () => {
    onFiltersChange({
      tipo: '',
      zona: '',
      padre: ''
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo */}
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={filters.tipo}
            onValueChange={(value) => onFiltersChange({ ...filters, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {DEPOSITO_TIPOS.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zona */}
        <div className="space-y-2">
          <Label>Zona</Label>
          <Select
            value={filters.zona}
            onValueChange={(value) => onFiltersChange({ ...filters, zona: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {DEPOSITO_ZONAS.map(zona => (
                <SelectItem key={zona} value={zona}>{zona}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Padre */}
        <div className="space-y-2">
          <Label>Padre</Label>
          <Select
            value={filters.padre}
            onValueChange={(value) => onFiltersChange({ ...filters, padre: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {DEPOSITO_ZONAS.map(zona => (
                <SelectItem key={zona} value={zona}>{zona}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="secondary"
          onClick={handleReset}
        >
          Limpiar filtros
        </Button>
        <Button
          onClick={onClose}
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
};