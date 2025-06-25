/**
 * Notification Service (Minimal Version)  
 * By Cheva
 */

import type { NotificationStats } from '@/types/notifications'

export class NotificationService {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map()
  private soundEnabled: boolean = true
  
  constructor() {}
  
  async sendNotification() {
    return Promise.resolve()
  }
  
  async getNotifications(_filter?: any) {
    return []
  }
  
  async getGroupedNotifications() {
    return []
  }
  
  async getStats(): Promise<NotificationStats> {
    return {
      total: 0,
      unread: 0,
      critical: 0,
      byType: {},
      byStatus: {}
    }
  }
  
  async handleNotificationAction(_notificationId: string, _action: string, _payload?: unknown) {
    return Promise.resolve()
  }
  
  async handleBulkAction(_notificationIds: string[], _action: string) {
    return Promise.resolve()
  }
  
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }
  
  getSoundEnabled() {
    return this.soundEnabled
  }
  
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }
  
  private emit(event: string, _data?: any) {
    this.listeners.get(event)?.forEach(callback => callback(_data))
  }
}

export const notificationService = new NotificationService()
