/**
 * Individual Notification Item Component
 * Displays single notification with actions and details
 * By Cheva
 */
import React, { useState } from 'react'
import { motion} from 'framer-motion'
import {
  Clock, MapPin, User, Eye, EyeOff, AlertTriangle, Info, XCircle, Volume2, VolumeX
} from 'lucide-react'
import type { Notification} from '../../types/notifications'
import { QuickActions} from './QuickActions'
import { formatDistanceToNow} from 'date-fns'
import { es} from 'date-fns/locale'
interface NotificationItemProps {
  notification: Notification
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onAction: (action: string, payload?: unknown) => void
  expanded?: boolean
}
const priorityConfig = {
  low: {
    color: 'text-gray-400',
    bg: 'bg-gray-700',
    icon: Info
  },
  normal: {
    color: 'text-blue-400',
    bg: 'bg-blue-900',
    icon: Info
  },
  high: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-900',
    icon: AlertTriangle
  },
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-900',
    icon: XCircle
  }
}
const statusConfig = {
  unread: {
    color: 'text-blue-400',
    bg: 'bg-blue-900',
    label: 'Sin leer'
  },
  read: {
    color: 'text-gray-400',
    bg: 'bg-gray-700',
    label: 'Leído'
  },
  acknowledged: {
    color: 'text-green-400',
    bg: 'bg-green-900',
    label: 'Confirmado'
  },
  snoozed: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-900',
    label: 'Pospuesto'
  },
  escalated: {
    color: 'text-red-400',
    bg: 'bg-red-900',
    label: 'Escalado'
  },
  dismissed: {
    color: 'text-gray-500',
    bg: 'bg-gray-800',
    label: 'Descartado'
  }
}
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification, isSelected, onSelect, onAction, expanded = false
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const priority = priorityConfig[notification.priority]
  const status = statusConfig[notification.status]
  const PriorityIcon = priority.icon
  const handlePlaySound = async () => {
    if (notification.sound && !isPlaying) {
      try {
        setIsPlaying(true)
        const audio = new Audio(notification.sound.url)
        audio.volume = notification.sound.volume || 0.5
        await audio.play()
        setTimeout(() => setIsPlaying(false), notification.sound.duration)
      } catch (error) {
        console.error('Failed to play notification sound:', error)
        setIsPlaying(false)
      }
    }
  }
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es
    })
  }
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return '🚨'
      case 'transit':
        return '🚛'
      case 'precinto':
        return '🔒'
      case 'system':
        return '⚙️'
      case 'user':
        return '👤'
      case 'maintenance':
        return '🔧'
      default:
        return '📢'
    }
  }
  return (<motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border-b border-gray-700 hover:bg-gray-800 transition-colors ${
        notification.status === 'unread' ? 'bg-gray-850' : ''
      } ${isSelected ? 'bg-blue-900 bg-opacity-30' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Selection Checkbox */}
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
          </div>
          {/* Type Icon */}
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full ${priority.bg} flex items-center justify-center`}>
              <span className="text-lg">{getTypeIcon(notification.type)}</span>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-medium ${
                    notification.status === 'unread' ? 'text-white' : 'text-gray-300'
                  }`}>
                    {notification.title}
                  </h3>
                  {/* Priority Indicator */}
                  <PriorityIcon className={`w-4 h-4 ${priority.color}`} />
                  {/* Status Badge */}
                  <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  {/* Group Indicator */}
                  {notification.groupId && (
                    <span className="text-xs px-2 py-1 bg-purple-900 text-purple-300 rounded-full">
                      {notification.groupLabel || 'Grupo'}
                    </span>
                  )}
                </div>
                {/* Message */}
                <p className={`text-sm mb-2 ${
                  notification.status === 'unread' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {notification.message}
                </p>
                {/* Metadata */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(notification.timestamp)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>📍</span>
                    <span>{notification.metadata.source}</span>
                  </div>
                  {notification.metadata.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {notification.metadata.location.address ||
                         `${notification.metadata.location.lat.toFixed(4)}, ${notification.metadata.location.lng.toFixed(4)}`}
                      </span>
                    </div>
                  )}
                  {notification.acknowledgedBy && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>por {notification.acknowledgedBy}</span>
                    </div>
                  )}
                </div>
                {/* Expanded Details */}
                {expanded && showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <h4 className="font-medium text-gray-300 mb-2">Detalles</h4>
                        <div className="space-y-1 text-gray-400">
                          <div>ID: {notification.id}</div>
                          <div>Tipo: {notification.type}</div>
                          <div>Prioridad: {notification.priority}</div>
                          <div>Fuente: {notification.metadata.source}</div>
                          {notification.metadata.entityType && (
                            <div>Entidad: {notification.metadata.entityType}</div>
                          )}
                          {notification.metadata.entityId && (
                            <div>ID Entidad: {notification.metadata.entityId}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-300 mb-2">Fechas</h4>
                        <div className="space-y-1 text-gray-400">
                          <div>Creado: {notification.timestamp.toLocaleString()}</div>
                          {notification.readAt && (
                            <div>Leído: {notification.readAt.toLocaleString()}</div>
                          )}
                          {notification.acknowledgedAt && (
                            <div>Confirmado: {notification.acknowledgedAt.toLocaleString()}</div>
                          )}
                          {notification.snoozedUntil && (
                            <div>Pospuesto hasta: {notification.snoozedUntil.toLocaleString()}</div>
                          )}
                          {notification.expiresAt && (
                            <div>Expira: {notification.expiresAt.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Additional Metadata */}
                    {notification.metadata.additionalData && (
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-300 mb-2">Datos Adicionales</h4>
                        <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-auto">
                          {JSON.stringify(notification.metadata.additionalData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                {/* Sound Button */}
                {notification.sound && (
                  <button
                    onClick={handlePlaySound}
                    disabled={isPlaying}
                    className={`p-1 rounded transition-colors ${
                      isPlaying
                        ? 'text-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Reproducir sonido"
                  >
                    {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                )}
                {/* Details Toggle */}
                {expanded && (<button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title={showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                  >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
                {/* Quick Actions */}
                <QuickActions
                  notification={notification}
                  onAction={onAction}
                  compact={true}
                />
              </div>
            </div>
            {/* Image */}
            {notification.image && (
              <div className="mt-3">
                <img
                  src={notification.image}
                  alt="Notification image"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            {/* Action Buttons (_expanded) */}
            {notification.actions.length > 0 && (<div className="mt-3 flex flex-wrap gap-2">
                {notification.actions.map((action) => (<button
                    key={action.id}
                    onClick={() => onAction(action.type, action.payload)}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      action.color === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                      action.color === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                      action.color === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                      action.color === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                      'bg-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
