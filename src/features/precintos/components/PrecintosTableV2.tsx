import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {MoreHorizontal, ArrowUpDown, Eye, Edit, Trash2, Link2, Battery, _Wifi, _MapPin, _AlertTriangle, _CheckCircle} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DataTableV2 } from '@/components/ui/data-table/DataTableV2';
import { cn } from '@/lib/utils';
import type { Precinto } from '../../../types';

// Mock data for demonstration
const mockPrecintos: Precinto[] = [
  {
    id: '1',
    codigo: 'BT20240001',
    tipo: 'TRACKER',
    estado: 'ACTIVO',
    bateria: 85,
    señal: 'BUENA',
    ubicacion: {
      lat: -34.9011,
      lng: -56.1645,
      direccion: 'Montevideo, Uruguay'
    },
    ultimaActualizacion: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    viaje: {
      id: '1',
      numeroViaje: '7581856',
      origen: 'Montevideo',
      destino: 'Rivera',
      estado: 'EN_TRANSITO'
    }
  },
  {
    id: '2',
    codigo: 'BT20240002',
    tipo: 'TRACKER',
    estado: 'INACTIVO',
    bateria: 45,
    señal: 'REGULAR',
    ubicacion: {
      lat: -32.5228,
      lng: -55.7658,
      direccion: 'Tacuarembó, Uruguay'
    },
    ultimaActualizacion: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    viaje: null
  },
  {
    id: '3',
    codigo: 'BT20240003',
    tipo: 'SATELITAL',
    estado: 'ALERTA',
    bateria: 15,
    señal: 'DEBIL',
    ubicacion: {
      lat: -30.9534,
      lng: -55.5504,
      direccion: 'Rivera, Uruguay'
    },
    ultimaActualizacion: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    viaje: {
      id: '3',
      numeroViaje: '7581858',
      origen: 'Salto',
      destino: 'Montevideo',
      estado: 'DETENIDO'
    }
  }
];

import { PrecintosTableSkeleton } from './PrecintosTableSkeleton';

interface PrecintosTableProps {
  loading?: boolean;
}

export const PrecintosTableV2: React.FC<PrecintosTableProps> = ({ loading = false }) => {
  const [selectedPrecinto, setSelectedPrecinto] = useState<Precinto | null>(null);

  const columns: ColumnDef<Precinto>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'codigo',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Código
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const precinto = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{precinto.codigo}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string;
        const variant = 
          estado === 'ACTIVO' ? 'success' :
          estado === 'ALERTA' ? 'destructive' :
          'secondary';
        
        return (
          <Badge variant={variant as unknown}>
            {estado === 'ACTIVO' && <CheckCircle className="mr-1 h-3 w-3" />}
            {estado === 'ALERTA' && <AlertTriangle className="mr-1 h-3 w-3" />}
            {estado}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'bateria',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Batería
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const bateria = row.getValue('bateria') as number;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Battery className={cn(
                  "h-4 w-4 mr-1",
                  bateria >= 60 ? "text-green-500" :
                  bateria >= 30 ? "text-yellow-500" : "text-red-500"
                )} />
                <span>{bateria}%</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Estado de Batería</h4>
                  <p className="text-sm text-muted-foreground">
                    Información detallada del estado de la batería
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm">Nivel:</span>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            bateria >= 60 ? "bg-green-500" :
                            bateria >= 30 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${bateria}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{bateria}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm">Voltaje:</span>
                    <span className="col-span-2 text-sm">3.7V</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm">Tiempo restante:</span>
                    <span className="col-span-2 text-sm">~{Math.round(bateria * 0.48)} horas</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm">Última carga:</span>
                    <span className="col-span-2 text-sm">Hace 3 días</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      accessorKey: 'señal',
      header: 'Señal',
      cell: ({ row }) => {
        const señal = row.getValue('señal') as string;
        const color = 
          señal === 'BUENA' ? 'text-green-500' :
          señal === 'REGULAR' ? 'text-yellow-500' : 'text-red-500';
        
        return (
          <div className="flex items-center gap-2">
            <Wifi className={cn("h-4 w-4", color)} />
            <span className="text-sm">{señal}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'ubicacion',
      header: 'Ubicación',
      cell: ({ row }) => {
        const ubicacion = row.original.ubicacion;
        return ubicacion ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                <span className="truncate max-w-[150px]">{ubicacion.direccion}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Ubicación Actual</h4>
                  <p className="text-sm text-muted-foreground">
                    {ubicacion.direccion}
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm">Latitud:</span>
                    <span className="col-span-2 text-sm font-mono">{ubicacion.lat.toFixed(6)}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm">Longitud:</span>
                    <span className="col-span-2 text-sm font-mono">{ubicacion.lng.toFixed(6)}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm">Precisión:</span>
                    <span className="col-span-2 text-sm">±5 metros</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver en mapa
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <span className="text-gray-500">Sin ubicación</span>
        );
      },
    },
    {
      accessorKey: 'viaje',
      header: 'Viaje',
      cell: ({ row }) => {
        const viaje = row.original.viaje;
        return viaje ? (
          <div className="text-sm">
            <div className="font-medium">{viaje.numeroViaje}</div>
            <div className="text-gray-400 text-xs">
              {viaje.origen} → {viaje.destino}
            </div>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">Sin viaje</span>
        );
      },
    },
    {
      accessorKey: 'ultimaActualizacion',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Última actualización
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const fecha = row.getValue('ultimaActualizacion') as Date;
        const ahora = new Date();
        const diff = ahora.getTime() - fecha.getTime();
        const minutos = Math.floor(diff / 1000 / 60);
        
        let tiempo = '';
        if (minutos < 60) {
          tiempo = `Hace ${minutos} min`;
        } else if (minutos < 1440) {
          tiempo = `Hace ${Math.floor(minutos / 60)} horas`;
        } else {
          tiempo = `Hace ${Math.floor(minutos / 1440)} días`;
        }
        
        return (
          <span className="text-sm text-gray-400">{tiempo}</span>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const precinto = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedPrecinto(precinto)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return <PrecintosTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Precintos</h2>
        <Button>
          Nuevo Precinto
        </Button>
      </div>
      
      <DataTableV2
        columns={columns}
        data={mockPrecintos}
        searchPlaceholder="Buscar precintos..."
        showColumnVisibility={true}
        showPagination={true}
        pageSize={10}
      />
    </div>
  );
};