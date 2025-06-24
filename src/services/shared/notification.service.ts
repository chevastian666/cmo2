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

  newAlert(alert: unknown): void {
    const alertObj = alert as { mensaje?: string; message?: string } | null
    const message = alertObj?.mensaje || alertObj?.message || 'Nueva alerta recibida'
    toast(message, {
      icon: '🚨',
      duration: 5000
    })
  }

  transitDelayed(transit: unknown): void {
    const transitObj = transit as { codigo?: string } | null
    const message = `Tránsito ${transitObj?.codigo || ''} retrasado`
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