/**
 * Notification System Types
 * Comprehensive types for push notifications, preferences, and actions
 * By Cheva
 */

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';
export type NotificationType = 'alert' | 'transit' | 'precinto' | 'system' | 'user' | 'maintenance';
export type NotificationStatus = 'unread' | 'read' | 'acknowledged' | 'snoozed' | 'escalated' | 'dismissed';
export type NotificationChannel = 'in-app' | 'push' | 'email' | 'sms';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'acknowledge' | 'snooze' | 'escalate' | 'dismiss' | 'view' | 'custom';
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  requiresConfirmation?: boolean;
  payload?: Record<string, any>;
}

export interface NotificationSound {
  id: string;
  name: string;
  url: string;
  duration: number;
  volume?: number;
}

export interface NotificationMetadata {
  source: string;
  sourceId: string;
  entityType?: 'precinto' | 'transit' | 'alert' | 'user';
  entityId?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  additionalData?: Record<string, any>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  timestamp: Date;
  expiresAt?: Date;
  
  // Grouping
  groupId?: string;
  groupLabel?: string;
  
  // Actions
  actions: NotificationAction[];
  
  // Media
  icon?: string;
  image?: string;
  sound?: NotificationSound;
  
  // Metadata
  metadata: NotificationMetadata;
  
  // Tracking
  readAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  snoozedUntil?: Date;
  escalatedAt?: Date;
  escalatedTo?: string;
  dismissedAt?: Date;
}

export interface NotificationGroup {
  id: string;
  label: string;
  type: NotificationType;
  priority: NotificationPriority;
  count: number;
  latestTimestamp: Date;
  notifications: Notification[];
  collapsed: boolean;
}

export interface NotificationPreferences {
  userId: string;
  
  // Global settings
  enabled: boolean;
  doNotDisturb: boolean;
  doNotDisturbSchedule?: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  
  // Channel preferences
  channels: {
    [key in NotificationChannel]: {
      enabled: boolean;
      types: {
        [key in NotificationType]: {
          enabled: boolean;
          priority: NotificationPriority[];
          sound?: NotificationSound;
          customSettings?: Record<string, any>;
        };
      };
    };
  };
  
  // Grouping preferences
  grouping: {
    enabled: boolean;
    maxGroupSize: number;
    groupByType: boolean;
    groupBySource: boolean;
    autoCollapseAfter: number; // minutes
  };
  
  // Sound preferences
  sounds: {
    enabled: boolean;
    volume: number; // 0-1
    customSounds: NotificationSound[];
  };
  
  // Auto-actions
  autoActions: {
    autoAcknowledgeAfter?: number; // minutes
    autoEscalateAfter?: number; // minutes
    autoEscalateTo?: string; // user ID
  };
}

export interface NotificationFilter {
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  statuses?: NotificationStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  sourceIds?: string[];
  groupIds?: string[];
  unreadOnly?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  acknowledged: number;
  critical: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  byStatus: Record<NotificationStatus, number>;
  averageResponseTime: number; // in minutes
  escalationRate: number; // percentage
}

export interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  createdAt: Date;
  lastUsed: Date;
  active: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actions: NotificationAction[];
  sound?: NotificationSound;
  icon?: string;
  customFields?: Record<string, any>;
}

// Event types for notification system
export interface NotificationEvent {
  type: 'created' | 'updated' | 'deleted' | 'acknowledged' | 'snoozed' | 'escalated' | 'dismissed';
  notification: Notification;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Configuration for different notification types
export const NOTIFICATION_CONFIG: Record<NotificationType, {
  defaultPriority: NotificationPriority;
  defaultSound: string;
  icon: string;
  color: string;
  maxAge: number; // hours
  autoEscalate: boolean;
}> = {
  alert: {
    defaultPriority: 'critical',
    defaultSound: 'critical-alert',
    icon: '🚨',
    color: '#EF4444',
    maxAge: 24,
    autoEscalate: true
  },
  transit: {
    defaultPriority: 'normal',
    defaultSound: 'notification',
    icon: '🚛',
    color: '#3B82F6',
    maxAge: 48,
    autoEscalate: false
  },
  precinto: {
    defaultPriority: 'high',
    defaultSound: 'warning',
    icon: '🔒',
    color: '#F59E0B',
    maxAge: 24,
    autoEscalate: true
  },
  system: {
    defaultPriority: 'normal',
    defaultSound: 'notification',
    icon: '⚙️',
    color: '#6B7280',
    maxAge: 72,
    autoEscalate: false
  },
  user: {
    defaultPriority: 'low',
    defaultSound: 'message',
    icon: '👤',
    color: '#10B981',
    maxAge: 168,
    autoEscalate: false
  },
  maintenance: {
    defaultPriority: 'normal',
    defaultSound: 'notification',
    icon: '🔧',
    color: '#8B5CF6',
    maxAge: 48,
    autoEscalate: false
  }
};

// Default notification sounds
export const DEFAULT_SOUNDS: NotificationSound[] = [
  {
    id: 'critical-alert',
    name: 'Alerta Crítica',
    url: '/sounds/critical-alert.mp3',
    duration: 3000,
    volume: 1.0
  },
  {
    id: 'warning',
    name: 'Advertencia',
    url: '/sounds/warning.mp3',
    duration: 2000,
    volume: 0.8
  },
  {
    id: 'notification',
    name: 'Notificación',
    url: '/sounds/notification.mp3',
    duration: 1500,
    volume: 0.6
  },
  {
    id: 'message',
    name: 'Mensaje',
    url: '/sounds/message.mp3',
    duration: 1000,
    volume: 0.5
  },
  {
    id: 'success',
    name: 'Éxito',
    url: '/sounds/success.mp3',
    duration: 1200,
    volume: 0.7
  }
];