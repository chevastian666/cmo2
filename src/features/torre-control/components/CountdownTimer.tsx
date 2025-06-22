import React, { useState, useEffect } from 'react'
import { cn} from '../../../utils/utils'
interface CountdownTimerProps {
  targetTime: Date
  className?: string
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime, className }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isOverdue, setIsOverdue] = useState(_false)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetTime.getTime()
      const difference = target - now
      if (difference < 0) {
        setIsOverdue(_true)
        const overdueDiff = Math.abs(_difference)
        const hours = Math.floor(overdueDiff / (1000 * 60 * 60))
        const minutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`-${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      } else {
        setIsOverdue(_false)
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      }
    }
    calculateTimeLeft()
    const timer = setInterval(_calculateTimeLeft, 30000); // Update every 30 seconds

    return () => clearInterval(_timer)
  }, [])
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