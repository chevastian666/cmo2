/**
 * Alert Store with External Sync Support
 * Optimized for React 18 useSyncExternalStore
 */

interface Alert {
  id: string;
  type: 'violation' | 'tamper' | 'security' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  precintoId: string;
  message: string;
  timestamp: Date;
  location?: { lat: number; lng: number; address: string };
  acknowledged: boolean;
}

type Listener = () => void;

class AlertStore {
  private alerts: Alert[] = [];
  private listeners: Set<Listener> = new Set();
  private serverSnapshot: Alert[] = [];

  constructor() {
    // Initialize with some mock data in development
    if (process.env.NODE_ENV === 'development') {
      this.initializeMockData();
    }

    // Set up WebSocket connection for real-time updates
    this.setupWebSocket();
  }

  // Subscribe to store changes
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // Get current snapshot
  getSnapshot = (): Alert[] => {
    return this.alerts;
  };

  // Get server snapshot for SSR
  getServerSnapshot = (): Alert[] => {
    return this.serverSnapshot;
  };

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Add new alert
  addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>) {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts = [newAlert, ...this.alerts];
    this.notifyListeners();

    // Play sound for critical alerts
    if (alert.severity === 'critical') {
      this.playAlertSound();
    }
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string) {
    this.alerts = this.alerts.map(alert =>
      alert.id === alertId
        ? { ...alert, acknowledged: true }
        : alert
    );
    this.notifyListeners();
  }

  // Remove alert
  removeAlert(alertId: string) {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    this.notifyListeners();
  }

  // Clear all alerts
  clearAlerts() {
    this.alerts = [];
    this.notifyListeners();
  }

  // Clear acknowledged alerts
  clearAcknowledged() {
    this.alerts = this.alerts.filter(alert => !alert.acknowledged);
    this.notifyListeners();
  }

  // Get alerts by severity
  getAlertsBySeverity(severity: Alert['severity']): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  // Get unacknowledged count
  getUnacknowledgedCount(): number {
    return this.alerts.filter(alert => !alert.acknowledged).length;
  }

  // Play alert sound
  private playAlertSound() {
    // Implementation depends on your audio setup
    if ('Audio' in window) {
      const audio = new Audio('/sounds/critical-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  // WebSocket setup for real-time updates
  private setupWebSocket() {
    // This would connect to your actual WebSocket server
    // For now, we'll simulate with random alerts
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        if (Math.random() > 0.95) {
          this.simulateRandomAlert();
        }
      }, 5000);
    }
  }

  // Simulate random alert for testing
  private simulateRandomAlert() {
    const types: Alert['type'][] = ['violation', 'tamper', 'security', 'system'];
    const severities: Alert['severity'][] = ['critical', 'high', 'medium', 'low'];
    const precintos = ['PRECINTO-001', 'PRECINTO-002', 'PRECINTO-003', 'PRECINTO-004'];
    const messages = [
      'Unauthorized seal opening detected',
      'Temperature threshold exceeded',
      'GPS signal lost',
      'Tampering attempt detected',
      'Route deviation detected',
      'Battery critically low'
    ];

    this.addAlert({
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      precintoId: precintos[Math.floor(Math.random() * precintos.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      location: Math.random() > 0.5 ? {
        lat: -34.6037 + (Math.random() - 0.5) * 0.1,
        lng: -58.3816 + (Math.random() - 0.5) * 0.1,
        address: 'Buenos Aires, Argentina'
      } : undefined
    });
  }

  // Initialize with mock data
  private initializeMockData() {
    const mockAlerts: Alert[] = [
      {
        id: 'alert-1',
        type: 'violation',
        severity: 'critical',
        precintoId: 'PRECINTO-001',
        message: 'Seal breach detected - Immediate action required',
        timestamp: new Date(Date.now() - 60000),
        location: { lat: -34.6037, lng: -58.3816, address: 'Puerto Madero, Buenos Aires' },
        acknowledged: false
      },
      {
        id: 'alert-2',
        type: 'tamper',
        severity: 'high',
        precintoId: 'PRECINTO-002',
        message: 'Multiple tampering attempts detected',
        timestamp: new Date(Date.now() - 120000),
        acknowledged: false
      },
      {
        id: 'alert-3',
        type: 'security',
        severity: 'medium',
        precintoId: 'PRECINTO-003',
        message: 'Unexpected route deviation',
        timestamp: new Date(Date.now() - 300000),
        location: { lat: -34.6137, lng: -58.3916, address: 'Retiro, Buenos Aires' },
        acknowledged: true
      }
    ];

    this.alerts = mockAlerts;
    this.serverSnapshot = mockAlerts;
  }
}

// Create singleton instance
export const alertStore = new AlertStore();