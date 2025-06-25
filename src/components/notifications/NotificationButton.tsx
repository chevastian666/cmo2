/**
 * Notification Button Component
 * Bell icon with notification count and click handler
 * By Cheva
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence} from 'framer-motion'
import { Bell, BellOff} from 'lucide-react'
import NotificationCenter from './NotificationCenter'
import { notificationService} from '../../services/notifications/notificationService'
import type { 
  Notification, NotificationFilter, NotificationGroup, NotificationStats} from '../../types/notifications'
interface NotificationButtonProps {
  className?: string
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [_groups, setGroups] = useState<NotificationGroup[]>([])
  const [stats, setStats] = useState<NotificationStats | undefined>()
  const [filter] = useState<NotificationFilter>({})
  const loadStats = React.useCallback(async () => {
    const currentStats = await notificationService.getStats()
    setStats(currentStats)
  }, [])
  const loadNotifications = React.useCallback(async () => {
    const filtered = await notificationService.getNotifications(filter)
    const grouped = await notificationService.getGroupedNotifications()
    setNotifications(filtered)
    setGroups(grouped)
  }, [filter])
  // Load notifications on mount

    useEffect(() => {
    loadNotifications()
    loadStats()
    // Listen for notification events
    const unsubscribeCreated = notificationService.on('created', () => {
      loadNotifications()
      loadStats()
    })
    const unsubscribeUpdated = notificationService.on('updated', () => {
      loadNotifications()
      loadStats()
    })
    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
    }
  }, [loadNotifications, loadStats])
  // Reload when filter changes

    useEffect(() => {
    loadNotifications()
  }, [filter, loadNotifications])
  // Removed unused handlers - they were causing TS6133 errors
  const unreadCount = stats?.unread || 0
  const hasNotifications = notifications.length > 0
  return (<>
      {/* Notification Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          hasNotifications 
            ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
        } ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {hasNotifications ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
        
        {/* Notification Count Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.2rem] h-5 flex items-center justify-center px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse animation for critical notifications */}
        {stats && stats.critical && stats.critical > 0 && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-red-500 opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Notification Center */}
      <AnimatePresence>
        {isOpen && (<NotificationCenter className="notification-center" />
        )}
      </AnimatePresence>
    </>
  )
}