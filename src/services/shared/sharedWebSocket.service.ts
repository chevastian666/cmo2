import { SHARED_CONFIG } from '../../config/shared.config';

type EventCallback = (data: any) => void;
type ConnectionCallback = (status: 'connected' | 'disconnected' | 'reconnecting') => void;

interface QueuedMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
}

export class SharedWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  // Event listeners
  private eventListeners = new Map<string, Set<EventCallback>>();
  private globalListeners = new Set<EventCallback>();
  private connectionListeners = new Set<ConnectionCallback>();
  
  // Message queue for offline support
  private messageQueue: QueuedMessage[] = [];
  private isAuthenticated = false;
  
  // State tracking
  private connectionState: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastEventTimestamps = new Map<string, number>();

  constructor(url?: string) {
    this.url = url || SHARED_CONFIG.WS_BASE_URL;
    
    // Enable simulation mode in development or when explicitly set
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA || this.url.includes('localhost')) {
      console.log('WebSocket running in simulation mode');
    }
  }

  // Connection management
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    // Use simulation mode in development
    if (SHARED_CONFIG.IS_DEVELOPMENT || SHARED_CONFIG.ENABLE_MOCK_DATA) {
      this.startSimulation();
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
      this.updateConnectionState('reconnecting');
    } catch (error) {
      console.error('WebSocket connection error:', error);
      // Fall back to simulation mode
      if (SHARED_CONFIG.IS_DEVELOPMENT) {
        console.log('Falling back to simulation mode');
        this.startSimulation();
      } else {
        this.scheduleReconnect();
      }
    }
  }

  disconnect(): void {
    this.clearTimers();
    this.stopSimulation();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isAuthenticated = false;
    this.updateConnectionState('disconnected');
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.updateConnectionState('connected');
      this.authenticate();
      this.startHeartbeat();
      this.processMessageQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isAuthenticated = false;
      this.updateConnectionState('disconnected');
      this.clearTimers();
      this.scheduleReconnect();
    };
  }

  private handleMessage(message: any): void {
    const { type, data, id, timestamp } = message;

    // Handle system messages
    switch (type) {
      case 'auth_success':
        this.isAuthenticated = true;
        console.log('WebSocket authenticated');
        break;
      
      case 'auth_error':
        console.error('WebSocket authentication failed:', data);
        this.disconnect();
        break;
      
      case 'heartbeat':
        // Heartbeat acknowledged
        break;
      
      case 'error':
        console.error('WebSocket error message:', data);
        break;
      
      default:
        // Handle business events
        this.emitEvent(type, data);
        this.lastEventTimestamps.set(type, timestamp || Date.now());
    }
  }

  private authenticate(): void {
    const token = localStorage.getItem(SHARED_CONFIG.AUTH_TOKEN_KEY);
    if (token) {
      this.send('auth', { token });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, 30000); // Every 30 seconds
  }

  private clearTimers(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionState('disconnected');
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionState('reconnecting');

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.connect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  private updateConnectionState(state: 'connected' | 'disconnected' | 'reconnecting'): void {
    this.connectionState = state;
    this.connectionListeners.forEach(listener => listener(state));
  }

  // Message handling
  send(type: string, data: any = {}): void {
    const message = {
      id: this.generateMessageId(),
      type,
      data,
      timestamp: Date.now()
    };

    if (this.isConnected() && this.isAuthenticated) {
      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send message:', error);
        this.queueMessage(message);
      }
    } else {
      this.queueMessage(message);
    }
  }

  private queueMessage(message: QueuedMessage): void {
    this.messageQueue.push({ ...message, retries: 0 });
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (!this.isConnected() || !this.isAuthenticated) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        if (message.retries < 3) {
          message.retries++;
          this.messageQueue.push(message);
        }
      }
    }
  }

  // Event subscription
  on(event: string, callback: EventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
    };
  }

  onAny(callback: EventCallback): () => void {
    this.globalListeners.add(callback);
    return () => this.globalListeners.delete(callback);
  }

  onConnection(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    // Immediately call with current state
    callback(this.connectionState);
    return () => this.connectionListeners.delete(callback);
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.eventListeners.delete(event);
    } else {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    // Emit to specific event listeners
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Emit to global listeners
    this.globalListeners.forEach(callback => {
      try {
        callback({ type: event, data });
      } catch (error) {
        console.error('Error in global event listener:', error);
      }
    });
  }

  // Simulation mode
  private simulationInterval: NodeJS.Timeout | null = null;
  
  private startSimulation(): void {
    console.log('Starting WebSocket simulation mode');
    this.updateConnectionState('connected');
    this.isAuthenticated = true;
    
    // Simulate periodic updates
    this.simulationInterval = setInterval(() => {
      const random = Math.random();
      
      // 20% chance of new alert
      if (random < 0.2) {
        this.simulateAlert();
      }
      // 30% chance of transit update
      else if (random < 0.5) {
        this.simulateTransitUpdate();
      }
      // 20% chance of precinto update
      else if (random < 0.7) {
        this.simulatePrecintoUpdate();
      }
      // 30% chance of system update
      else {
        this.simulateSystemUpdate();
      }
    }, 5000); // Every 5 seconds
  }
  
  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
  
  private simulateAlert(): void {
    const alertTypes = ['violacion', 'bateria_baja', 'fuera_de_ruta', 'sin_signal', 'temperatura'];
    const severidades = ['critica', 'alta', 'media', 'baja'];
    
    this.emitEvent(SHARED_CONFIG.WS_EVENTS.ALERT_NEW, {
      alert: {
        id: `alert-${Date.now()}`,
        tipo: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        precintoId: `pr-${Math.floor(Math.random() * 10)}`,
        codigoPrecinto: `BT${String(2024000 + Math.floor(Math.random() * 100)).padStart(8, '0')}`,
        mensaje: 'Alerta simulada en tiempo real',
        timestamp: Math.floor(Date.now() / 1000),
        severidad: severidades[Math.floor(Math.random() * severidades.length)],
        atendida: false,
        ubicacion: {
          lat: -34.9011 + (Math.random() - 0.5) * 0.1,
          lng: -56.1645 + (Math.random() - 0.5) * 0.1
        }
      }
    });
  }
  
  private simulateTransitUpdate(): void {
    this.emitEvent(SHARED_CONFIG.WS_EVENTS.TRANSIT_UPDATE, {
      transitId: `tr-${Math.floor(Math.random() * 10)}`,
      action: 'update',
      transit: {
        estado: Math.random() > 0.5 ? 'en_proceso' : 'pendiente'
      }
    });
  }
  
  private simulatePrecintoUpdate(): void {
    const estados = ['SAL', 'LLE', 'FMF', 'CFM', 'CNP'];
    
    this.emitEvent(SHARED_CONFIG.WS_EVENTS.PRECINTO_UPDATE, {
      precintoId: `pr-${Math.floor(Math.random() * 10)}`,
      action: 'update',
      precinto: {
        estado: estados[Math.floor(Math.random() * estados.length)],
        bateria: Math.floor(Math.random() * 100),
        ubicacionActual: {
          lat: -34.9011 + (Math.random() - 0.5) * 0.1,
          lng: -56.1645 + (Math.random() - 0.5) * 0.1,
          direccion: 'Ubicación actualizada'
        }
      }
    });
  }
  
  private simulateSystemUpdate(): void {
    this.emitEvent(SHARED_CONFIG.WS_EVENTS.SYSTEM_UPDATE, {
      smsPendientes: Math.floor(Math.random() * 200),
      precintosActivos: 127 + Math.floor(Math.random() * 20),
      alertasActivas: Math.floor(Math.random() * 10),
      dbStats: {
        memoriaUsada: 60 + Math.random() * 30,
        discoUsado: 40 + Math.random() * 20
      },
      apiStats: {
        memoriaUsada: 50 + Math.random() * 40,
        discoUsado: 20 + Math.random() * 30
      },
      reportesPendientes: Math.floor(Math.random() * 30)
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || this.simulationInterval !== null;
  }

  getConnectionState(): 'connected' | 'disconnected' | 'reconnecting' {
    return this.connectionState;
  }

  getLastEventTimestamp(event: string): number | undefined {
    return this.lastEventTimestamps.get(event);
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Typed event methods for common operations
  emitTransitUpdate(transitId: string, data: any): void {
    this.send(SHARED_CONFIG.WS_EVENTS.TRANSIT_UPDATE, { transitId, ...data });
  }

  emitPrecintoUpdate(precintoId: string, data: any): void {
    this.send(SHARED_CONFIG.WS_EVENTS.PRECINTO_UPDATE, { precintoId, ...data });
  }

  emitAlertUpdate(alertId: string, data: any): void {
    this.send(SHARED_CONFIG.WS_EVENTS.ALERT_UPDATE, { alertId, ...data });
  }

  emitTruckPosition(truckId: string, position: any): void {
    this.send(SHARED_CONFIG.WS_EVENTS.TRUCK_POSITION, { truckId, position });
  }

  emitCMOMessage(message: any): void {
    this.send(SHARED_CONFIG.WS_EVENTS.CMO_MESSAGE, message);
  }

  // Subscribe to typed events
  onTransitUpdate(callback: (data: any) => void): () => void {
    return this.on(SHARED_CONFIG.WS_EVENTS.TRANSIT_UPDATE, callback);
  }

  onPrecintoUpdate(callback: (data: any) => void): () => void {
    return this.on(SHARED_CONFIG.WS_EVENTS.PRECINTO_UPDATE, callback);
  }

  onAlertNew(callback: (data: any) => void): () => void {
    return this.on(SHARED_CONFIG.WS_EVENTS.ALERT_NEW, callback);
  }

  onSystemUpdate(callback: (data: any) => void): () => void {
    return this.on(SHARED_CONFIG.WS_EVENTS.SYSTEM_UPDATE, callback);
  }
}

// Export singleton instance
export const sharedWebSocketService = new SharedWebSocketService();