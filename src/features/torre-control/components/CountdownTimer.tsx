import React, { useState, useEffect, useCallback } from 'react'
import { cn} from '../../../utils/utils'
interface CountdownTimerProps {
  targetTime: Date
  className?: string
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime, className }) => {
  const [_timeLeft, _setTimeLeft] = useState('')
  const [isOverdue, setIsOverdue] = useState(false)
  
  const calculateTimeLeft = useCallback(() => {
      const now = new Date().getTime()
      const target = targetTime.getTime()
      const difference = target - now
      if (difference < 0) {
        setIsOverdue(true)
        const overdueDiff = Math.abs(difference)
        const hours = Math.floor(overdueDiff / (1000 * 60 * 60))
        const minutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60))
        _setTimeLeft(`-${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      } else {
        setIsOverdue(false)
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        _setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      }
    }, [targetTime])
    
  useEffect(() => {
    calculateTimeLeft()
    const _timer = setInterval(calculateTimeLeft, 30000); // Update every 30 seconds

    return () => clearInterval(_timer)
  }, [calculateTimeLeft])
  return (
    <span className={cn(
      "font-mono text-lg tracking-wider",
      isOverdue ? "text-red-400" : "text-green-400",
      className
    )}>
      {_timeLeft}
    </span>
  )
}