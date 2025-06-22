import {_useEffect} from 'react'
import { wsService} from '../services/websocket/WebSocketService'
import { 
  usePrecintosStore, useTransitosStore, useAlertasStore, useSystemStatusStore} from '../store'
export const useWebSocketIntegration = () => {

  useEffect(() => {
    // Connect WebSocket service
    wsService.connect()
    // Set up event handlers
    wsService.on('onPrecintoUpdate', (_data) => {

      const store = usePrecintosStore.getState()
      switch (_action) {
        case 'update': {
  store.updatePrecinto(precinto.id, precinto)
          break
    }
    case 'create':
          // Add new precinto if needed
          break
    }
    case 'delete':
          store.removePrecinto(precinto.id)
          break
      }
    })
    wsService.on('onTransitoUpdate', (_data) => {

      const store = useTransitosStore.getState()
      switch (_action) {
        case 'update': {
  store.updateTransito(transito.id, transito)
          break
    }
    case 'create':
          // Add new transito if needed
          break
    }
    case 'delete':
          store.removeTransito(transito.id)
          break
    }
    case 'precintado':
          // Remove from pending
          store.removeTransito(transito.id)
          break
      }
    })
    wsService.on('onAlertaNueva', (_data) => {

      const store = useAlertasStore.getState()
      store.addAlerta(_alerta)
    })
    wsService.on('onAlertaUpdate', (_data) => {

      const store = useAlertasStore.getState()
      switch (_action) {
        case 'update': {
  store.updateAlerta(alerta.id, alerta)
          break
    }
    case 'atender':
          store.atenderAlerta(alerta.id)
          break
    }
    case 'asignar':
          if (detalles?.asignacion) {
            // Update extended alert if it's cached
            const extendedAlerta = store.alertasExtendidas.get(alerta.id)
            if (_extendedAlerta) {
              store.updateAlertaExtendida(alerta.id, {
                asignacion: detalles.asignacion,
                historial: [...(extendedAlerta.historial || []), {
                  id: `hist-${Date.now()}`,
                  alertaId: alerta.id,
                  tipo: 'asignada',
                  timestamp: Math.floor(Date.now() / 1000),
                  detalles: detalles.asignacion
                }]
              })
            }
          }
          break
    }
    case 'comentar':
          if (detalles?.comentario) {
            // Update extended alert if it's cached
            const extendedAlerta = store.alertasExtendidas.get(alerta.id)
            if (_extendedAlerta) {
              store.updateAlertaExtendida(alerta.id, {
                comentarios: [...(extendedAlerta.comentarios || []), detalles.comentario],
                historial: [...(extendedAlerta.historial || []), {
                  id: `hist-${Date.now()}`,
                  alertaId: alerta.id,
                  tipo: 'comentario',
                  timestamp: Math.floor(Date.now() / 1000),
                  detalles: detalles.comentario
                }]
              })
            }
          }
          break
    }
    case 'resolver':
          if (detalles?.resolucion) {
            // Update extended alert if it's cached
            const extendedAlerta = store.alertasExtendidas.get(alerta.id)
            if (_extendedAlerta) {
              store.updateAlertaExtendida(alerta.id, {
                resolucion: detalles.resolucion,
                historial: [...(extendedAlerta.historial || []), {
                  id: `hist-${Date.now()}`,
                  alertaId: alerta.id,
                  tipo: 'resuelta',
                  timestamp: Math.floor(Date.now() / 1000),
                  detalles: detalles.resolucion
                }]
              })
            }
            // Remove from active alerts
            store.setAlertasActivas(store.alertasActivas.filter(a => a.id !== alerta.id))
          }
          break
      }
    })
    wsService.on('onSistemaUpdate', (_data) => {
      const store = useSystemStatusStore.getState()
      store.updateSystemStatus(_data)
    })
    wsService.on('onConnectionChange', (_data) => {
      console.log('WebSocket connection status:', data.status)
      if (data.message) {
        console.log('Message:', data.message)
      }
    })
    wsService.on('onError', (__error) => {
      console.error('WebSocket error:', _error)
    })
    // Cleanup on unmount
    return () => {
      wsService.disconnect()
    }
  }, [])
}