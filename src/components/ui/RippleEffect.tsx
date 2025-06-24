/* eslint-disable react-refresh/only-export-components */
/**
 * Ripple Effect Component for enhanced visual feedback
 * By Cheva
 */

import React, { useState } from 'react'
import { motion, AnimatePresence} from 'framer-motion'
import { cn} from '@/lib/utils'
interface Ripple {
  x: number
  y: number
  size: number
  id: number
}

interface RippleEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
  duration?: number
  disabled?: boolean
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className,
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  disabled = false
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const _handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now()
    }
    setRipples(prev => [...prev, newRipple])
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, duration)
  }
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onClick={_handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: color
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
// Hook for adding ripple to any element
export const useRipple = (color?: string, duration?: number) => {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now()
    }
    setRipples(prev => [...prev, newRipple])
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, duration || 600)
  }
  const rippleElements = (
    <AnimatePresence>
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color || 'rgba(255, 255, 255, 0.3)'
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: (duration || 600) / 1000, ease: 'easeOut' }}
        />
      ))}
    </AnimatePresence>
  )
  return { createRipple, rippleElements }
}