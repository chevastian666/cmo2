import React, { useState } from 'react'
import { AlertTriangle, Shield, Battery, Package, Clock, CheckCircle, Navigation, Pause, Zap, WifiOff, Satellite, Eye} from 'lucide-react'
import { cn} from '@/lib/utils'
import { formatTimeAgo, formatDateTime} from '../../../utils/formatters'
import type { Alerta} from '../../../types'
import { TIPOS_ALERTA} from '../../../types/monitoring'
import { DataTable} from '../../../components/DataTable'
import { useAlertaExtendida, useAlertasStore} from '../../../store/hooks/useAlertas'
import type { Column } from '../../../components/DataTable/DataTable'
import { AlertaDetalleModalV2} from './AlertaDetalleModalV2'
import { ResponderAlertaModal} from './ResponderAlertaModal'
import { notificationService} from '../../../services/shared/notification.service'
// shadcn/ui components
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
export const AlertsTableV2: React.FC = () => {
  const { alertas, loading, error, actions } = useAlertasStore()
  const [selectedAlertaId, setSelectedAlertaId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAlertaForResponse, setSelectedAlertaForResponse] = useState<Alerta | null>(null)
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
  const handleAlertClick = (alerta: Alerta) => {
    setSelectedAlertaId(alerta.id)
    setIsModalOpen(true)
  }
  const handleVerificar = (alerta: Alerta, event: React.MouseEvent) => {
    event.stopPropagation()
    if (alerta.atendida) {
      notificationService.info('Esta alerta ya fue atendida')
      return
    }
    
    setSelectedAlertaForResponse(alerta)
    setIsResponseModalOpen(true)
  }
  const handleResponderAlerta = async (alertaId: string, _motivoId: number, _motivoDescripcion: string, _observaciones?: string) => {
    try {
      await actions.atenderAlerta(alertaId)
      notificationService.success('Alerta respondida correctamente')
      // Alert response handled successfully
    } catch {
      notificationService.error('Error al responder la alerta')
      // Error handled above with notification
      throw error
    }
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedAlertaId(null)
  }
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'AAR':
        return <Clock className="h-4 w-4" />
      case 'BBJ':
        return <Battery className="h-4 w-4" />
      case 'DEM':
        return <Pause className="h-4 w-4" />
      case 'DNR':
        return <Navigation className="h-4 w-4" />
      case 'DTN':
        return <Shield className="h-4 w-4" />
      case 'NPG':
        return <Satellite className="h-4 w-4" />
      case 'NPN':
        return <WifiOff className="h-4 w-4" />
      case 'PTN':
        return <Package className="h-4 w-4" />
      case 'SNA':
        return <Zap className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }
  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'text-red-400 bg-red-900/20'
      case 'alta':
        return 'text-orange-400 bg-orange-900/20'
      case 'media':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'baja':
        return 'text-blue-400 bg-blue-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }
  const getSeveridadVariant = (severidad: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severidad) {
      case 'critica':
      case 'alta':
        return 'destructive'
      case 'media':
        return 'secondary'
      case 'baja':
        return 'outline'
      default:
        return 'default'
    }
  }
  const columns: Column<Alerta>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: Object.entries(TIPOS_ALERTA).map(([key, value]) => ({
        value: key,
        label: value
      })),
      width: '120px',
      accessor: (item) => (
        <div className="flex items-center space-x-2">
          <div className={cn('p-1.5 rounded', getSeveridadColor(item.severidad))}>
            {getIcon(item.tipo)}
          </div>
          <span className="text-sm">{item.tipo}</span>
        </div>
      )
    },
    {
      key: 'codigoPrecinto',
      header: 'Precinto',
      sortable: true,
      filterable: true,
      accessor: (item) => <span className="font-medium">{item.codigoPrecinto}</span>
    },
    {
      key: 'severidad',
      header: 'Severidad',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'critica', label: 'Crítica' },
        { value: 'alta', label: 'Alta' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja' }
      ],
      width: '120px',
      accessor: (item) => (
        <Badge variant={getSeveridadVariant(item.severidad)}>
          {item.severidad}
        </Badge>
      )
    },
    {
      key: 'mensaje',
      header: 'Mensaje',
      sortable: false,
      filterable: true,
      accessor: (item) => (
        <div className="max-w-md">
          <p className="text-sm text-muted-foreground truncate">{item.mensaje}</p>
        </div>
      )
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      sortable: false,
      accessor: (item) => (item.ubicacion ? (
          <Button
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation()
              notificationService.info('Función de mapa próximamente')
            }}
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            Ver
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      )
    },
    {
      key: 'timestamp',
      header: 'Tiempo',
      sortable: true,
      accessor: (item) => (
        <div className="text-sm">
          <div>{formatTimeAgo(item.timestamp)}</div>
          <div className="text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</div>
        </div>
      )
    },
    {
      key: 'atendida',
      header: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'false', label: 'Activa' },
        { value: 'true', label: 'Atendida' }
      ],
      width: '100px',
      accessor: (item) => (
        <Badge variant={item.atendida ? 'outline' : 'destructive'}>
          {item.atendida ? 'Atendida' : 'Activa'}
        </Badge>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      sortable: false,
      width: '120px',
      accessor: (item) => (<div className="flex items-center justify-center">
          <Button
            size="sm"
            variant={item.atendida ? "secondary" : "default"}
            onClick={(e) => handleVerificar(item, e)}
            disabled={item.atendida}
            title={item.atendida ? 'Alerta ya verificada' : 'Responder alerta'}
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Verificar
          </Button>
        </div>
      )
    }
  ]
  const handleExport = (data: Alerta[], format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `alertas-${timestamp}`
    if (format === 'csv') {
      const headers = ['Tipo', 'Precinto', 'Severidad', 'Mensaje', 'Ubicación', 'Fecha/Hora', 'Estado']
      const rows = data.map(a => [
        a.tipo.replace('_', ' '),
        a.codigoPrecinto,
        a.severidad,
        a.mensaje,
        a.ubicacion ? `${a.ubicacion.lat}, ${a.ubicacion.lng}` : '',
        formatDateTime(a.timestamp),
        a.atendida ? 'Atendida' : 'Activa'
      ])
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }
  const {data: selectedAlerta} =  useAlertaExtendida(selectedAlertaId)
  return (<>
      <DataTable
        data={alertas}
        columns={columns}
        loading={loading}
        error={error}
        pageSize={20}
        searchPlaceholder="Buscar alertas..."
        onRowClick={handleAlertClick}
        onExport={handleExport}
        emptyStateProps={{
          icon: AlertTriangle, title: "No hay alertas activas", description: "No se han detectado alertas en el sistema"
        }}
        className="cursor-pointer"
      />

      {selectedAlerta && (
        <AlertaDetalleModalV2
          alerta={selectedAlerta}
          isOpen={isModalOpen}
          onClose={closeModal}
          onAsignar={(_usuarioId, _notas) => {
            // Assignment handled
            notificationService.success('Alerta asignada correctamente')
          }}
          onComentar={(_mensaje) => {
            // Comment added
            notificationService.success('Comentario agregado')
          }}
          onResolver={(_tipo, _descripcion, _acciones) => {
            // Alert resolved
            notificationService.success('Alerta resuelta correctamente')
            closeModal()
          }}
        />
      )}

      {selectedAlertaForResponse && (<ResponderAlertaModal
          alerta={selectedAlertaForResponse}
          isOpen={isResponseModalOpen}
          onClose={() => {
            setIsResponseModalOpen(false)
            setSelectedAlertaForResponse(null)
          }}
          onResponder={handleResponderAlerta}
        />
      )}
    </>
  )
}