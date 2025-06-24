/**
 * Quick Actions Component
 * Provides quick action buttons for notifications
 * By Cheva
 */

import React, { useState } from 'react'
import { motion, AnimatePresence} from 'framer-motion'
import { 
  CheckCircle, Clock, ArrowUp, X, Eye, MoreHorizontal, Archive} from 'lucide-react'
import type { Notification} from '../../types/notifications'
interface QuickActionsProps {
  notification?: Notification
  onAction: (action: string, payload?: unknown) => void
  compact?: boolean
  disabled?: boolean
}

interface SnoozeOption {
  label: string
  duration: number; // minutes
}

const snoozeOptions: SnoozeOption[] = [
  { label: '5 min', duration: 5 },
  { label: '15 min', duration: 15 },
  { label: '30 min', duration: 30 },
  { label: '1 hora', duration: 60 },
  { label: '2 horas', duration: 120 },
  { label: '1 día', duration: 1440 }
]
export const QuickActions: React.FC<QuickActionsProps> = ({
  notification, onAction, compact: _compact = false, disabled: _disabled = false
}) => {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)
  const _handleAcknowledge = () => {
    onAction('acknowledge')
  }
  const handleSnooze = (duration: number) => {
    const snoozedUntil = new Date(Date.now() + duration * 60 * 1000)
    onAction('snooze', { snoozedUntil, duration })
    setShowSnoozeOptions(false)
  }
  const _handleEscalate = () => {
    onAction('escalate')
  }
  const _handleDismiss = () => {
    onAction('dismiss')
  }
  const _handleMarkRead = () => {
    onAction('mark-read')
  }
  const _handleArchive = () => {
    onAction('archive')
  }
  const canAcknowledge = !notification || notification.status === 'unread' || notification.status === 'read'
  const canSnooze = !notification || (notification.status !== 'acknowledged' && notification.status !== 'dismissed')
  const canEscalate = !notification || notification.priority !== 'low'
  const isUnread = notification?.status === 'unread'
  if (_compact) {
    return (
      <div className="flex items-center space-x-1">
        {/* Acknowledge */}
        {canAcknowledge && (
          <button
            onClick={_handleAcknowledge}
            disabled={_disabled}
            className="p-1 text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50"
            title="Confirmar"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}

        {/* Snooze */}
        {canSnooze && (<div className="relative">
            <button
              onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
              disabled={_disabled}
              className="p-1 text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
              title="Posponer"
            >
              <Clock className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showSnoozeOptions && (<motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-max"
                >
                  {snoozeOptions.map((option) => (<button
                      key={option.duration}
                      onClick={() => handleSnooze(option.duration)}
                      className="block w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* More Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMoreActions(!showMoreActions)}
            disabled={_disabled}
            className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Más acciones"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMoreActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-max"
              >
                {isUnread && (
                  <button
                    onClick={_handleMarkRead}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Marcar como leído</span>
                  </button>
                )}

                {canEscalate && (
                  <button
                    onClick={_handleEscalate}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>Escalar</span>
                  </button>
                )}

                <button
                  onClick={_handleArchive}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archivar</span>
                </button>

                <button
                  onClick={_handleDismiss}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg"
                >
                  <X className="w-4 h-4" />
                  <span>Descartar</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Full action buttons for expanded view
  return (
    <div className="flex flex-wrap gap-2">
      {/* Primary Actions */}
      {canAcknowledge && (
        <button
          onClick={_handleAcknowledge}
          disabled={_disabled}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Confirmar</span>
        </button>
      )}

      {/* Snooze with dropdown */}
      {canSnooze && (<div className="relative">
          <button
            onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
            disabled={_disabled}
            className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock className="w-4 h-4" />
            <span>Posponer</span>
          </button>

          <AnimatePresence>
            {showSnoozeOptions && (<motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-max"
              >
                <div className="p-2">
                  <div className="text-xs text-gray-400 mb-2">Posponer por:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {snoozeOptions.map((option) => (<button
                        key={option.duration}
                        onClick={() => handleSnooze(option.duration)}
                        className="px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Secondary Actions */}
      {isUnread && (
        <button
          onClick={_handleMarkRead}
          disabled={_disabled}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          <span>Marcar leído</span>
        </button>
      )}

      {canEscalate && (
        <button
          onClick={_handleEscalate}
          disabled={_disabled}
          className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Escalar</span>
        </button>
      )}

      {/* Archive */}
      <button
        onClick={_handleArchive}
        disabled={_disabled}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Archive className="w-4 h-4" />
        <span>Archivar</span>
      </button>

      {/* Dismiss */}
      <button
        onClick={_handleDismiss}
        disabled={_disabled}
        className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X className="w-4 h-4" />
        <span>Descartar</span>
      </button>
    </div>
  )
}