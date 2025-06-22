/**
 * Push Notification Service (Minimal Version)
 * By Cheva  
 */

export class PushNotificationService {
  constructor() {}
  
  async subscribe() {
    return Promise.resolve()
  }
  
  async unsubscribe() {
    return Promise.resolve()
  }
}

export const pushNotificationService = new PushNotificationService()
