/**
 * Notification System Demo Page
 * Comprehensive demonstration of all notification features
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import { motion} from 'framer-motion';
import { Bell, Settings, TestTube2, Smartphone, Mail, TrendingUp, AlertTriangle, CheckCircle, Play} from 'lucide-react';
import { NotificationButton, NotificationPreferences} from '../../../components/notifications';
import { notificationService} from '../../../services/notifications/notificationService';
import { pushNotificationService} from '../../../services/notifications/pushNotificationService';
import type { 
  NotificationPreferences as NotificationPrefsType, NotificationType, NotificationPriority, NotificationStats} from '../../../types/notifications';
import { DEFAULT_SOUNDS} from '../../../types/notifications';

export const NotificationSystemDemo: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPrefsType | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'preferences' | 'stats'>('demo');
   

  useEffect(() => {
    initializeDemo();
  }, []);

  const initializeDemo = async () => {
    // Initialize notification service
    await notificationService.initialize();
    
    // Load preferences
    const prefs = await notificationService.loadPreferences();
    setPreferences(prefs);
    
    // Load stats
    const currentStats = notificationService.getStats();
    setStats(currentStats);
    
    // Check push notification support
    const supported = pushNotificationService.isSupported();
    setPushSupported(supported);
    
    if (supported) {
      const subscribed = await pushNotificationService.isSubscribed();
      setPushSubscribed(subscribed);
    }
  };

  const createTestNotification = async (type: NotificationType, priority: NotificationPriority, title: string, message: string) => {
    await notificationService.createNotification(type, title, message, {
      priority,
      metadata: {
        source: 'demo',
        sourceId: `demo-${Date.now()}`
      }
    });
    
    // Update stats
    const currentStats = notificationService.getStats();
    setStats(currentStats);
  };

  const testPushPermission = async () => {
    try {
      const permission = await pushNotificationService.requestPermission();
      if (permission === 'granted') {
        const subscription = await pushNotificationService.subscribe();
        setPushSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Failed to test push permission:', error);
    }
  };

  const testNotificationChannels = async () => {
    await notificationService.testNotification('in-app', 'system');
    
    if (pushSubscribed) {
      await notificationService.testNotification('push', 'system');
    }
  };

  const generateSampleNotifications = async () => {
    const sampleNotifications = [
      {
        type: 'alert' as NotificationType,
        priority: 'critical' as NotificationPriority,
        title: 'Alerta Crítica de Seguridad',
        message: 'Violación de precinto detectada en contenedor TCLU-123456'
      },
      {
        type: 'transit' as NotificationType,
        priority: 'high' as NotificationPriority,
        title: 'Retraso en Tránsito',
        message: 'El tránsito TRN-2024-001 presenta un retraso de 2 horas'
      },
      {
        type: 'precinto' as NotificationType,
        priority: 'normal' as NotificationPriority,
        title: 'Batería Baja',
        message: 'El precinto PRC-789 tiene batería baja (15% restante)'
      },
      {
        type: 'system' as NotificationType,
        priority: 'normal' as NotificationPriority,
        title: 'Actualización del Sistema',
        message: 'El sistema se actualizará automáticamente a las 02:00'
      },
      {
        type: 'user' as NotificationType,
        priority: 'low' as NotificationPriority,
        title: 'Nuevo Mensaje',
        message: 'Tienes un nuevo mensaje del supervisor de turno'
      }
    ];

    for (const notif of sampleNotifications) {
      await createTestNotification(notif.type, notif.priority, notif.title, notif.message);
      // Add delay between notifications
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handlePreferencesUpdate = async (newPreferences: NotificationPrefsType) => {
    await notificationService.updatePreferences(newPreferences);
    setPreferences(newPreferences);
  };

  const handleTestSound = async (soundUrl: string, volume: number) => {
    try {
      const audio = new Audio(soundUrl);
      audio.volume = volume;
      await audio.play();
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const clearAllNotifications = async () => {
    const allNotifications = notificationService.getNotifications();
    const notificationIds = allNotifications.map(n => n.id);
    await notificationService.handleBulkAction(notificationIds, 'dismiss');
    
    const currentStats = notificationService.getStats();
    setStats(currentStats);
  };

  return (<div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Sistema de Notificaciones CMO
              </h1>
              <p className="text-gray-400">
                Demonstración completa del sistema de notificaciones push
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Button */}
              <NotificationButton className="scale-150" />
              
              {/* Push Status Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                pushSubscribed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">
                  Push: {pushSubscribed ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { key: 'demo', label: 'Demostración', icon: TestTube2 }, { key: 'preferences', label: 'Preferencias', icon: Settings }, { key: 'stats', label: 'Estadísticas', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (<button
                key={key}
                onClick={() => setActiveTab(key as unknown)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Demo Tab */}
          {activeTab === 'demo' && (<motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Acciones Rápidas
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => createTestNotification(
                      'alert', 
                      'critical', 
                      'Alerta Crítica', 
                      'Esta es una alerta crítica de prueba'
                    )}
                    className="flex items-center space-x-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>Alerta Crítica</span>
                  </button>
                  
                  <button
                    onClick={generateSampleNotifications}
                    className="flex items-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Generar Ejemplos</span>
                  </button>
                  
                  <button
                    onClick={testNotificationChannels}
                    className="flex items-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <TestTube2 className="w-5 h-5" />
                    <span>Test Canales</span>
                  </button>
                  
                  <button
                    onClick={clearAllNotifications}
                    className="flex items-center space-x-2 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Limpiar Todo</span>
                  </button>
                </div>
              </div>

              {/* Push Notifications Setup */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Configuración Push
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium text-white">Notificaciones Push</div>
                        <div className="text-sm text-gray-400">
                          {pushSupported ? 'Soportado por el navegador' : 'No soportado'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={testPushPermission}
                      disabled={!pushSupported}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pushSubscribed
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
                      }`}
                    >
                      {pushSubscribed ? 'Activado' : 'Activar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sound Testing */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Prueba de Sonidos
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEFAULT_SOUNDS.map((sound) => (<div key={sound.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{sound.name}</span>
                        <button
                          onClick={() => handleTestSound(sound.url, sound.volume || 0.7)}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-400">
                        Duración: {Math.round(sound.duration / 1000)}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Overview */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Características Implementadas
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-white mb-3">🔔 Tipos de Notificación</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 🚨 Alertas críticas de seguridad</li>
                      <li>• 🚛 Actualizaciones de tránsitos</li>
                      <li>• 🔒 Estados de precintos</li>
                      <li>• ⚙️ Notificaciones del sistema</li>
                      <li>• 👤 Mensajes de usuarios</li>
                      <li>• 🔧 Avisos de mantenimiento</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white mb-3">⚡ Acciones Rápidas</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• ✅ Confirmar (acknowledge)</li>
                      <li>• ⏰ Posponer (snooze)</li>
                      <li>• ⬆️ Escalar a supervisor</li>
                      <li>• 👁️ Marcar como leído</li>
                      <li>• 🗂️ Archivar</li>
                      <li>• ❌ Descartar</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white mb-3">📱 Canales de Entrega</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 💻 Notificaciones in-app</li>
                      <li>• 📱 Push del navegador</li>
                      <li>• 📧 Correo electrónico</li>
                      <li>• 🔊 Sonidos personalizables</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white mb-3">🎛️ Funciones Avanzadas</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 📋 Agrupación inteligente</li>
                      <li>• 🔍 Filtros avanzados</li>
                      <li>• 📊 Estadísticas completas</li>
                      <li>• ⏲️ Horarios "No molestar"</li>
                      <li>• 🔄 Auto-acciones</li>
                      <li>• 💾 Historial completo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && preferences && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NotificationPreferences
                preferences={preferences}
                onSave={handlePreferencesUpdate}
                onTest={notificationService.testNotification.bind(notificationService)}
              />
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.total}</div>
                      <div className="text-sm text-gray-400">Total</div>
                    </div>
                    <Bell className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">{stats.unread}</div>
                      <div className="text-sm text-gray-400">Sin Leer</div>
                    </div>
                    <Mail className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
                      <div className="text-sm text-gray-400">Críticas</div>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{stats.acknowledged}</div>
                      <div className="text-sm text-gray-400">Confirmadas</div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Por Tipo</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{type}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Por Prioridad</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{priority}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Métricas de Rendimiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400">Tiempo Promedio de Respuesta</div>
                    <div className="text-2xl font-bold text-white">
                      {Math.round(stats.averageResponseTime)} min
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Tasa de Escalación</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.escalationRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};