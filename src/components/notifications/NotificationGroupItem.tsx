/**
 * Notification Group Item Component
 * Displays grouped notifications with expand/collapse functionality
 * By Cheva
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import type { NotificationGroup } from '../../types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationGroupItemProps {
  group: NotificationGroup;
  selectedNotifications: Set<string>;
  onSelect: (notificationId: string, selected: boolean) => void;
  onAction: (notificationId: string, action: string, payload?: any) => void;
  expanded?: boolean;
}

export const NotificationGroupItem: React.FC<NotificationGroupItemProps> = ({
  group,
  selectedNotifications,
  onSelect,
  onAction,
  expanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!group.collapsed);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const selectAll = () => {
    const allSelected = group.notifications.every(n => selectedNotifications.has(n.id));
    group.notifications.forEach(n => {
      onSelect(n.id, !allSelected);
    });
  };

  const latestNotification = group.notifications[0];
  const priorityColor = {
    low: 'text-gray-400',
    normal: 'text-blue-400',
    high: 'text-yellow-400',
    critical: 'text-red-400'
  }[group.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-b border-gray-700"
    >
      {/* Group Header */}
      <div className="p-4 hover:bg-gray-800 transition-colors">
        <div className="flex items-center space-x-3">
          {/* Expand/Collapse Button */}
          <button
            onClick={toggleExpanded}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Group Icon */}
          <div className={`w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ${priorityColor}`}>
            <Users className="w-4 h-4" />
          </div>

          {/* Group Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-white">{group.label}</h3>
              <span className={`text-xs px-2 py-1 rounded-full bg-gray-700 ${priorityColor}`}>
                {group.count} notificaciones
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                group.priority === 'critical' ? 'bg-red-900 text-red-300' :
                group.priority === 'high' ? 'bg-yellow-900 text-yellow-300' :
                group.priority === 'normal' ? 'bg-blue-900 text-blue-300' :
                'bg-gray-800 text-gray-400'
              }`}>
                {group.priority}
              </span>
            </div>
            
            <p className="text-sm text-gray-400">
              {isExpanded 
                ? `${group.count} notificaciones en este grupo`
                : latestNotification.message
              }
            </p>
            
            <div className="text-xs text-gray-500 mt-1">
              Última actualización: {group.latestTimestamp.toLocaleString()}
            </div>
          </div>

          {/* Group Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
            >
              {group.notifications.every(n => selectedNotifications.has(n.id)) 
                ? 'Deseleccionar' 
                : 'Seleccionar todo'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Group Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-l-2 border-gray-600 ml-4 overflow-hidden"
          >
            {group.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isSelected={selectedNotifications.has(notification.id)}
                onSelect={(selected) => onSelect(notification.id, selected)}
                onAction={(action, payload) => onAction(notification.id, action, payload)}
                expanded={expanded}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};