/**
 * Comprehensive Notification Service
 * Central service for managing all notification functionality
 * By Cheva
 */

import type { 
  Notification, NotificationPreferences, NotificationFilter, NotificationGroup, NotificationStats, NotificationType, NotificationPriority, NotificationStatus, NotificationEvent, NotificationTemplate} from '../../types/notifications';
import { NOTIFICATION_CONFIG, DEFAULT_SOUNDS} from '../../types/notifications';
import { pushNotificationService} from './pushNotificationService';
import { soundService} from './soundService';
import { groupingService} from './groupingService';

type NotificationEventHandler = (event: NotificationEvent) => void;

export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private preferences: NotificationPreferences | null = null;
  private eventHandlers: Map<string, NotificationEventHandler[]> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private autoActionTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    this.initialize();
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize push notifications
      await pushNotificationService.initialize();
      
      // Load user preferences
      await this.loadPreferences();
      
      // Initialize sound service
      soundService.initialize();
      
      // Set up service worker message listener
      this.setupServiceWorkerListener();
      
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Create and send a notification
   */
  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ): Promise<Notification> {
    const config = NOTIFICATION_CONFIG[type];
    
    const notification: Notification = {
      id: options.id || this.generateId(),
      title,
      message,
      type,
      priority: options.priority || config.defaultPriority,
      status: 'unread',
      timestamp: new Date(),
      actions: options.actions || this.getDefaultActions(type),
      metadata: {
        source: 'cmo-system',
        sourceId: options.metadata?.sourceId || 'unknown',
        ...options.metadata
      },
      sound: options.sound || DEFAULT_SOUNDS.find(s => s.id === config.defaultSound),
      icon: options.icon || config.icon,
      ...options
    };

    // Store notification
    this.notifications.set(notification.id, notification);

    // Check user preferences and send through appropriate channels
    await this.processNotification(notification);

    // Set up auto-actions
    this.setupAutoActions(notification);

    // Emit event
    this.emitEvent('created', notification);

    return notification;
  }

  /**
   * Process notification through channels based on preferences
   */
  private async processNotification(notification: Notification): Promise<void> {
    if (!this.preferences?.enabled) {
      return;
    }

    // Check do not disturb
    if (this.isDoNotDisturbActive()) {
      // Only send critical notifications during DND
      if (notification.priority !== 'critical') {
        return;
      }
    }

    

    // In-app notifications
    if (this.shouldSendToChannel('in-app', type, priority)) {
      await this.sendInAppNotification(notification);
    }

    // Push notifications
    if (this.shouldSendToChannel('push', type, priority)) {
      await this.sendPushNotification(notification);
    }

    // Email notifications
    if (this.shouldSendToChannel('email', type, priority)) {
      await this.sendEmailNotification(notification);
    }

    // Play sound
    if (this.preferences.sounds.enabled && this.shouldPlaySound(type, priority)) {
      await this.playNotificationSound(notification);
    }
  }

  /**
   * Check if notification should be sent to specific channel
   */
  private shouldSendToChannel(
    channel: 'in-app' | 'push' | 'email', 
    type: NotificationType, 
    priority: NotificationPriority
  ): boolean {
    if (!this.preferences) return false;

    const channelPrefs = this.preferences.channels[channel];
    if (!channelPrefs.enabled) return false;

    const typePrefs = channelPrefs.types[type];
    if (!typePrefs.enabled) return false;

    return typePrefs.priority.includes(priority);
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(notification: Notification): Promise<void> {
    // Emit to UI components
    this.emitEvent('created', notification);
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      await pushNotificationService.showLocalNotification(notification);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          notification,
          userId: this.preferences?.userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Play notification sound
   */
  private async playNotificationSound(notification: Notification): Promise<void> {
    if (!notification.sound || !this.preferences?.sounds.enabled) {
      return;
    }

    try {
      await soundService.playSound(
        notification.sound.url,
        this.preferences.sounds.volume
      );
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  /**
   * Check if should play sound
   */
  private shouldPlaySound(type: NotificationType, priority: NotificationPriority): boolean {
    if (!this.preferences?.sounds.enabled) return false;
    
    // Always play critical sounds
    if (priority === 'critical') return true;
    
    // Check channel preferences for in-app sounds
    return this.shouldSendToChannel('in-app', type, priority);
  }

  /**
   * Handle notification actions
   */
  async handleNotificationAction(
    notificationId: string, 
    action: string, 
    payload?: unknown
  ): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    const updatedNotification = { ...notification };

    switch (action) {
      case 'acknowledge':
        updatedNotification.status = 'acknowledged';
        updatedNotification.acknowledgedAt = new Date();
        updatedNotification.acknowledgedBy = this.getCurrentUserId();
        break;

      case 'snooze':
        updatedNotification.status = 'snoozed';
        updatedNotification.snoozedUntil = payload?.snoozedUntil || new Date(Date.now() + 300000); // 5 min default
        this.scheduleSnoozeReactivation(updatedNotification);
        break;

      case 'escalate':
        updatedNotification.status = 'escalated';
        updatedNotification.escalatedAt = new Date();
        updatedNotification.escalatedTo = payload?.escalatedTo || 'supervisor';
        await this.escalateNotification(updatedNotification);
        break;

      case 'dismiss':
      case 'delete':
        updatedNotification.status = 'dismissed';
        updatedNotification.dismissedAt = new Date();
        break;

      case 'mark-read':
        if (updatedNotification.status === 'unread') {
          updatedNotification.status = 'read';
          updatedNotification.readAt = new Date();
        }
        break;

      case 'archive':
        // Move to archived state (implement as needed)
        break;

      default:
        // Handle custom actions
        await this.handleCustomAction(updatedNotification, action, payload);
    }

    // Update stored notification
    this.notifications.set(notificationId, updatedNotification);

    // Clear auto-action timer
    this.clearAutoActionTimer(notificationId);

    // Emit event
    this.emitEvent('updated', updatedNotification);

    // Send to server
    await this.syncNotificationToServer(updatedNotification);
  }

  /**
   * Handle bulk actions
   */
  async handleBulkAction(notificationIds: string[], action: string): Promise<void> {
    const promises = notificationIds.map(id => 
      this.handleNotificationAction(id, action)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get notifications with filtering
   */
  getNotifications(filter?: NotificationFilter): Notification[] {
    let notifications = Array.from(this.notifications.values());

    if (!filter) {
      return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Apply filters
    if (filter.types?.length) {
      notifications = notifications.filter(n => filter.types!.includes(n.type));
    }

    if (filter.priorities?.length) {
      notifications = notifications.filter(n => filter.priorities!.includes(n.priority));
    }

    if (filter.statuses?.length) {
      notifications = notifications.filter(n => filter.statuses!.includes(n.status));
    }

    if (filter.unreadOnly) {
      notifications = notifications.filter(n => n.status === 'unread');
    }

    if (filter.dateFrom) {
      notifications = notifications.filter(n => n.timestamp >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      notifications = notifications.filter(n => n.timestamp <= filter.dateTo!);
    }

    if (filter.search) {
      const query = filter.search.toLowerCase();
      notifications = notifications.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.metadata.source.toLowerCase().includes(query)
      );
    }

    return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get grouped notifications
   */
  getGroupedNotifications(filter?: NotificationFilter): NotificationGroup[] {
    const notifications = this.getNotifications(filter);
    return groupingService.groupNotifications(notifications, this.preferences?.grouping);
  }

  /**
   * Get notification statistics
   */
  getStats(filter?: NotificationFilter): NotificationStats {
    const notifications = this.getNotifications(filter);

    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      acknowledged: notifications.filter(n => n.status === 'acknowledged').length,
      critical: notifications.filter(n => n.priority === 'critical').length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      byStatus: {} as Record<NotificationStatus, number>,
      averageResponseTime: 0,
      escalationRate: 0
    };

    // Calculate stats by type, priority, status
    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
      stats.byStatus[n.status] = (stats.byStatus[n.status] || 0) + 1;
    });

    // Calculate average response time
    const respondedNotifications = notifications.filter(n => n.acknowledgedAt);
    if (respondedNotifications.length > 0) {
      const totalResponseTime = respondedNotifications.reduce((sum, n) => {
        return sum + (n.acknowledgedAt!.getTime() - n.timestamp.getTime());
      }, 0);
      stats.averageResponseTime = totalResponseTime / respondedNotifications.length / 60000; // minutes
    }

    // Calculate escalation rate
    const escalatedCount = notifications.filter(n => n.status === 'escalated').length;
    stats.escalationRate = notifications.length > 0 ? (escalatedCount / notifications.length) * 100 : 0;

    return stats;
  }

  /**
   * User preferences management
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    this.preferences = preferences;
    
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });

      // Update push subscription if needed
      if (preferences.channels.push.enabled) {
        await pushNotificationService.subscribe();
      } else {
        await pushNotificationService.unsubscribe();
      }

    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }

  async loadPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        this.preferences = await response.json();
        return this.preferences;
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }

    // Return default preferences
    this.preferences = this.getDefaultPreferences();
    return this.preferences;
  }

  /**
   * Test notification sending
   */
  async testNotification(
    channel: 'in-app' | 'push' | 'email', 
    type: NotificationType
  ): Promise<void> {
    const testNotification = await this.createNotification(
      type,
      'Notificación de Prueba',
      `Esta es una notificación de prueba para el canal ${channel}`,
      {
        priority: 'normal',
        metadata: {
          source: 'test',
          sourceId: `test-${Date.now()}`
        }
      }
    );

    // Force send to specific channel
    switch (channel) {
      case 'in-app':
        await this.sendInAppNotification(testNotification);
        break;
      case 'push':
        await this.sendPushNotification(testNotification);
        break;
      case 'email':
        await this.sendEmailNotification(testNotification);
        break;
    }
  }

  /**
   * Event handling
   */
  on(event: string, handler: NotificationEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  private emitEvent(type: NotificationEvent['type'], notification: Notification): void {
    const event: NotificationEvent = {
      type,
      notification,
      userId: this.getCurrentUserId(),
      timestamp: new Date()
    };

    const handlers = this.eventHandlers.get(type) || [];
    const allHandlers = this.eventHandlers.get('*') || [];
    
    [...handlers, ...allHandlers].forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in notification event handler:', error);
      }
    });
  }

  /**
   * Helper methods
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    // Get from auth context or localStorage
    return localStorage.getItem('userId') || 'unknown';
  }

  private getDefaultActions(type: NotificationType) {
    const actions = [
      {
        id: 'acknowledge',
        label: 'Confirmar',
        type: 'acknowledge' as const,
        color: 'success' as const
      }
    ];

    if (type === 'alert' || type === 'precinto') {
      actions.push({
        id: 'escalate',
        label: 'Escalar',
        type: 'escalate' as const,
        color: 'warning' as const
      });
    }

    actions.push({
      id: 'dismiss',
      label: 'Descartar',
      type: 'dismiss' as const,
      color: 'secondary' as const
    });

    return actions;
  }

  private isDoNotDisturbActive(): boolean {
    if (!this.preferences?.doNotDisturb) return false;
    if (!this.preferences.doNotDisturbSchedule?.enabled) return this.preferences.doNotDisturb;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();

    const schedule = this.preferences.doNotDisturbSchedule;
    if (!schedule.days.includes(currentDay)) return false;

    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private setupAutoActions(notification: Notification): void {
    if (!this.preferences?.autoActions) return;

    

    if (autoAcknowledgeAfter && notification.priority !== 'critical') {
      const timer = setTimeout(() => {
        this.handleNotificationAction(notification.id, 'acknowledge');
      }, autoAcknowledgeAfter * 60 * 1000);
      
      this.autoActionTimers.set(`ack_${notification.id}`, timer);
    }

    if (autoEscalateAfter && notification.priority === 'critical') {
      const timer = setTimeout(() => {
        this.handleNotificationAction(notification.id, 'escalate');
      }, autoEscalateAfter * 60 * 1000);
      
      this.autoActionTimers.set(`esc_${notification.id}`, timer);
    }
  }

  private clearAutoActionTimer(notificationId: string): void {
    const ackTimer = this.autoActionTimers.get(`ack_${notificationId}`);
    const escTimer = this.autoActionTimers.get(`esc_${notificationId}`);
    
    if (ackTimer) {
      clearTimeout(ackTimer);
      this.autoActionTimers.delete(`ack_${notificationId}`);
    }
    
    if (escTimer) {
      clearTimeout(escTimer);
      this.autoActionTimers.delete(`esc_${notificationId}`);
    }
  }

  private async escalateNotification(notification: Notification): Promise<void> {
    // Create escalated notification
    await this.createNotification(
      'system',
      `Escalación: ${notification.title}`,
      `La siguiente notificación ha sido escalada: ${notification.message}`,
      {
        priority: 'critical',
        metadata: {
          source: 'escalation',
          sourceId: notification.id,
          originalNotification: notification
        }
      }
    );
  }

  private scheduleSnoozeReactivation(notification: Notification): void {
    if (!notification.snoozedUntil) return;

    const delay = notification.snoozedUntil.getTime() - Date.now();
    if (delay <= 0) return;

    setTimeout(() => {
      const current = this.notifications.get(notification.id);
      if (current && current.status === 'snoozed') {
        const reactivated = { ...current, status: 'unread' as NotificationStatus };
        this.notifications.set(notification.id, reactivated);
        this.emitEvent('updated', reactivated);
        this.processNotification(reactivated);
      }
    }, delay);
  }

  private async handleCustomAction(
    notification: Notification, 
    action: string, 
    payload?: unknown
  ): Promise<void> {
    // Handle custom actions defined in notification.actions
    const actionDef = notification.actions.find(a => a.id === action);
    if (!actionDef) return;

    if (actionDef.requiresConfirmation) {
      // Would show confirmation dialog in UI
    }

    // Execute action payload or API call
    if (actionDef.payload) {
      // Handle custom payload
    }
  }

  private setupServiceWorkerListener(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        
        
        if (type === 'GET_TOKEN') {
          event.ports[0].postMessage({ 
            token: localStorage.getItem('token') 
          });
        }
      });
    }
  }

  private async syncNotificationToServer(notification: Notification): Promise<void> {
    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Failed to sync notification to server:', error);
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      userId: this.getCurrentUserId(),
      enabled: true,
      doNotDisturb: false,
      channels: {
        'in-app': {
          enabled: true,
          types: {
            alert: { enabled: true, priority: ['critical', 'high'] },
            transit: { enabled: true, priority: ['high', 'normal'] },
            precinto: { enabled: true, priority: ['critical', 'high'] },
            system: { enabled: true, priority: ['normal'] },
            user: { enabled: true, priority: ['normal', 'low'] },
            maintenance: { enabled: true, priority: ['normal'] }
          }
        },
        push: {
          enabled: false,
          types: {
            alert: { enabled: true, priority: ['critical'] },
            transit: { enabled: false, priority: [] },
            precinto: { enabled: true, priority: ['critical'] },
            system: { enabled: false, priority: [] },
            user: { enabled: false, priority: [] },
            maintenance: { enabled: false, priority: [] }
          }
        },
        email: {
          enabled: false,
          types: {
            alert: { enabled: false, priority: [] },
            transit: { enabled: false, priority: [] },
            precinto: { enabled: false, priority: [] },
            system: { enabled: false, priority: [] },
            user: { enabled: false, priority: [] },
            maintenance: { enabled: false, priority: [] }
          }
        }
      },
      grouping: {
        enabled: true,
        maxGroupSize: 5,
        groupByType: true,
        groupBySource: false,
        autoCollapseAfter: 30
      },
      sounds: {
        enabled: true,
        volume: 0.7,
        customSounds: []
      }
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();