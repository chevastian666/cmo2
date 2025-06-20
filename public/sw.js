/**
 * Service Worker for Push Notifications
 * Handles background push notifications for CMO system
 * By Cheva
 */

const CACHE_NAME = 'cmo-notifications-v1';
const CMO_ORIGIN = self.location.origin;

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'CMO Notification',
    body: 'You have a new notification',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'cmo-notification',
    data: {}
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        title: pushData.title || notificationData.title,
        body: pushData.message || pushData.body || notificationData.body,
        icon: pushData.icon || notificationData.icon,
        badge: pushData.badge || notificationData.badge,
        image: pushData.image,
        tag: pushData.id || pushData.tag || notificationData.tag,
        requireInteraction: pushData.priority === 'critical',
        silent: false,
        timestamp: pushData.timestamp ? new Date(pushData.timestamp).getTime() : Date.now(),
        data: {
          notificationId: pushData.id,
          type: pushData.type,
          priority: pushData.priority,
          url: pushData.url,
          actions: pushData.actions || [],
          metadata: pushData.metadata || {}
        }
      };

      // Add action buttons for supported notifications
      if (pushData.actions && pushData.actions.length > 0) {
        notificationData.actions = pushData.actions.slice(0, 2).map(action => ({
          action: action.id,
          title: action.label,
          icon: action.icon
        }));
      }
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  event.waitUntil(
    (async () => {
      // Handle action buttons
      if (action) {
        await handleNotificationAction(action, data);
        return;
      }

      // Handle regular notification click
      const urlToOpen = getNotificationUrl(data);
      
      // Try to focus existing window first
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      let clientToFocus = null;

      // Look for existing CMO window
      for (let client of windowClients) {
        if (client.url.startsWith(CMO_ORIGIN)) {
          clientToFocus = client;
          break;
        }
      }

      if (clientToFocus) {
        // Focus existing window and navigate
        await clientToFocus.focus();
        if (urlToOpen && clientToFocus.navigate) {
          await clientToFocus.navigate(urlToOpen);
        } else if (urlToOpen) {
          // Fallback: send message to client to navigate
          clientToFocus.postMessage({
            type: 'NAVIGATE',
            url: urlToOpen
          });
        }
      } else {
        // Open new window
        await self.clients.openWindow(urlToOpen || CMO_ORIGIN);
      }

      // Mark notification as read
      if (data.notificationId) {
        await markNotificationAsRead(data.notificationId);
      }
    })()
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const data = event.notification.data || {};
  
  // Track notification dismissal
  if (data.notificationId) {
    event.waitUntil(
      markNotificationAsDismissed(data.notificationId)
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CLEAR_NOTIFICATIONS':
      clearAllNotifications();
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

/**
 * Handle notification action buttons
 */
async function handleNotificationAction(action, data) {
  const { notificationId, type, metadata } = data;

  try {
    switch (action) {
      case 'acknowledge':
        await acknowledgeNotification(notificationId);
        break;
      case 'snooze':
        await snoozeNotification(notificationId);
        break;
      case 'escalate':
        await escalateNotification(notificationId);
        break;
      case 'view':
        const url = getNotificationUrl(data);
        await self.clients.openWindow(url || CMO_ORIGIN);
        break;
      default:
        console.log('Unknown action:', action);
    }
  } catch (error) {
    console.error('Failed to handle notification action:', error);
  }
}

/**
 * Get URL for notification based on type
 */
function getNotificationUrl(data) {
  const { type, metadata, url } = data;

  if (url) {
    return CMO_ORIGIN + url;
  }

  if (!metadata || !metadata.sourceId) {
    return CMO_ORIGIN;
  }

  switch (type) {
    case 'alert':
      return `${CMO_ORIGIN}/alertas?id=${metadata.sourceId}`;
    case 'transit':
      return `${CMO_ORIGIN}/transitos?id=${metadata.sourceId}`;
    case 'precinto':
      return `${CMO_ORIGIN}/precintos?id=${metadata.sourceId}`;
    case 'system':
      return `${CMO_ORIGIN}/`;
    default:
      return CMO_ORIGIN;
  }
}

/**
 * API helper functions
 */
async function makeApiRequest(endpoint, options = {}) {
  const token = await getStoredToken();
  
  return fetch(`${CMO_ORIGIN}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    },
    ...options
  });
}

async function getStoredToken() {
  // Try to get token from IndexedDB or communicate with main thread
  try {
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.token);
        };
        clients[0].postMessage({ type: 'GET_TOKEN' }, [messageChannel.port2]);
      });
    }
  } catch (error) {
    console.error('Failed to get token:', error);
  }
  return null;
}

async function markNotificationAsRead(notificationId) {
  try {
    await makeApiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

async function markNotificationAsDismissed(notificationId) {
  try {
    await makeApiRequest(`/notifications/${notificationId}/dismiss`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Failed to mark notification as dismissed:', error);
  }
}

async function acknowledgeNotification(notificationId) {
  try {
    await makeApiRequest(`/notifications/${notificationId}/acknowledge`, {
      method: 'POST'
    });
    
    // Show confirmation
    await self.registration.showNotification('Notificación Confirmada', {
      body: 'La notificación ha sido confirmada exitosamente',
      icon: '/icons/success-icon.png',
      tag: 'ack-confirmation',
      silent: true,
      timestamp: Date.now(),
      data: { temporary: true }
    });
    
    // Auto-close confirmation after 3 seconds
    setTimeout(async () => {
      const notifications = await self.registration.getNotifications({ tag: 'ack-confirmation' });
      notifications.forEach(n => n.close());
    }, 3000);
    
  } catch (error) {
    console.error('Failed to acknowledge notification:', error);
  }
}

async function snoozeNotification(notificationId) {
  try {
    await makeApiRequest(`/notifications/${notificationId}/snooze`, {
      method: 'POST',
      body: JSON.stringify({ duration: 300000 }) // 5 minutes
    });
    
    await self.registration.showNotification('Notificación Pospuesta', {
      body: 'La notificación se reactivará en 5 minutos',
      icon: '/icons/snooze-icon.png',
      tag: 'snooze-confirmation',
      silent: true,
      timestamp: Date.now(),
      data: { temporary: true }
    });
    
    setTimeout(async () => {
      const notifications = await self.registration.getNotifications({ tag: 'snooze-confirmation' });
      notifications.forEach(n => n.close());
    }, 3000);
    
  } catch (error) {
    console.error('Failed to snooze notification:', error);
  }
}

async function escalateNotification(notificationId) {
  try {
    await makeApiRequest(`/notifications/${notificationId}/escalate`, {
      method: 'POST'
    });
    
    await self.registration.showNotification('Notificación Escalada', {
      body: 'La notificación ha sido escalada al supervisor',
      icon: '/icons/escalate-icon.png',
      tag: 'escalate-confirmation',
      silent: true,
      timestamp: Date.now(),
      data: { temporary: true }
    });
    
    setTimeout(async () => {
      const notifications = await self.registration.getNotifications({ tag: 'escalate-confirmation' });
      notifications.forEach(n => n.close());
    }, 3000);
    
  } catch (error) {
    console.error('Failed to escalate notification:', error);
  }
}

async function clearAllNotifications() {
  try {
    const notifications = await self.registration.getNotifications();
    notifications.forEach(notification => {
      if (!notification.data?.temporary) {
        notification.close();
      }
    });
  } catch (error) {
    console.error('Failed to clear notifications:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  switch (event.tag) {
    case 'notification-actions':
      event.waitUntil(syncPendingActions());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

async function syncPendingActions() {
  // Sync any pending notification actions when back online
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingActions = await cache.match('pending-actions');
    
    if (pendingActions) {
      const actions = await pendingActions.json();
      
      for (const action of actions) {
        await handleNotificationAction(action.type, action.data);
      }
      
      // Clear pending actions
      await cache.delete('pending-actions');
    }
  } catch (error) {
    console.error('Failed to sync pending actions:', error);
  }
}