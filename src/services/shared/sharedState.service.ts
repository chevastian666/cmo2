import { sharedWebSocketService } from './sharedWebSocket.service';
import { sharedApiService } from './sharedApi.service';
import { SHARED_CONFIG } from '../../config/shared.config';
import type { 
  Precinto, 
  TransitoPendiente, 
  Alerta,
  Usuario 
} from '../../types';

interface SharedState {
  // User & Auth
  currentUser: Usuario | null;
  isAuthenticated: boolean;
  
  // Transits
  transitosPendientes: TransitoPendiente[];
  transitosEnProceso: TransitoPendiente[];
  
  // Precintos
  precintosActivos: Precinto[];
  
  // Alerts
  alertasActivas: Alerta[];
  alertasRecientes: Alerta[];
  
  // System
  systemStatus: any;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  
  // Vehicles (for encargados)
  vehiculosEnRuta: any[];
  
  // CMO Messages
  cmoMessages: any[];
  unreadCmoMessages: number;
}

type StateListener = (state: Partial<SharedState>) => void;
type SpecificStateListener<K extends keyof SharedState> = (value: SharedState[K]) => void;

export class SharedStateService {
  private state: SharedState = {
    currentUser: null,
    isAuthenticated: false,
    transitosPendientes: [],
    transitosEnProceso: [],
    precintosActivos: [],
    alertasActivas: [],
    alertasRecientes: [],
    systemStatus: null,
    connectionStatus: 'disconnected',
    vehiculosEnRuta: [],
    cmoMessages: [],
    unreadCmoMessages: 0
  };

  private listeners = new Set<StateListener>();
  private specificListeners = new Map<keyof SharedState, Set<SpecificStateListener<any>>>();
  private updateTimers = new Map<string, NodeJS.Timeout>();
  private isInitialized = false;

  constructor() {
    this.setupWebSocketListeners();
    this.loadStoredState();
  }

  // Initialization
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check authentication
      const user = await sharedApiService.getCurrentUser();
      if (user) {
        this.updateState({ 
          currentUser: user, 
          isAuthenticated: true 
        });
      }

      // Connect WebSocket (will use simulation in development)
      sharedWebSocketService.connect();

      // Load initial data
      if (this.state.isAuthenticated) {
        await this.loadInitialData();
      }

      // Set up auto-refresh
      this.setupAutoRefresh();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize shared state:', error);
      // Continue with initialization even if some parts fail
      this.isInitialized = true;
    }
  }

  private async loadInitialData(): Promise<void> {
    try {
      const [transitos, precintos, alertas, status] = await Promise.all([
        sharedApiService.getTransitosPendientes(),
        sharedApiService.getPrecintosActivos(),
        sharedApiService.getAlertasActivas(),
        sharedApiService.getSystemStatus()
      ]);

      this.updateState({
        transitosPendientes: transitos,
        precintosActivos: precintos,
        alertasActivas: alertas,
        systemStatus: status
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  private setupWebSocketListeners(): void {
    // Connection status
    sharedWebSocketService.onConnection((status) => {
      this.updateState({ connectionStatus: status });
    });

    // Transit updates
    sharedWebSocketService.onTransitUpdate((data) => {
      this.handleTransitUpdate(data);
    });

    // Precinto updates
    sharedWebSocketService.onPrecintoUpdate((data) => {
      this.handlePrecintoUpdate(data);
    });

    // Alert updates
    sharedWebSocketService.onAlertNew((data) => {
      this.handleNewAlert(data);
    });

    // System updates
    sharedWebSocketService.onSystemUpdate((data) => {
      this.updateState({ systemStatus: data });
    });

    // CMO messages
    sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.CMO_MESSAGE, (data) => {
      this.handleCMOMessage(data);
    });

    // Vehicle updates (for encargados)
    sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.TRUCK_POSITION, (data) => {
      this.handleVehicleUpdate(data);
    });
  }

  private setupAutoRefresh(): void {
    // Refresh transits
    this.setRefreshTimer('transitos', SHARED_CONFIG.REFRESH_INTERVALS.TRANSITS, async () => {
      const transitos = await sharedApiService.getTransitosPendientes();
      this.updateState({ transitosPendientes: transitos });
    });

    // Refresh alerts
    this.setRefreshTimer('alertas', SHARED_CONFIG.REFRESH_INTERVALS.ALERTS, async () => {
      const alertas = await sharedApiService.getAlertasActivas();
      this.updateState({ alertasActivas: alertas });
    });

    // Refresh system status
    this.setRefreshTimer('system', SHARED_CONFIG.REFRESH_INTERVALS.SYSTEM_STATUS, async () => {
      const status = await sharedApiService.getSystemStatus();
      this.updateState({ systemStatus: status });
    });
  }

  private setRefreshTimer(key: string, interval: number, callback: () => Promise<void>): void {
    // Clear existing timer
    const existing = this.updateTimers.get(key);
    if (existing) {
      clearInterval(existing);
    }

    // Set new timer
    const timer = setInterval(() => {
      // Only refresh if connected
      if (this.state.connectionStatus === 'connected') {
        callback().catch(error => {
          console.error(`Failed to refresh ${key}:`, error);
        });
      }
    }, interval);

    this.updateTimers.set(key, timer);
  }

  // State updates
  private updateState(updates: Partial<SharedState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Store certain state to localStorage
    this.persistState();

    // Notify general listeners
    this.listeners.forEach(listener => {
      try {
        listener(updates);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });

    // Notify specific listeners
    Object.keys(updates).forEach(key => {
      const listeners = this.specificListeners.get(key as keyof SharedState);
      if (listeners) {
        listeners.forEach(listener => {
          try {
            listener(this.state[key as keyof SharedState]);
          } catch (error) {
            console.error(`Error in specific state listener for ${key}:`, error);
          }
        });
      }
    });
  }

  // Event handlers
  private handleTransitUpdate(data: any): void {
    const { transitId, action, transit } = data;

    switch (action) {
      case 'update':
        this.updateTransitInList(transitId, transit);
        break;
      case 'complete':
        this.removeTransitFromPending(transitId);
        break;
      case 'new':
        this.addTransitToPending(transit);
        break;
    }
  }

  private handlePrecintoUpdate(data: any): void {
    const { precintoId, action, precinto } = data;

    switch (action) {
      case 'update':
        this.updatePrecintoInList(precintoId, precinto);
        break;
      case 'activate':
        this.addPrecintoToActive(precinto);
        break;
      case 'deactivate':
        this.removePrecintoFromActive(precintoId);
        break;
    }
  }

  private handleNewAlert(data: any): void {
    const alert = data.alert || data;
    
    // Add to active alerts
    const alertasActivas = [alert, ...this.state.alertasActivas];
    const alertasRecientes = [alert, ...this.state.alertasRecientes].slice(0, 10);
    
    this.updateState({ alertasActivas, alertasRecientes });

    // Update unread count if part of CMO
    if (alert.requiresCMO) {
      this.updateState({ 
        unreadCmoMessages: this.state.unreadCmoMessages + 1 
      });
    }
  }

  private handleCMOMessage(data: any): void {
    const message = data.message || data;
    const cmoMessages = [message, ...this.state.cmoMessages];
    const unreadCmoMessages = this.state.unreadCmoMessages + (message.read ? 0 : 1);
    
    this.updateState({ cmoMessages, unreadCmoMessages });
  }

  private handleVehicleUpdate(data: any): void {
    const { truckId, position } = data;
    const vehiculosEnRuta = this.state.vehiculosEnRuta.map(v => 
      v.id === truckId ? { ...v, position, lastUpdate: Date.now() } : v
    );
    
    this.updateState({ vehiculosEnRuta });
  }

  // Helper methods
  private updateTransitInList(transitId: string, updates: Partial<TransitoPendiente>): void {
    const transitosPendientes = this.state.transitosPendientes.map(t =>
      t.id === transitId ? { ...t, ...updates } : t
    );
    this.updateState({ transitosPendientes });
  }

  private removeTransitFromPending(transitId: string): void {
    const transitosPendientes = this.state.transitosPendientes.filter(t => t.id !== transitId);
    this.updateState({ transitosPendientes });
  }

  private addTransitToPending(transit: TransitoPendiente): void {
    const transitosPendientes = [transit, ...this.state.transitosPendientes];
    this.updateState({ transitosPendientes });
  }

  private updatePrecintoInList(precintoId: string, updates: Partial<Precinto>): void {
    const precintosActivos = this.state.precintosActivos.map(p =>
      p.id === precintoId ? { ...p, ...updates } : p
    );
    this.updateState({ precintosActivos });
  }

  private addPrecintoToActive(precinto: Precinto): void {
    const precintosActivos = [precinto, ...this.state.precintosActivos];
    this.updateState({ precintosActivos });
  }

  private removePrecintoFromActive(precintoId: string): void {
    const precintosActivos = this.state.precintosActivos.filter(p => p.id !== precintoId);
    this.updateState({ precintosActivos });
  }

  // State persistence
  private persistState(): void {
    const toPersist = {
      currentUser: this.state.currentUser,
      isAuthenticated: this.state.isAuthenticated
    };
    
    localStorage.setItem('shared_state', JSON.stringify(toPersist));
  }

  private loadStoredState(): void {
    const stored = localStorage.getItem('shared_state');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.state = { ...this.state, ...data };
      } catch (error) {
        console.error('Failed to load stored state:', error);
      }
    }
  }

  // Public API
  getState(): SharedState {
    return { ...this.state };
  }

  getStateValue<K extends keyof SharedState>(key: K): SharedState[K] {
    return this.state[key];
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToKey<K extends keyof SharedState>(
    key: K, 
    listener: SpecificStateListener<K>
  ): () => void {
    if (!this.specificListeners.has(key)) {
      this.specificListeners.set(key, new Set());
    }
    
    this.specificListeners.get(key)!.add(listener);
    
    // Immediately call with current value
    listener(this.state[key]);
    
    return () => {
      const listeners = this.specificListeners.get(key);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  // Actions
  async login(email: string, password: string): Promise<void> {
    const response = await sharedApiService.login(email, password);
    this.updateState({ 
      currentUser: response.user, 
      isAuthenticated: true 
    });
    
    // Reinitialize after login
    await this.initialize();
  }

  async logout(): Promise<void> {
    await sharedApiService.logout();
    this.updateState({ 
      currentUser: null, 
      isAuthenticated: false,
      transitosPendientes: [],
      precintosActivos: [],
      alertasActivas: [],
      cmoMessages: [],
      unreadCmoMessages: 0
    });
    
    sharedWebSocketService.disconnect();
    this.cleanup();
  }

  async refreshTransitos(): Promise<void> {
    const transitos = await sharedApiService.getTransitosPendientes();
    this.updateState({ transitosPendientes: transitos });
  }

  async refreshPrecintos(): Promise<void> {
    const precintos = await sharedApiService.getPrecintosActivos();
    this.updateState({ precintosActivos: precintos });
  }

  async refreshAlertas(): Promise<void> {
    const alertas = await sharedApiService.getAlertasActivas();
    this.updateState({ alertasActivas: alertas });
  }

  async markCMOMessageAsRead(messageId: string): Promise<void> {
    await sharedApiService.markMessageAsRead(messageId);
    
    const cmoMessages = this.state.cmoMessages.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    );
    const unreadCmoMessages = Math.max(0, this.state.unreadCmoMessages - 1);
    
    this.updateState({ cmoMessages, unreadCmoMessages });
  }

  // Cleanup
  cleanup(): void {
    this.listeners.clear();
    this.specificListeners.clear();
    
    // Clear timers
    this.updateTimers.forEach(timer => clearInterval(timer));
    this.updateTimers.clear();
    
    this.isInitialized = false;
  }
}

// Export singleton instance
export const sharedStateService = new SharedStateService();