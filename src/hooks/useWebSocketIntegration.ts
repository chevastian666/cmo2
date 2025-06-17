import { useEffect } from 'react';
import { wsService } from '../services/websocket/WebSocketService';
import { 
  usePrecintosStore, 
  useTransitosStore, 
  useAlertasStore, 
  useSystemStatusStore 
} from '../store';

export const useWebSocketIntegration = () => {
  useEffect(() => {
    // Connect WebSocket service
    wsService.connect();

    // Set up event handlers
    wsService.on('onPrecintoUpdate', (data) => {
      const { precinto, action } = data;
      const store = usePrecintosStore.getState();
      
      switch (action) {
        case 'update':
          store.updatePrecinto(precinto.id, precinto);
          break;
        case 'create':
          // Add new precinto if needed
          break;
        case 'delete':
          store.removePrecinto(precinto.id);
          break;
      }
    });

    wsService.on('onTransitoUpdate', (data) => {
      const { transito, action } = data;
      const store = useTransitosStore.getState();
      
      switch (action) {
        case 'update':
          store.updateTransito(transito.id, transito);
          break;
        case 'create':
          // Add new transito if needed
          break;
        case 'delete':
          store.removeTransito(transito.id);
          break;
        case 'precintado':
          // Remove from pending
          store.removeTransito(transito.id);
          break;
      }
    });

    wsService.on('onAlertaNueva', (data) => {
      const { alerta } = data;
      const store = useAlertasStore.getState();
      store.addAlerta(alerta);
    });

    wsService.on('onAlertaUpdate', (data) => {
      const { alerta, action, detalles } = data;
      const store = useAlertasStore.getState();
      
      switch (action) {
        case 'update':
          store.updateAlerta(alerta.id, alerta);
          break;
        case 'atender':
          store.atenderAlerta(alerta.id);
          break;
        case 'asignar':
          if (detalles?.asignacion) {
            // Update extended alert if it's cached
            const extendedAlerta = store.alertasExtendidas.get(alerta.id);
            if (extendedAlerta) {
              store.updateAlertaExtendida(alerta.id, {
                asignacion: detalles.asignacion,
                historial: [...(extendedAlerta.historial || []), {
                  id: `hist-${Date.now()}`,
                  alertaId: alerta.id,
                  tipo: 'asignada',
                  timestamp: Math.floor(Date.now() / 1000),
                  detalles: detalles.asignacion
                }]
              });
            }
          }
          break;
        case 'comentar':
          if (detalles?.comentario) {
            // Update extended alert if it's cached
            const extendedAlerta = store.alertasExtendidas.get(alerta.id);
            if (extendedAlerta) {
              store.updateAlertaExtendida(alerta.id, {
                comentarios: [...(extendedAlerta.comentarios || []), detalles.comentario],
                historial: [...(extendedAlerta.historial || []), {
                  id: `hist-${Date.now()}`,
                  alertaId: alerta.id,
                  tipo: 'comentario',
                  timestamp: Math.floor(Date.now() / 1000),
                  detalles: detalles.comentario
                }]
              });
            }
          }
          break;
        case 'resolver':
          if (detalles?.resolucion) {
            // Update extended alert if it's cached
            const extendedAlerta = store.alertasExtendidas.get(alerta.id);
            if (extendedAlerta) {
              store.updateAlertaExtendida(alerta.id, {
                resolucion: detalles.resolucion,
                historial: [...(extendedAlerta.historial || []), {
                  id: `hist-${Date.now()}`,
                  alertaId: alerta.id,
                  tipo: 'resuelta',
                  timestamp: Math.floor(Date.now() / 1000),
                  detalles: detalles.resolucion
                }]
              });
            }
            // Remove from active alerts
            store.setAlertasActivas(store.alertasActivas.filter(a => a.id !== alerta.id));
          }
          break;
      }
    });

    wsService.on('onSistemaUpdate', (data) => {
      const store = useSystemStatusStore.getState();
      store.updateSystemStatus(data);
    });

    wsService.on('onConnectionChange', (data) => {
      console.log('WebSocket connection status:', data.status);
      if (data.message) {
        console.log('Message:', data.message);
      }
    });

    wsService.on('onError', (error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);
};