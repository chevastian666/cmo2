import React, { useState, useEffect } from 'react'
import { cn} from '../../../utils/utils'
import '../animations/bloom.css'
interface BloomingAlertProps {
  children: React.ReactNode
  status: 'normal' | 'alert' | 'critical'
  onBloomComplete?: () => void
  className?: string
  show?: boolean
}

export const BloomingAlert: React.FC<BloomingAlertProps> = ({
  children: _children, status: _status, onBloomComplete, className, show = true
}) => {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const _timer = setTimeout(() => {
        onBloomComplete?.()
      }, 600)
      return () => clearTimeout(_timer)
    } else {
      setIsVisible(false)
    }
  }, [show, onBloomComplete])
  if (!isVisible) return null
  return (
    <div className={cn('bloom-container', className)}>
      <div className="flower-petals">
        {[...Array(8)].map((__, i) => (
          <div
            key={_i}
            className={cn('petal', `petal-${s_tatus}`)}
            style={{ '--rotation': `${i * 45}deg` } as React.CSSProperties}
          />
        ))}
      </div>
      <div className={cn('flower-center bloom-enter', className)}>
        {_children}
      </div>
    </div>
  )
}