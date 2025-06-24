/**
 * Notification Service
 * By Cheva
 */

import { toast } from 'react-hot-toast'

class NotificationService {
  info(title: string): void {
    toast(title, { icon: 'ℹ️' })
  }

  success(message: string): void {
    toast.success(message)
  }

  error(message: string): void {
    toast.error(message)
  }

  warning(message: string): void {
    toast(message, { icon: '⚠️' })
  }

  newAlert(alert: any): void {
    const message = alert?.mensaje || alert?.message || 'Nueva alerta recibida'
    toast(message, {
      icon: '🚨',
      duration: 5000
    })
  }

  transitDelayed(transit: any): void {
    const message = `Tránsito ${transit?.codigo || ''} retrasado`
    toast(message, {
      icon: '⏰',
      duration: 4000
    })
  }

  cmoMessage(message: string): void {
    toast(message, {
      icon: '📢',
      duration: 4000
    })
  }
}

export const notificationService = new NotificationService()