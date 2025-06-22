import React, { useEffect, useState } from 'react'
import { PriorityProvider, usePriority } from './PriorityProvider'
export function withPriority<P extends object>(Component: React.ComponentType<P>) {
  return (props: P) => {
    const { priority, isActive, schedulePriorityUpdate, cancelUpdate } = usePriority()
    const [isPriorityActive, setIsPriorityActive] = useState(false)
    useEffect(() => {
      if (isActive) {
        setIsPriorityActive(true)
        const timer = setTimeout(() => {
          setIsPriorityActive(false)
        }, 5000)
        return () => {
          clearTimeout(timer)
        }
      }
    }, [])
    const enhancedProps = {
      ...props,
      priority,
      isPriorityActive,
      schedulePriorityUpdate,
      cancelUpdate
    }
    return (
      <PriorityProvider>
        <Component {...enhancedProps} />
      </PriorityProvider>
    )
  }
}