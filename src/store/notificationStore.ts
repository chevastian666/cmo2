import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  source?: string
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// This is a simplified version for the store
export interface SimpleNotificationGroup {
  type: string
  count: number
  notifications: Notification[]
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  groups: SimpleNotificationGroup[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  acknowledgeNotification: (id: string) => void
  snoozeNotification: (id: string, duration: number) => void
  dismissNotification: (id: string) => void
  getNotificationsByFilter: (filter: { type?: string; read?: boolean }) => Notification[]
  getGroupedNotifications: () => SimpleNotificationGroup[]
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      groups: [],
      
      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            read: false,
          }
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }
        }),
      
      markAsRead: (id) =>
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        }),
      
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      
      removeNotification: (id) =>
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id)
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        }),
      
      clearAll: () =>
        set(() => ({
          notifications: [],
          unreadCount: 0,
          groups: [],
        })),
      
      acknowledgeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
        })),
      
      snoozeNotification: (id, _duration) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
        })),
      
      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
        })),
      
      getNotificationsByFilter: (filter) => {
        const state = get()
        if (!filter || Object.keys(filter).length === 0) {
          return state.notifications
        }
        return state.notifications.filter((n) => {
          if (filter.type && n.type !== filter.type) return false
          if (filter.read !== undefined && n.read !== filter.read) return false
          return true
        })
      },
      
      getGroupedNotifications: () => {
        const state = get()
        const grouped = state.notifications.reduce((acc, notification) => {
          const type = notification.type
          if (!acc[type]) {
            acc[type] = {
              id: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              type,
              priority: 'normal',
              count: 0,
              latestTimestamp: new Date(),
              notifications: [],
              collapsed: false
            }
          }
          acc[type].count++
          acc[type].notifications.push(notification)
          if (notification.timestamp > acc[type].latestTimestamp) {
            acc[type].latestTimestamp = notification.timestamp
          }
          return acc
        }, {} as Record<string, SimpleNotificationGroup & { id: string; label: string; priority: string; latestTimestamp: Date; collapsed: boolean }>)
        return Object.values(grouped)
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep only last 50 notifications
      }),
    }
  )
)