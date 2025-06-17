import type { 
  WebSocketMessage, 
  WebSocketEventHandlers,
  PrecintoUpdateData,
  TransitoUpdateData,
  AlertaUpdateData,
  SistemaUpdateData,
  ConnectionData
} from './types';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventHandlers: WebSocketEventHandlers = {};
  private isSimulated = false;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor(url?: string) {
    this.url = url || import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    
    // If no URL or localhost, use simulated mode
    if (!url || url.includes('localhost')) {
      this.isSimulated = true;
    }
  }

  connect(): void {
    if (this.isSimulated) {
      this.startSimulation();
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.notifyConnectionChange({ status: 'disconnected' });
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else if (this.isSimulated) {
      console.log('Simulated send:', message);
    }
  }

  on<K extends keyof WebSocketEventHandlers>(
    event: K, 
    handler: WebSocketEventHandlers[K]
  ): void {
    this.eventHandlers[event] = handler;
  }

  off<K extends keyof WebSocketEventHandlers>(event: K): void {
    delete this.eventHandlers[event];
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.startHeartbeat();
      this.notifyConnectionChange({ status: 'connected' });
      // Mark connection as active for polling fallback
      window.localStorage.setItem('ws-connected', 'true');
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.eventHandlers.onError?.(new Error('WebSocket connection error'));
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      window.localStorage.setItem('ws-connected', 'false');
      this.handleReconnect();
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'precinto_update':
        this.eventHandlers.onPrecintoUpdate?.(message.data as PrecintoUpdateData);
        break;
      case 'transito_update':
        this.eventHandlers.onTransitoUpdate?.(message.data as TransitoUpdateData);
        break;
      case 'alerta_nueva':
        this.eventHandlers.onAlertaNueva?.(message.data as AlertaUpdateData);
        break;
      case 'alerta_update':
        this.eventHandlers.onAlertaUpdate?.(message.data as AlertaUpdateData);
        break;
      case 'sistema_update':
        this.eventHandlers.onSistemaUpdate?.(message.data as SistemaUpdateData);
        break;
      case 'heartbeat':
        // Heartbeat received, connection is alive
        break;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyConnectionChange({ 
        status: 'disconnected', 
        message: 'Unable to connect to server' 
      });
      return;
    }

    this.reconnectAttempts++;
    this.notifyConnectionChange({ status: 'reconnecting' });

    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.connect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat', timestamp: Date.now() });
    }, 30000); // Every 30 seconds
  }

  private notifyConnectionChange(data: ConnectionData): void {
    this.eventHandlers.onConnectionChange?.(data);
  }

  // Simulation methods for development
  private startSimulation(): void {
    console.log('Starting WebSocket simulation mode');
    this.notifyConnectionChange({ status: 'connected', message: 'Simulation mode' });
    window.localStorage.setItem('ws-connected', 'true');

    // Simulate real-time updates
    this.simulationInterval = setInterval(() => {
      const random = Math.random();

      // 30% chance of new alert
      if (random < 0.3) {
        this.simulateNewAlert();
      }
      // 40% chance of transit update
      else if (random < 0.7) {
        this.simulateTransitUpdate();
      }
      // 20% chance of precinto update
      else if (random < 0.9) {
        this.simulatePrecintoUpdate();
      }
      // 10% chance of system update
      else {
        this.simulateSystemUpdate();
      }
    }, 3000); // Every 3 seconds
  }

  private simulateNewAlert(): void {
    const alertTypes = ['violacion', 'bateria_baja', 'fuera_de_ruta', 'sin_signal', 'temperatura'];
    const severidades = ['critica', 'alta', 'media', 'baja'];
    
    const alerta: AlertaUpdateData = {
      alerta: {
        id: `alert-${Date.now()}`,
        tipo: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
        precintoId: `pr-${Math.floor(Math.random() * 10)}`,
        codigoPrecinto: `BT${String(2024000 + Math.floor(Math.random() * 100)).padStart(8, '0')}`,
        mensaje: 'Alerta simulada en tiempo real',
        timestamp: Math.floor(Date.now() / 1000),
        severidad: severidades[Math.floor(Math.random() * severidades.length)] as any,
        atendida: false,
        ubicacion: {
          lat: -34.9011 + (Math.random() - 0.5) * 0.1,
          lng: -56.1645 + (Math.random() - 0.5) * 0.1
        }
      },
      action: 'create'
    };

    this.handleMessage({
      type: 'alerta_nueva',
      timestamp: Date.now(),
      data: alerta
    });
  }

  private simulateTransitUpdate(): void {
    const update: TransitoUpdateData = {
      transito: {
        id: `tr-${Math.floor(Math.random() * 12)}`,
        estado: Math.random() > 0.5 ? 'en_proceso' : 'pendiente'
      },
      action: 'update'
    };

    this.handleMessage({
      type: 'transito_update',
      timestamp: Date.now(),
      data: update
    });
  }

  private simulatePrecintoUpdate(): void {
    const estados = ['SAL', 'LLE', 'FMF', 'CFM', 'CNP'];
    const update: PrecintoUpdateData = {
      precinto: {
        id: `pr-${Math.floor(Math.random() * 10)}`,
        estado: estados[Math.floor(Math.random() * estados.length)] as any,
        ubicacionActual: {
          lat: -34.9011 + (Math.random() - 0.5) * 0.1,
          lng: -56.1645 + (Math.random() - 0.5) * 0.1,
          direccion: 'Ubicación actualizada'
        },
        bateria: Math.floor(Math.random() * 100),
        fechaUltimaLectura: Math.floor(Date.now() / 1000)
      },
      action: 'update'
    };

    this.handleMessage({
      type: 'precinto_update',
      timestamp: Date.now(),
      data: update
    });
  }

  private simulateSystemUpdate(): void {
    const update: SistemaUpdateData = {
      smsPendientes: Math.floor(Math.random() * 200),
      precintosActivos: 1200 + Math.floor(Math.random() * 100),
      alertasActivas: Math.floor(Math.random() * 20),
      dbStats: {
        memoriaUsada: 60 + Math.random() * 30,
        discoUsado: 40 + Math.random() * 20
      },
      apiStats: {
        memoriaUsada: 50 + Math.random() * 40,
        discoUsado: 20 + Math.random() * 30
      },
      reportesPendientes: Math.floor(Math.random() * 30)
    };

    this.handleMessage({
      type: 'sistema_update',
      timestamp: Date.now(),
      data: update
    });
  }
}

// Singleton instance
export const wsService = new WebSocketService();