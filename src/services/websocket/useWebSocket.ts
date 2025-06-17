import { useEffect, useState } from 'react';
import { wsService } from './WebSocketService';
import { 
  usePrecintosStore, 
  useTransitosStore, 
  useAlertasStore, 
  useSystemStatusStore 
} from '../../store';
import type { ConnectionData } from './types';
import { emitNotification } from '../../features/common/components/RealtimeNotifications';

export interface WebSocketStatus {
  isConnected: boolean;
  status: ConnectionData['status'];
  message?: string;
}

export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>({
    isConnected: false,
    status: 'disconnected'
  });

  useEffect(() => {
    // Set up event handlers
    wsService.on('onConnectionChange', (data) => {
      setConnectionStatus({
        isConnected: data.status === 'connected',
        status: data.status,
        message: data.message
      });
      
      // Notify connection changes
      if (data.status === 'connected') {
        emitNotification({
          type: 'success',
          title: 'Conexión Establecida',
          message: 'Sistema conectado en tiempo real'
        });
      } else if (data.status === 'disconnected' && data.message) {
        emitNotification({
          type: 'error',
          title: 'Conexión Perdida',
          message: data.message,
          autoDismiss: false
        });
      }
    });

    // Handle precinto updates
    wsService.on('onPrecintoUpdate', (data) => {
      const store = usePrecintosStore.getState();
      
      switch (data.action) {
        case 'update':
          store.updatePrecinto(data.precinto.id, data.precinto);
          break;
        case 'create':
          // Add new precinto to both lists if active
          const newPrecinto = data.precinto as any;
          store.setPrecintos([...store.precintos, newPrecinto]);
          if (['SAL', 'LLE', 'FMF', 'CFM', 'CNP'].includes(newPrecinto.estado)) {
            store.setPrecintosActivos([...store.precintosActivos, newPrecinto]);
          }
          break;
        case 'delete':
          store.removePrecinto(data.precinto.id);
          break;
      }
    });

    // Handle transito updates
    wsService.on('onTransitoUpdate', (data) => {
      const store = useTransitosStore.getState();
      
      switch (data.action) {
        case 'update':
          store.updateTransito(data.transito.id, data.transito);
          break;
        case 'create':
          const newTransito = data.transito as any;
          store.setTransitos([...store.transitos, newTransito]);
          if (newTransito.estado === 'pendiente') {
            store.setTransitosPendientes([...store.transitosPendientes, newTransito]);
          }
          break;
        case 'delete':
          store.removeTransito(data.transito.id);
          break;
        case 'precintado':
          // Remove from pending and update status
          store.updateTransito(data.transito.id, { estado: 'precintado' });
          store.setTransitosPendientes(
            store.transitosPendientes.filter(t => t.id !== data.transito.id)
          );
          break;
      }
    });

    // Handle new alerts
    wsService.on('onAlertaNueva', (data) => {
      const store = useAlertasStore.getState();
      store.addAlerta(data.alerta);
      
      // Show notification for critical alerts
      if (data.alerta.severidad === 'critica') {
        emitNotification({
          type: 'error',
          title: 'Alerta Crítica',
          message: data.alerta.mensaje,
          autoDismiss: false
        });
        
        // Also show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Alerta Crítica', {
            body: data.alerta.mensaje,
            icon: '/favicon.ico',
            tag: data.alerta.id
          });
        }
      } else if (data.alerta.severidad === 'alta') {
        emitNotification({
          type: 'warning',
          title: 'Alerta de Seguridad',
          message: data.alerta.mensaje
        });
      }
    });

    // Handle alert updates
    wsService.on('onAlertaUpdate', (data) => {
      const store = useAlertasStore.getState();
      
      if (data.action === 'atender') {
        store.updateAlerta(data.alerta.id, { atendida: true });
        store.setAlertasActivas(
          store.alertasActivas.filter(a => a.id !== data.alerta.id)
        );
      } else {
        store.updateAlerta(data.alerta.id, data.alerta);
      }
    });

    // Handle system updates
    wsService.on('onSistemaUpdate', (data) => {
      const store = useSystemStatusStore.getState();
      store.updateSystemStatus(data);
    });

    // Connect WebSocket
    wsService.connect();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      wsService.disconnect();
    };
  }, []);

  return {
    connectionStatus,
    reconnect: () => wsService.connect(),
    disconnect: () => wsService.disconnect()
  };
};