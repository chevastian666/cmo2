import { useDeferredValue, useEffect, useRef, useState } from 'react'

interface UseDeferredDataOptions {
  timeoutMs?: number
  enableDeferral?: boolean
}

/**
 * Hook that combines useDeferredValue with stale data detection
 * and optional timeout for showing loading states
 */
export function useDeferredData<T>(
  data: T,
  options: UseDeferredDataOptions = {}
): {
  deferredData: T
  isStale: boolean
  isPending: boolean
  shouldShowLoading: boolean
} {
  const { timeoutMs = 300, enableDeferral = true } = options
  
  // Always call hooks unconditionally
  const deferredDataFromHook = useDeferredValue(data)
  const [showLoading, setShowLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  // Use the deferred value only if deferral is enabled
  const deferredData = enableDeferral ? deferredDataFromHook : data
  const isStale = enableDeferral && data !== deferredData
  const isPending = isStale
  
  useEffect(() => {
    if (isPending) {
      // Show loading after timeout to avoid flashing for quick updates
      timeoutRef.current = setTimeout(() => {
        setShowLoading(true)
      }, timeoutMs)
    } else {
      // Clear timeout and hide loading
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setShowLoading(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isPending, timeoutMs])
  
  return {
    deferredData,
    isStale,
    isPending,
    shouldShowLoading: showLoading
  }
}