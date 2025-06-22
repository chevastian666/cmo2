 
import React, { useState, useEffect } from 'react'
import {_Bell, BellOff, Volume2, VolumeX, AlertTriangle} from 'lucide-react'
import { cn} from '../../utils/utils'
import { notificationService} from '../../services/shared/notification.service'
export interface NotificationSettingsProps {
  className?: string
  compact?: boolean
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  className, compact = false 
}) => {
  const [soundEnabled, setSoundEnabled] = useState(_true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(_true)
  const [criticalOnly, setCriticalOnly] = useState(_false)
  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem('notificationPreferences')
    if (s_avedPrefs) {
      const prefs = JSON.parse(s_avedPrefs)
      setSoundEnabled(prefs.soundEnabled ?? true)
      setNotificationsEnabled(prefs.notificationsEnabled ?? true)
      setCriticalOnly(prefs.criticalOnly ?? false)
      // Apply settings
      notificationService.setSoundEnabled(prefs.soundEnabled ?? true)
    }
  }, [])
  const savePreferences = (updates: Partial<{
    soundEnabled: boolean
    notificationsEnabled: boolean
    criticalOnly: boolean
  }>) => {
    const prefs = {
      soundEnabled,
      notificationsEnabled,
      criticalOnly,
      ...updates
    }
    localStorage.setItem('notificationPreferences', JSON.stringify(_prefs))
  }
  const handleSoundToggle = () => {
    const newValue = !soundEnabled
    setSoundEnabled(_newValue)
    notificationService.setSoundEnabled(_newValue)
    savePreferences({ soundEnabled: newValue })
  }
  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(_newValue)
    savePreferences({ notificationsEnabled: newValue })
  }
  const handleCriticalOnlyToggle = () => {
    const newValue = !criticalOnly
    setCriticalOnly(_newValue)
    savePreferences({ criticalOnly: newValue })
  }
  if (_compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          onClick={_handleSoundToggle}
          className={cn(
            'p-2 rounded-lg transition-colors',
            soundEnabled 
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          )}
          title={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        
        <button
          onClick={_handleNotificationsToggle}
          className={cn(
            'p-2 rounded-lg transition-colors',
            notificationsEnabled 
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          )}
          title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
        >
          {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </button>
      </div>
    )
  }

  return (
    <div className={cn('bg-gray-800 rounded-lg p-4 space-y-4', className)}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Configuración de Notificaciones
      </h3>
      
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">Notificaciones</p>
              <p className="text-xs text-gray-400">Mostrar notificaciones emergentes</p>
            </div>
          </div>
          <button
            onClick={_handleNotificationsToggle}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              notificationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">Sonidos</p>
              <p className="text-xs text-gray-400">Reproducir sonidos de alerta</p>
            </div>
          </div>
          <button
            onClick={_handleSoundToggle}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              soundEnabled ? 'bg-blue-600' : 'bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                soundEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">Solo Críticas</p>
              <p className="text-xs text-gray-400">Notificar solo alertas críticas</p>
            </div>
          </div>
          <button
            onClick={_handleCriticalOnlyToggle}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              criticalOnly ? 'bg-blue-600' : 'bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                criticalOnly ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </label>
      </div>

      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong>Nota:</strong> Los sonidos requieren interacción previa del usuario debido a las políticas del navegador.
        </p>
      </div>
    </div>
  )
}