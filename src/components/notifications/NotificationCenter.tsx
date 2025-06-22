import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';
import { NotificationGroupItem } from './NotificationGroupItem';
import { QuickActions } from './QuickActions';
import type { NotificationFilter, NotificationType, NotificationPriority } from '@/types/notifications';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>({});
  const [groupByType, setGroupByType] = useState(true);
  
  const {
    notifications,
    groups,
    unreadCount,
    markAsRead,
    markAllAsRead,
    acknowledgeNotification,
    snoozeNotification,
    dismissNotification,
    getNotificationsByFilter,
    getGroupedNotifications
  } = useNotificationStore();

  const filteredNotifications = groupByType 
    ? getGroupedNotifications(filter)
    : getNotificationsByFilter(filter);

  // Auto-close after marking all as read
  useEffect(() => {
    if (isOpen && unreadCount === 0) {
      const timer = setTimeout(() => setIsOpen(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, isOpen]);

  const handleFilterChange = (newFilter: NotificationFilter) => {
    setFilter(newFilter);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'markAllRead':
        markAllAsRead();
        break;
      case 'clearAll':
        notifications.forEach(n => dismissNotification(n.id));
        break;
      case 'toggleGroup':
        setGroupByType(!groupByType);
        break;
    }
  };

  return (
    <>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-96 bg-gray-800 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Notificaciones</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <QuickActions 
                  onAction={handleQuickAction}
                  groupByType={groupByType}
                  hasNotifications={notifications.length > 0}
                />
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-gray-700">
                <NotificationFilters 
                  filter={filter}
                  onChange={handleFilterChange}
                />
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Bell className="h-12 w-12 mb-4 opacity-50" />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {groupByType ? (
                      // Grouped view
                      groups.map(group => (
                        <NotificationGroupItem
                          key={group.id}
                          group={group}
                          onAcknowledge={acknowledgeNotification}
                          onSnooze={snoozeNotification}
                          onDismiss={dismissNotification}
                          onMarkAsRead={markAsRead}
                        />
                      ))
                    ) : (
                      // Individual view
                      filteredNotifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onAcknowledge={acknowledgeNotification}
                          onSnooze={snoozeNotification}
                          onDismiss={dismissNotification}
                          onMarkAsRead={markAsRead}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;