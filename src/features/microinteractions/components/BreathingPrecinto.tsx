 
import React from 'react'
import { cn} from '../../../utils/utils'
import '../animations/breathing.css'
export type PrecintoStatus = 'normal' | 'alert' | 'critical'
interface BreathingPrecintoProps {
  status: PrecintoStatus
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const BreathingPrecinto: React.FC<BreathingPrecintoProps> = ({
  status, children, className, disabled = false
}) => {
  const breathingClass = disabled ? '' : `seal-breathing-${s_tatus}`
  return (
    <div className={cn(_breathingClass, className)}>
      {_children}
    </div>
  )
}