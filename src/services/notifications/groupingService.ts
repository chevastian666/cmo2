/**
 * Notification Grouping Service
 * Intelligent grouping of similar notifications
 * By Cheva
 */

import type { Notification, NotificationGroup} from '../../types/notifications';

interface GroupingOptions {
  enabled: boolean;
  maxGroupSize: number;
  groupByType: boolean;
  groupBySource: boolean;
  autoCollapseAfter: number; // minutes
}

export class GroupingService {
  
  /**
   * Group notifications based on similarity
   */
  groupNotifications(
    notifications: Notification[], 
    options?: GroupingOptions
  ): NotificationGroup[] {
    if (!options?.enabled || notifications.length === 0) {
      return [];
    }

    const groups = new Map<string, NotificationGroup>();
    const ungrouped: Notification[] = [];

    // Sort notifications by timestamp (newest first)
    const sortedNotifications = [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    for (const notification of sortedNotifications) {
      const groupKey = this.getGroupKey(notification, options);
      
      if (!groupKey) {
        ungrouped.push(notification);
        continue;
      }

      let group = groups.get(groupKey);
      
      if (!group) {
        // Create new group
        group = {
          id: this.generateGroupId(),
          label: this.generateGroupLabel(notification, options),
          type: notification.type,
          priority: notification.priority,
          count: 0,
          latestTimestamp: notification.timestamp,
          notifications: [],
          collapsed: this.shouldAutoCollapse(notification, options)
        };
        groups.set(groupKey, group);
      }

      // Add to existing group if not at max size
      if (group.notifications.length < options.maxGroupSize) {
        group.notifications.push(notification);
        group.count = group.notifications.length;
        
        // Update group properties
        if (notification.timestamp > group.latestTimestamp) {
          group.latestTimestamp = notification.timestamp;
        }
        
        // Update priority to highest in group
        if (this.getPriorityWeight(notification.priority) > this.getPriorityWeight(group.priority)) {
          group.priority = notification.priority;
        }
      } else {
        ungrouped.push(notification);
      }
    }

    // Convert map to array and add ungrouped as individual groups
    const result = Array.from(groups.values());
    
    // Add ungrouped notifications as single-item groups
    ungrouped.forEach(notification => {
      result.push({
        id: this.generateGroupId(),
        label: notification.title,
        type: notification.type,
        priority: notification.priority,
        count: 1,
        latestTimestamp: notification.timestamp,
        notifications: [notification],
        collapsed: false
      });
    });

    // Sort groups by latest timestamp
    return result.sort((a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime());
  }

  /**
   * Generate grouping key for a notification
   */
  private getGroupKey(notification: Notification, options: GroupingOptions): string | null {
    const keyParts: string[] = [];

    // Group by type
    if (options.groupByType) {
      keyParts.push(`type:${notification.type}`);
    }

    // Group by source
    if (options.groupBySource) {
      keyParts.push(`source:${notification.metadata.source}`);
    }

    // Group by entity type and ID for related notifications
    if (notification.metadata.entityType && notification.metadata.entityId) {
      keyParts.push(`entity:${notification.metadata.entityType}:${notification.metadata.entityId}`);
    }

    // Group similar alert patterns
    if (notification.type === 'alert') {
      const alertPattern = this.extractAlertPattern(notification);
      if (alertPattern) {
        keyParts.push(`pattern:${alertPattern}`);
      }
    }

    // Must have at least one grouping criteria
    return keyParts.length > 0 ? keyParts.join('|') : null;
  }

  /**
   * Extract alert pattern for grouping similar alerts
   */
  private extractAlertPattern(notification: Notification): string | null {
    
    
    // Common alert patterns
    const patterns = [
      // Battery warnings
      { regex: /batería\s*(baja|crítica|agotada)/i, pattern: 'battery_low' },
      // GPS issues
      { regex: /sin\s*(gps|señal|ubicación)/i, pattern: 'gps_lost' },
      // Movement alerts
      { regex: /(movimiento|desplazamiento)\s*(no\s*autorizado|detectado)/i, pattern: 'unauthorized_movement' },
      // Temperature alerts
      { regex: /temperatura\s*(alta|baja|crítica)/i, pattern: 'temperature_alert' },
      // Tampering alerts
      { regex: /(violación|apertura|manipulación)\s*(precinto|dispositivo)/i, pattern: 'tampering' },
      // Delay alerts
      { regex: /(retraso|demora|atraso)/i, pattern: 'delay' }
    ];

    for (const { regex, pattern } of patterns) {
      if (regex.test(title) || regex.test(message)) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * Generate group label
   */
  private generateGroupLabel(notification: Notification, options: GroupingOptions): string {
    if (options.groupByType && options.groupBySource) {
      return `${this.getTypeLabel(notification.type)} - ${notification.metadata.source}`;
    }
    
    if (options.groupByType) {
      return this.getTypeLabel(notification.type);
    }
    
    if (options.groupBySource) {
      return notification.metadata.source;
    }

    // Check for alert patterns
    if (notification.type === 'alert') {
      const pattern = this.extractAlertPattern(notification);
      if (pattern) {
        return this.getPatternLabel(pattern);
      }
    }

    // Entity-based grouping
    if (notification.metadata.entityType) {
      return `${notification.metadata.entityType} ${notification.metadata.entityId || ''}`.trim();
    }

    return notification.title;
  }

  /**
   * Get human-readable type label
   */
  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      alert: 'Alertas',
      transit: 'Tránsitos',
      precinto: 'Precintos',
      system: 'Sistema',
      user: 'Usuario',
      maintenance: 'Mantenimiento'
    };
    
    return labels[type] || type;
  }

  /**
   * Get human-readable pattern label
   */
  private getPatternLabel(pattern: string): string {
    const labels: Record<string, string> = {
      battery_low: 'Alertas de Batería',
      gps_lost: 'Pérdida de GPS',
      unauthorized_movement: 'Movimiento No Autorizado',
      temperature_alert: 'Alertas de Temperatura',
      tampering: 'Violación de Precintos',
      delay: 'Alertas de Retraso'
    };
    
    return labels[pattern] || pattern;
  }

  /**
   * Check if group should be auto-collapsed
   */
  private shouldAutoCollapse(notification: Notification, options: GroupingOptions): boolean {
    if (!options.autoCollapseAfter) return false;
    
    const ageMinutes = (Date.now() - notification.timestamp.getTime()) / (1000 * 60);
    return ageMinutes > options.autoCollapseAfter;
  }

  /**
   * Get priority weight for comparison
   */
  private getPriorityWeight(priority: string): number {
    const weights: Record<string, number> = {
      low: 1,
      normal: 2,
      high: 3,
      critical: 4
    };
    
    return weights[priority] || 0;
  }

  /**
   * Generate unique group ID
   */
  private generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Merge similar groups
   */
  mergeSimilarGroups(groups: NotificationGroup[]): NotificationGroup[] {
    const merged: NotificationGroup[] = [];
    const processed = new Set<string>();

    for (const group of groups) {
      if (processed.has(group.id)) continue;

      const similar = groups.filter(g => 
        g.id !== group.id && 
        !processed.has(g.id) &&
        this.areGroupsSimilar(group, g)
      );

      if (similar.length > 0) {
        // Merge similar groups
        const mergedGroup: NotificationGroup = {
          ...group,
          id: this.generateGroupId(),
          notifications: [
            ...group.notifications,
            ...similar.flatMap(g => g.notifications)
          ],
          count: group.count + similar.reduce((sum, g) => sum + g.count, 0),
          latestTimestamp: new Date(Math.max(
            group.latestTimestamp.getTime(),
            ...similar.map(g => g.latestTimestamp.getTime())
          ))
        };

        merged.push(mergedGroup);
        processed.add(group.id);
        similar.forEach(g => processed.add(g.id));
      } else {
        merged.push(group);
        processed.add(group.id);
      }
    }

    return merged;
  }

  /**
   * Check if two groups are similar enough to merge
   */
  private areGroupsSimilar(group1: NotificationGroup, group2: NotificationGroup): boolean {
    // Same type and similar labels
    return group1.type === group2.type && 
           this.getLevenshteinDistance(group1.label, group2.label) <= 2;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private getLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Expand a group (show all notifications)
   */
  expandGroup(group: NotificationGroup): NotificationGroup {
    return { ...group, collapsed: false };
  }

  /**
   * Collapse a group (show summary only)
   */
  collapseGroup(group: NotificationGroup): NotificationGroup {
    return { ...group, collapsed: true };
  }

  /**
   * Get group summary for collapsed view
   */
  getGroupSummary(group: NotificationGroup): string {
    if (group.count === 1) {
      return group.notifications[0].message;
    }

    const latestNotification = group.notifications[0]; // Assuming sorted by timestamp
    return `${latestNotification.message} (+${group.count - 1} más)`;
  }
}

// Export singleton instance
export const groupingService = new GroupingService();