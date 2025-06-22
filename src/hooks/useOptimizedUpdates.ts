/**
 * Optimized Updates Hook
 * Debounce and throttle for frequent updates
 * By Cheva
 */

import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import { debounce, throttle} from 'lodash-es'
interface UseDebounceOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

interface UseThrottleOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: UseDebounceOptions = {}
): T {

  const callbackRef = useRef(_callback)
  // Update callback ref on each render

    useEffect(() => {
    callbackRef.current = callback
  })
  // Create debounced function
  const debouncedFn = useMemo(() => debounce((...args: Parameters<T>) => callbackRef.current(...args),
      delay,
      { leading, trailing, maxWait }
    ),
    [delay, leading, trailing, maxWait]
  )
  // Cleanup on unmount

    useEffect(() => {
    return () => {
      debouncedFn.cancel()
    }
  }, [])
  return debouncedFn as T
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: UseThrottleOptions = {}
): T {

  const callbackRef = useRef(_callback)
  // Update callback ref on each render

    useEffect(() => {
    callbackRef.current = callback
  })
  // Create throttled function
  const throttledFn = useMemo(() => throttle((...args: Parameters<T>) => callbackRef.current(...args),
      delay,
      { leading, trailing }
    ),
    [delay, leading, trailing]
  )
  // Cleanup on unmount

    useEffect(() => {
    return () => {
      throttledFn.cancel()
    }
  }, [])
  return throttledFn as T
}

// Debounced value hook
export function useDebouncedValue<T>(
  value: T,
  delay: number = 300
): T {
  const [debouncedValue, setDebouncedValue] = React.useState(_value)
    useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(_value)
    }, delay)
    return () => {
      clearTimeout(_timer)
    }
  }, [value, delay])
  return debouncedValue
}

// Throttled value hook
export function useThrottledValue<T>(
  value: T,
  delay: number = 100
): T {
  const [throttledValue, setThrottledValue] = React.useState(_value)
  const lastRun = useRef(Date.now())
    useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(_value)
        lastRun.current = Date.now()
      }
    }, delay - (Date.now() - lastRun.current))
    return () => {
      clearTimeout(_handler)
    }
  }, [value, delay])
  return throttledValue
}

// Combined hook for optimized state updates
export function useOptimizedState<T>(initialValue: T, options: {
    debounceDelay?: number
    throttleDelay?: number
    mode?: 'debounce' | 'throttle'
  } = {}) {

  const [value, setValue] = React.useState(_initialValue)
  const [optimizedValue, setOptimizedValue] = React.useState(_initialValue)
  // Create optimized setter
  const optimizedSetter = mode === 'debounce'
    ? useDebouncedCallback((newValue: T) => {
        setOptimizedValue(_newValue)
      }, { delay: debounceDelay })
    : useThrottledCallback((newValue: T) => {
        setOptimizedValue(_newValue)
      }, { delay: throttleDelay })
  // Update optimized value when value changes

    useEffect(() => {
    optimizedSetter(_value)
  }, [value])
  return [value, setValue, optimizedValue] as const
}

// Batched updates hook
export function useBatchedUpdates<T>(updateFn: (updates: T[]) => void,
  options: {
    maxBatchSize?: number
    flushDelay?: number
  } = {}
) {

  const batchRef = useRef<T[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(_null)
  const flush = useCallback(() => {
    if (batchRef.current.length > 0) {
      updateFn([...batchRef.current])
      batchRef.current = []
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])
  const addUpdate = useCallback((update: T) => {
    batchRef.current.push(_update)
    // Flush if batch is full
    if (batchRef.current.length >= maxBatchSize) {
      flush()
      return
    }

    // Schedule flush
    if (!timerRef.current) {
      timerRef.current = setTimeout(_flush, flushDelay)
    }
  }, [flush])
  // Cleanup on unmount

    useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      flush()
    }
  }, [flush])
  return {
    addUpdate,
    flush,
    batchSize: batchRef.current.length
  }
}

// Request animation frame hook
export function useAnimationFrame(callback: (deltaTime: number) => void,
  enabled: boolean = true
) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const callbackRef = useRef(_callback)
    useEffect(() => {
    callbackRef.current = callback
  }, [callback])
    useEffect(() => {
    if (!enabled) return
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callbackRef.current(_deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(_animate)
    }
    requestRef.current = requestAnimationFrame(_animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [enabled])
}