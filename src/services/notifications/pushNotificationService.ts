/**
 * Browser Push Notification Service
 * Handles browser push notifications for critical alerts
 * By Cheva
 */

import type { Notification, PushSubscription} from '../../types/notifications';

export class PushNotificationService {
  private vapidPublicKey: string;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: globalThis.PushSubscription | null = null;

  constructor(vapidPublicKey?: string) {
    this.vapidPublicKey = vapidPublicKey || import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if browser supports push notifications
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.swRegistration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request permission for push notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Browser does not support notifications');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    try {
      if (!this.swRegistration) {
        await this.initialize();
      }

      if (!this.swRegistration) {
        throw new Error('Service Worker not registered');
      }

      // Check if already subscribed
      this.subscription = await this.swRegistration.pushManager.getSubscription();

      if (this.subscription) {
        return this.formatSubscription(this.subscription);
      }

      // Create new subscription
      this.subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      const formattedSubscription = this.formatSubscription(this.subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(formattedSubscription);

      return formattedSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        const success = await this.subscription.unsubscribe();
        if (success) {
          this.subscription = null;
          // Notify server about unsubscription
          await this.removeSubscriptionFromServer();
        }
        return success;
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.swRegistration) {
        return false;
      }

      this.subscription = await this.swRegistration.pushManager.getSubscription();
      return !!this.subscription;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Show local notification (fallback)
   */
  async showLocalNotification(notification: Notification): Promise<void> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      const options: NotificationOptions = {
        body: notification.message,
        icon: notification.icon || '/icons/notification-icon.png',
        image: notification.image,
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        timestamp: notification.timestamp.getTime(),
        requireInteraction: notification.priority === 'critical',
        silent: false,
        data: {
          notificationId: notification.id,
          type: notification.type,
          priority: notification.priority,
          metadata: notification.metadata,
          actions: notification.actions
        }
      };

      // Add actions if supported
      if ('actions' in Notification.prototype && notification.actions.length > 0) {
        options.actions = notification.actions.slice(0, 2).map(action => ({
          action: action.id,
          title: action.label,
          icon: action.icon
        }));
      }

      const notif = new Notification(notification.title, options);

      // Handle click events
      notif.onclick = () => {
        window.focus();
        this.handleNotificationClick(notification);
        notif.close();
      };

      // Auto close after certain time
      setTimeout(() => {
        notif.close();
      }, this.getNotificationTimeout(notification.priority));

    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<void> {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      title: 'Notificación de Prueba',
      message: 'Esta es una notificación de prueba del sistema CMO',
      type: 'system',
      priority: 'normal',
      status: 'unread',
      timestamp: new Date(),
      actions: [
        {
          id: 'acknowledge',
          label: 'Confirmar',
          type: 'acknowledge'
        }
      ],
      metadata: {
        source: 'test',
        sourceId: 'test-notification'
      }
    };

    await this.showLocalNotification(testNotification);
  }

  /**
   * Handle notification clicks
   */
  private handleNotificationClick(notification: Notification): void {
    // Navigate to relevant page or perform action
    const url = this.getNotificationUrl(notification);
    if (url) {
      window.location.href = url;
    }

    // Trigger notification read event
    this.markNotificationAsRead(notification.id);
  }

  /**
   * Get notification URL based on type
   */
  private getNotificationUrl(notification: Notification): string | null {
    

    switch (type) {
      case 'alert':
        return `/alertas?id=${metadata.sourceId}`;
      case 'transit':
        return `/transitos?id=${metadata.sourceId}`;
      case 'precinto':
        return `/precintos?id=${metadata.sourceId}`;
      case 'system':
        return '/';
      default:
        return null;
    }
  }

  /**
   * Get notification timeout based on priority
   */
  private getNotificationTimeout(priority: string): number {
    switch (priority) {
      case 'critical':
        return 30000; // 30 seconds
      case 'high':
        return 15000; // 15 seconds
      case 'normal':
        return 10000; // 10 seconds
      case 'low':
        return 5000;  // 5 seconds
      default:
        return 10000;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Format subscription for server
   */
  private formatSubscription(subscription: globalThis.PushSubscription): PushSubscription {
    const keys = subscription.getKey ? {
      p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
      auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
    } : { p256dh: '', auth: '' };

    return {
      userId: '', // Will be set by the calling code
      endpoint: subscription.endpoint,
      keys,
      userAgent: navigator.userAgent,
      createdAt: new Date(),
      lastUsed: new Date(),
      active: true
    };
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  /**
   * Mark notification as read
   */
  private async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Get current subscription
   */
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.swRegistration) {
        await this.initialize();
      }

      if (!this.swRegistration) {
        return null;
      }

      const subscription = await this.swRegistration.pushManager.getSubscription();
      return subscription ? this.formatSubscription(subscription) : null;
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      return null;
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();