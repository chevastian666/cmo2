import React, { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/utils';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  autoDismiss?: boolean;
}

interface RealtimeNotificationsProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
}

export const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  position = 'top-right',
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen for custom notification events
  useEffect(() => {
    const handleNotification = (event: CustomEvent<Notification>) => {
      addNotification(event.detail);
    };

    window.addEventListener('realtime-notification' as any, handleNotification);
    return () => {
      window.removeEventListener('realtime-notification' as any, handleNotification);
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev].slice(0, maxNotifications);
      
      // Auto-dismiss after 5 seconds if enabled
      if (notification.autoDismiss !== false) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, 5000);
      }
      
      return newNotifications;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <Shield className="h-5 w-5 text-red-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
  };

  const getStyles = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-900/90 border-blue-700';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-700';
      case 'error':
        return 'bg-red-900/90 border-red-700';
      case 'success':
        return 'bg-green-900/90 border-green-700';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={cn('fixed z-50 space-y-2', getPositionClasses())}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg',
            'transform transition-all duration-300 animate-slide-in',
            'min-w-[300px] max-w-[400px]',
            getStyles(notification.type)
          )}
        >
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-medium text-white">{notification.title}</h4>
            <p className="text-base text-gray-300 mt-1">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to emit notifications
export const emitNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
  const event = new CustomEvent('realtime-notification', {
    detail: {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: Date.now()
    }
  });
  window.dispatchEvent(event);
};