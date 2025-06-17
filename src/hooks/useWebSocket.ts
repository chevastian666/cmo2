import { useEffect, useRef, useCallback } from 'react';
import { sharedWebSocketService } from '../services/shared/sharedWebSocket.service';
import { useConnectionStatus } from './useSharedState';

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { 
    onConnect, 
    onDisconnect, 
    onReconnect, 
    autoConnect = true 
  } = options;
  
  const connectionStatus = useConnectionStatus();
  const previousStatus = useRef(connectionStatus);

  useEffect(() => {
    if (autoConnect) {
      sharedWebSocketService.connect();
    }

    return () => {
      // Don't disconnect on unmount as other components might be using it
    };
  }, [autoConnect]);

  useEffect(() => {
    // Handle connection status changes
    if (previousStatus.current !== connectionStatus) {
      switch (connectionStatus) {
        case 'connected':
          if (previousStatus.current === 'reconnecting') {
            onReconnect?.();
          } else {
            onConnect?.();
          }
          break;
        case 'disconnected':
          onDisconnect?.();
          break;
      }
      previousStatus.current = connectionStatus;
    }
  }, [connectionStatus, onConnect, onDisconnect, onReconnect]);

  const send = useCallback((type: string, data: any) => {
    sharedWebSocketService.send(type, data);
  }, []);

  const isConnected = connectionStatus === 'connected';
  const isReconnecting = connectionStatus === 'reconnecting';

  return {
    connectionStatus,
    isConnected,
    isReconnecting,
    send
  };
}

// Hook for subscribing to WebSocket events
export function useWebSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrappedHandler = (data: T) => {
      handlerRef.current(data);
    };

    const unsubscribe = sharedWebSocketService.on(event, wrappedHandler);
    return unsubscribe;
  }, [event, ...deps]);
}

// Typed event hooks
export function useTransitUpdates(
  handler: (data: any) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('transit_update', handler, deps);
}

export function usePrecintoUpdates(
  handler: (data: any) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('precinto_update', handler, deps);
}

export function useAlertUpdates(
  handler: (data: any) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('alert_new', handler, deps);
}

export function useSystemUpdates(
  handler: (data: any) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('system_update', handler, deps);
}

export function useCMOMessages(
  handler: (data: any) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('cmo_message', handler, deps);
}

export function useVehicleTracking(
  handler: (data: any) => void,
  deps: React.DependencyList = []
) {
  useWebSocketEvent('truck_position', handler, deps);
}