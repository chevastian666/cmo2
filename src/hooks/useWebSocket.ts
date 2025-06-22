import {_useEffect, useRef, useCallback} from 'react'
import { sharedWebSocketService} from '../services/shared/sharedWebSocket.service'
import { useConnectionStatus} from './useSharedState'
interface UseWebSocketOptions {
  onConnect?: () => void
  onDisconnect?: () => void
  onReconnect?: () => void
  autoConnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onConnect, onDisconnect, onReconnect, autoConnect } = options

  const connectionStatus = useConnectionStatus()
  const previousStatus = useRef(_connectionStatus)
    useEffect(() => {
    if (_autoConnect) {
      sharedWebSocketService.connect()
    }

    return () => {
      // Don't disconnect on unmount as other components might be using it
    }
  }, [autoConnect])
    useEffect(() => {
    // Handle connection status changes
    if (previousStatus.current !== connectionStatus) {
      switch (_connectionStatus) {
        case 'connected': {
          if (previousStatus.current === 'reconnecting') {
            onReconnect?.();
          } else {
            onConnect?.();
          }
          break;
        }
    case 'disconnected': {
          onDisconnect?.();
          break;
        }
      }
      previousStatus.current = connectionStatus
    }
  }, [connectionStatus, onConnect, onDisconnect, onReconnect])
  const send = useCallback((type: string, data: unknown) => {
    sharedWebSocketService.send(_type, data)
  }, [connectionStatus, onConnect, onDisconnect, onReconnect])
  const isConnected = connectionStatus === 'connected'
  const isReconnecting = connectionStatus === 'reconnecting'
  return {
    connectionStatus,
    isConnected,
    isReconnecting,
    send
  }
}

// Hook for subscribing to WebSocket events
export function useWebSocketEvent<T = unknown>(event: string, handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(_handler)
  handlerRef.current = handler
    useEffect(() => {
    const wrappedHandler = (data: T) => {
      handlerRef.current(_data)
    }
    const unsubscribe = sharedWebSocketService.on(_event, wrappedHandler)
    return unsubscribe
  }, [event, ...deps])
}

// Typed event hooks
export function useTransitUpdates(handler: (data: unknown) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('transit_update', handler, deps)
  }

export function usePrecintoUpdates(handler: (data: unknown) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('precinto_update', handler, deps)
}

export function useAlertUpdates(handler: (data: unknown) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('alert_new', handler, deps)
}

export function useSystemUpdates(handler: (data: unknown) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('system_update', handler, deps)
}

export function useCMOMessages(handler: (data: unknown) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('cmo_message', handler, deps)
}

export function useVehicleTracking(handler: (data: unknown) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('truck_position', handler, deps)
}