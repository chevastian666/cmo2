/**
 * Servicio de Notificaciones del Sistema CMO
 * By Cheva
 */

import { SHARED_CONFIG } from '../../config/shared.config';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'alert';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  metadata?: any;
}

type NotificationListener = (notification: Notification) => void;
type NotificationsListener = (notifications: Notification[]) => void;

class NotificationService {
  private notifications: Notification[] = [];
  private listeners = new Set<NotificationListener>();
  private listListeners = new Set<NotificationsListener>();
  private soundEnabled = true;
  private notificationPermission: NotificationPermission = 'default';
  private audioInstances: Map<string, HTMLAudioElement> = new Map();
  private lastSoundTime = 0;
  private soundDebounceMs = 500; // Prevent sound spam

  constructor() {
    this.loadNotifications();
    this.requestPermission();
    this.preloadSounds();
  }

  private preloadSounds(): void {
    if (typeof window === 'undefined') return;
    
    const sounds = ['info', 'success', 'warning', 'error', 'alert'];
    sounds.forEach(type => {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.3;
      audio.preload = 'auto';
      this.audioInstances.set(type, audio);
    });
  }

  // Permission handling
  private async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  // Create notification
  create(
    type: Notification['type'],
    title: string,
    message: string,
    action?: Notification['action'],
    metadata?: any
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      action,
      metadata
    };

    this.addNotification(notification);
    this.showSystemNotification(notification);
    this.playSound(type);

    return notification;
  }

  // Convenience methods
  info(title: string, message: string, action?: Notification['action']): void {
    this.create('info', title, message, action);
  }

  success(title: string, message: string, action?: Notification['action']): void {
    this.create('success', title, message, action);
  }

  warning(title: string, message: string, action?: Notification['action']): void {
    this.create('warning', title, message, action);
  }

  error(title: string, message: string, action?: Notification['action']): void {
    this.create('error', title, message, action);
  }

  alert(title: string, message: string, action?: Notification['action']): void {
    this.create('alert', title, message, action);
  }

  // Alert-specific notifications
  newAlert(alert: any): void {
    const severityMap = {
      critica: 'error',
      alta: 'warning',
      media: 'warning',
      baja: 'info'
    };

    this.create(
      severityMap[alert.severidad as keyof typeof severityMap] as Notification['type'] || 'alert',
      `Nueva Alerta: ${alert.tipo.replace('_', ' ').toUpperCase()}`,
      `Precinto ${alert.codigoPrecinto} - ${alert.mensaje}`,
      {
        label: 'Ver Detalles',
        handler: () => {
          // Navigate to alert details
          window.location.hash = `#/alertas/${alert.id}`;
        }
      },
      { alertId: alert.id, precintoId: alert.precintoId }
    );
  }

  transitDelayed(transit: any): void {
    this.create(
      'warning',
      'Tránsito Demorado',
      `Viaje ${transit.numeroViaje} lleva más de ${Math.floor((Date.now() / 1000 - transit.fechaIngreso) / 60)} minutos pendiente`,
      {
        label: 'Ver Tránsito',
        handler: () => {
          window.location.hash = `#/transitos/${transit.id}`;
        }
      }
    );
  }

  cmoMessage(message: any): void {
    this.create(
      'info',
      'Nuevo Mensaje CMO',
      message.subject || 'Tienes un nuevo mensaje del Centro de Monitoreo',
      {
        label: 'Leer Mensaje',
        handler: () => {
          window.location.hash = `#/cmo/messages/${message.id}`;
        }
      }
    );
  }

  // Management methods
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.persist();
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    let hasUnread = false;
    this.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        hasUnread = true;
      }
    });
    
    if (hasUnread) {
      this.persist();
      this.notifyListeners();
    }
  }

  remove(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.persist();
      this.notifyListeners();
    }
  }

  clearAll(): void {
    this.notifications = [];
    this.persist();
    this.notifyListeners();
  }

  clearOld(daysOld = 7): void {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const originalLength = this.notifications.length;
    
    this.notifications = this.notifications.filter(n => n.timestamp > cutoff);
    
    if (this.notifications.length !== originalLength) {
      this.persist();
      this.notifyListeners();
    }
  }

  // Getters
  getAll(): Notification[] {
    return [...this.notifications];
  }

  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getRecent(limit = 10): Notification[] {
    return this.notifications.slice(0, limit);
  }

  // Settings
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('notification_sound_enabled', String(enabled));
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Subscriptions
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToList(listener: NotificationsListener): () => void {
    this.listListeners.add(listener);
    // Immediately notify with current list
    listener(this.getAll());
    return () => this.listListeners.delete(listener);
  }

  // Private methods
  private addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    
    // Limit stored notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    this.persist();
    this.notifyListeners();
    this.notifyNewNotification(notification);
  }

  private notifyListeners(): void {
    const allNotifications = this.getAll();
    this.listListeners.forEach(listener => {
      try {
        listener(allNotifications);
      } catch (error) {
        console.error('Error in notification list listener:', error);
      }
    });
  }

  private notifyNewNotification(notification: Notification): void {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  private showSystemNotification(notification: Notification): void {
    if ('Notification' in window && 
        Notification.permission === 'granted' &&
        document.hidden) {
      
      const icon = this.getIcon(notification.type);
      
      const systemNotification = new Notification(notification.title, {
        body: notification.message,
        icon: icon,
        tag: notification.id,
        requireInteraction: notification.type === 'alert' || notification.type === 'error'
      });

      systemNotification.onclick = () => {
        window.focus();
        notification.action?.handler();
        systemNotification.close();
      };

      // Auto close after 10 seconds for non-critical
      if (notification.type !== 'alert' && notification.type !== 'error') {
        setTimeout(() => systemNotification.close(), 10000);
      }
    }
  }

  private playSound(type: Notification['type']): void {
    if (!this.soundEnabled) return;

    // Check if we're in a browser environment and user has interacted
    if (typeof window === 'undefined' || !document.hasFocus()) {
      return;
    }

    // Debounce sound playback to prevent spam
    const now = Date.now();
    if (now - this.lastSoundTime < this.soundDebounceMs) {
      return;
    }
    this.lastSoundTime = now;

    const audio = this.audioInstances.get(type);
    if (audio) {
      try {
        // Reset the audio to start if it's already playing
        audio.currentTime = 0;
        
        audio.play().catch(error => {
          // Silently fail for autoplay restrictions
          if (error.name !== 'NotAllowedError') {
            console.debug('Audio playback failed:', error.message);
          }
        });
      } catch (error) {
        console.debug('Failed to play audio:', error);
      }
    }
  }

  private getIcon(type: Notification['type']): string {
    const iconMap = {
      info: '/icons/info.png',
      success: '/icons/success.png',
      warning: '/icons/warning.png',
      error: '/icons/error.png',
      alert: '/icons/alert.png'
    };
    
    return iconMap[type] || '/icons/notification.png';
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private persist(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to persist notifications:', error);
    }
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        // Clean old notifications on load
        this.clearOld();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }

    // Load sound preference
    const soundPref = localStorage.getItem('notification_sound_enabled');
    this.soundEnabled = soundPref !== 'false';
  }

  // Configuration methods
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('notification_sound_enabled', enabled.toString());
  }

  getSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();