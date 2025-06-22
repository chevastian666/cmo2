/**
 * Notification Service (Minimal Version)  
 * By Cheva
 */

export class NotificationService {
  constructor() {}
  
  async sendNotification() {
    return Promise.resolve()
  }
  
  async getNotifications() {
    return []
  }
}

export const notificationService = new NotificationService()
