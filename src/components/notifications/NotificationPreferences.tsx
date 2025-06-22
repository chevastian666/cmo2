/**
 * Notification Preferences Component
 * User configuration for notification channels and settings
 * By Cheva
 */

import React, { useState, useEffect } from 'react'
import { motion} from 'framer-motion'
import {
  Bell, BellOff, Mail, Smartphone, Monitor, Volume2, VolumeX, Clock, Settings, Save, RefreshCw, TestTube2} from 'lucide-react'
import type {
  NotificationPreferences, NotificationType, NotificationPriority, NotificationChannel, } from '../../types/notifications'
import { DEFAULT_SOUNDS} from '../../types/notifications'
interface NotificationPreferencesProps {
  preferences: NotificationPreferences
  onSave: (preferences: NotificationPreferences) => void
  onTest: (channel: NotificationChannel, type: NotificationType) => void
  className?: string
}

const notificationTypes: { key: NotificationType; label: string; icon: string; description: string }[] = [
  {
    key: 'alert',
    label: 'Alertas Críticas',
    icon: '🚨',
    description: 'Notificaciones de emergencia y situaciones críticas'
  },
  {
    key: 'transit',
    label: 'Tránsitos',
    icon: '🚛',
    description: 'Actualizaciones de estado de tránsitos y rutas'
  },
  {
    key: 'precinto',
    label: 'Precintos',
    icon: '🔒',
    description: 'Estados de precintos y dispositivos de monitoreo'
  },
  {
    key: 'system',
    label: 'Sistema',
    icon: '⚙️',
    description: 'Notificaciones del sistema y mantenimiento'
  },
  {
    key: 'user',
    label: 'Usuario',
    icon: '👤',
    description: 'Mensajes personales y comunicaciones'
  },
  {
    key: 'maintenance',
    label: 'Mantenimiento',
    icon: '🔧',
    description: 'Programación y avisos de mantenimiento'
  }
]
const channels: { key: NotificationChannel; label: string; icon: React.ComponentType; description: string }[] = [
  {
    key: 'in-app',
    label: 'En la Aplicación',
    icon: Monitor,
    description: 'Notificaciones dentro del sistema CMO'
  },
  {
    key: 'push',
    label: 'Push del Navegador',
    icon: Smartphone,
    description: 'Notificaciones push del navegador web'
  },
  {
    key: 'email',
    label: 'Correo Electrónico',
    icon: Mail,
    description: 'Notificaciones por email'
  }
]
const priorities: { key: NotificationPriority; label: string; color: string }[] = [
  { key: 'low', label: 'Baja', color: 'text-gray-400' },
  { key: 'normal', label: 'Normal', color: 'text-blue-400' },
  { key: 'high', label: 'Alta', color: 'text-yellow-400' },
  { key: 'critical', label: 'Crítica', color: 'text-red-400' }
]
export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences, onSave, onTest, className = ''
}) => {
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(_preferences)
  const [hasChanges, setHasChanges] = useState(_false)
  const [activeTab, setActiveTab] = useState<'channels' | 'types' | 'sounds' | 'schedule'>('channels')
  const [testingChannel, setTestingChannel] = useState<{ channel: NotificationChannel; type: NotificationType } | null>(_null)
    useEffect(() => {
    setLocalPreferences(_preferences)
    setHasChanges(_false)
  }, [preferences])
    useEffect(() => {
    const isDifferent = JSON.stringify(_localPreferences) !== JSON.stringify(_preferences)
    setHasChanges(_isDifferent)
  }, [preferences])
  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    setLocalPreferences(prev => ({ ...prev, ...updates }))
  }
  const updateChannelPreferences = (channel: NotificationChannel, updates: Partial<typeof localPreferences.channels[NotificationChannel]>) => {
    setLocalPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          ...updates
        }
      }
    }))
  }
  const updateTypePreferences = (channel: NotificationChannel, type: NotificationType, updates: Partial<typeof localPreferences.channels[NotificationChannel]['types'][NotificationType]>) => {
    setLocalPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          types: {
            ...prev.channels[channel].types,
            [type]: {
              ...prev.channels[channel].types[type],
              ...updates
            }
          }
        }
      }
    }))
  }
  const handleSave = () => {
    onSave(_localPreferences)
    setHasChanges(_false)
  }
  const handleTest = async (channel: NotificationChannel, type: NotificationType) => {
    setTestingChannel({ channel, type })
    try {
      await onTest(_channel, type)
    } finally {
      setTimeout(() => setTestingChannel(_null), 2000)
    }
  }
  const resetToDefaults = () => {
    // Reset to default preferences
    const defaultPrefs: NotificationPreferences = {
      userId: localPreferences.userId,
      enabled: true,
      doNotDisturb: false,
      channels: {
        'in-app': {
          enabled: true,
          types: Object.fromEntries(
            notificationTypes.map(type => [
              type.key,
              {
                enabled: true,
                priority: ['critical', 'high'] as NotificationPriority[]
              }
            ])
          )
        },
        'push': {
          enabled: true,
          types: Object.fromEntries(
            notificationTypes.map(type => [
              type.key,
              {
                enabled: type.key === 'alert' || type.key === 'precinto',
                priority: ['critical'] as NotificationPriority[]
              }
            ])
          )
        },
        'email': {
          enabled: false,
          types: Object.fromEntries(
            notificationTypes.map(type => [
              type.key,
              {
                enabled: false,
                priority: [] as NotificationPriority[]
              }
            ])
          )
        }
      },
      grouping: {
        enabled: true,
        maxGroupSize: 5,
        groupByType: true,
        groupBySource: false,
        autoCollapseAfter: 30
      },
      sounds: {
        enabled: true,
        volume: 0.7,
        customSounds: []
      }
    } as NotificationPreferences
    setLocalPreferences(_defaultPrefs)
  }
  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${_className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Preferencias de Notificaciones
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <span className="text-sm text-yellow-400">
                Hay cambios sin guardar
              </span>
            )}
            
            <button
              onClick={_resetToDefaults}
              className="px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Restaurar
            </button>
            
            <button
              onClick={_handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Guardar
            </button>
          </div>
        </div>

        {/* Global Settings */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localPreferences.enabled}
              onChange={(_e) => updatePreferences({ enabled: e.target.checked })}
              className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-green-400" />
              <span className="text-white">Notificaciones habilitadas</span>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localPreferences.doNotDisturb}
              onChange={(_e) => updatePreferences({ doNotDisturb: e.target.checked })}
              className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <BellOff className="w-4 h-4 text-red-400" />
              <span className="text-white">No molestar</span>
            </div>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-8 px-6">
          {[
            { key: 'channels', label: 'Canales', icon: Monitor },
            { key: 'types', label: 'Tipos', icon: Bell },
            { key: 'sounds', label: 'Sonidos', icon: Volume2 },
            { key: 'schedule', label: 'Horario', icon: Clock }
          ].map((_key, label, icon: Icon ) => (<button
              key={_key}
              onClick={() => setActiveTab(key as 'channels' | 'types' | 'sounds' | 'schedule')}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{_label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Channels Tab */}
        {activeTab === 'channels' && (<div className="space-y-6">
            {channels.map(({ key: channel, label, icon: Icon, description }) => {
              const channelPrefs = localPreferences.channels[channel]
              return (<motion.div
                  key={_channel}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="font-medium text-white">{_label}</h3>
                        <p className="text-sm text-gray-400">{_description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleTest(_channel, 'system')}
                        disabled={!channelPrefs.enabled || testingChannel?.channel === channel}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {testingChannel?.channel === channel ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube2 className="w-4 h-4" />
                        )}
                      </button>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={channelPrefs.enabled}
                          onChange={(_e) =>
                            updateChannelPreferences(_channel, { enabled: e.target.checked })
                          }
                          className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  {channelPrefs.enabled && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {notificationTypes.map((_type) => {
                        const typePrefs = channelPrefs.types[type.key]
                        return (<div key={type.key} className="bg-gray-700 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span>{type.icon}</span>
                                <span className="text-sm font-medium text-white">
                                  {type.label}
                                </span>
                              </div>
                              
                              <input
                                type="checkbox"
                                checked={typePrefs.enabled}
                                onChange={(_e) =>
                                  updateTypePreferences(_channel, type.key, {
                                    enabled: e.target.checked
                                  })
                                }
                                className="rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                            
                            {typePrefs.enabled && (<div className="space-y-2">
                                <label className="text-xs text-gray-400">
                                  Prioridades activas:
                                </label>
                                <div className="flex flex-wrap gap-1">
                                  {priorities.map((_priority) => (
                                    <label
                                      key={priority.key}
                                      className="flex items-center space-x-1"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={typePrefs.priority.includes(priority.key)}
                                        onChange={(_e) => {
                                          const newPriorities = e.target.checked
                                            ? [...typePrefs.priority, priority.key]
                                            : typePrefs.priority.filter(p => p !== priority.key)
                                          updateTypePreferences(_channel, type.key, {
                                            priority: newPriorities
                                          })
                                        }}
                                        className="rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className={`text-xs ${priority.color}`}>
                                        {priority.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Types Tab */}
        {activeTab === 'types' && (<div className="space-y-4">
            {notificationTypes.map((_type) => (<motion.div
                key={type.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h3 className="font-medium text-white">{type.label}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {channels.map(({ key: channel, label, icon: Icon }) => {
                    const typePrefs = localPreferences.channels[channel].types[type.key]
                    const channelEnabled = localPreferences.channels[channel].enabled
                    return (<div
                        key={_channel}
                        className={`p-3 rounded border-2 transition-colors ${
                          channelEnabled && typePrefs.enabled
                            ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                            : 'border-gray-600 bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-white">{_label}</span>
                          </div>
                          
                          <input
                            type="checkbox"
                            checked={channelEnabled && typePrefs.enabled}
                            disabled={!channelEnabled}
                            onChange={(_e) =>
                              updateTypePreferences(_channel, type.key, {
                                enabled: e.target.checked
                              })
                            }
                            className="rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </div>
                        
                        {channelEnabled && typePrefs.enabled && (
                          <div className="text-xs text-gray-400">
                            Prioridades: {typePrefs.priority.join(', ') || 'Ninguna'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Sounds Tab */}
        {activeTab === 'sounds' && (<motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Sound Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-4">Configuración de Sonidos</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localPreferences.sounds.enabled}
                    onChange={(_e) =>
                      updatePreferences({
                        sounds: { ...localPreferences.sounds, enabled: e.target.checked }
                      })
                    }
                    className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    {localPreferences.sounds.enabled ? (
                      <Volume2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-white">Sonidos habilitados</span>
                  </div>
                </label>

                {localPreferences.sounds.enabled && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Volumen: {Math.round(localPreferences.sounds.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localPreferences.sounds.volume}
                      onChange={(_e) =>
                        updatePreferences({
                          sounds: {
                            ...localPreferences.sounds,
                            volume: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Default Sounds */}
            {localPreferences.sounds.enabled && (<div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-white mb-4">Sonidos Disponibles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_SOUNDS.map((s_ound) => (
                    <div key={sound.id} className="bg-gray-700 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{sound.name}</div>
                          <div className="text-sm text-gray-400">
                            {Math.round(sound.duration / 1000)}s
                          </div>
                        </div>
                        
                        <button
                          onClick={async () => {
                            try {
                              const audio = new Audio(sound.url)
                              audio.volume = localPreferences.sounds.volume
                              await audio.play()
                            } catch (_error) {
                              console.error('Failed to play sound:', error)
                            }
                          }}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (<motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Do Not Disturb Schedule */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-4">Horario "No Molestar"</h3>
              
              <label className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  checked={localPreferences.doNotDisturbSchedule?.enabled || false}
                  onChange={(_e) =>
                    updatePreferences({
                      doNotDisturbSchedule: {
                        ...localPreferences.doNotDisturbSchedule,
                        enabled: e.target.checked,
                        startTime: '22:00',
                        endTime: '08:00',
                        days: [0, 1, 2, 3, 4, 5, 6]
                      }
                    })
                  }
                  className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-white">Activar horario automático</span>
              </label>

              {localPreferences.doNotDisturbSchedule?.enabled && (<div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Hora de inicio:
                      </label>
                      <input
                        type="time"
                        value={localPreferences.doNotDisturbSchedule.startTime}
                        onChange={(_e) =>
                          updatePreferences({
                            doNotDisturbSchedule: {
                              ...localPreferences.doNotDisturbSchedule!,
                              startTime: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Hora de fin:
                      </label>
                      <input
                        type="time"
                        value={localPreferences.doNotDisturbSchedule.endTime}
                        onChange={(_e) =>
                          updatePreferences({
                            doNotDisturbSchedule: {
                              ...localPreferences.doNotDisturbSchedule!,
                              endTime: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Días de la semana:
                    </label>
                    <div className="flex space-x-2">
                      {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((_day, index) => (
                        <label key={_day} className="flex flex-col items-center">
                          <input
                            type="checkbox"
                            checked={localPreferences.doNotDisturbSchedule!.days.includes(_index)}
                            onChange={(_e) => {
                              const days = e.target.checked
                                ? [...localPreferences.doNotDisturbSchedule!.days, index]
                                : localPreferences.doNotDisturbSchedule!.days.filter(d => d !== index)
                              updatePreferences({
                                doNotDisturbSchedule: {
                                  ...localPreferences.doNotDisturbSchedule!,
                                  days
                                }
                              })
                            }}
                            className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 mb-1"
                          />
                          <span className="text-xs text-gray-400">{_day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Grouping Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-4">Agrupación de Notificaciones</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localPreferences.grouping.enabled}
                    onChange={(_e) =>
                      updatePreferences({
                        grouping: { ...localPreferences.grouping, enabled: e.target.checked }
                      })
                    }
                    className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-white">Agrupar notificaciones similares</span>
                </label>

                {localPreferences.grouping.enabled && (<div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Máximo por grupo:
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="20"
                        value={localPreferences.grouping.maxGroupSize}
                        onChange={(_e) =>
                          updatePreferences({
                            grouping: {
                              ...localPreferences.grouping,
                              maxGroupSize: parseInt(e.target.value)
                            }
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Auto-colapsar después de (_min):
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={localPreferences.grouping.autoCollapseAfter}
                        onChange={(_e) =>
                          updatePreferences({
                            grouping: {
                              ...localPreferences.grouping,
                              autoCollapseAfter: parseInt(e.target.value)
                            }
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}