/**
 * Optimized Updates Hook
 * Debounce and throttle for frequent updates
 * By Cheva
 */

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { debounce, throttle } from 'lodash-es';

interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

interface UseThrottleOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceOptions = {}
): T {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const callbackRef = useRef(callback);
  
  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Create debounced function
  const debouncedFn = useMemo(
    () => debounce(
      (...args: Parameters<T>) => callbackRef.current(...args),
      delay,
      { leading, trailing, maxWait }
    ),
    [delay, leading, trailing, maxWait]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn as T;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseThrottleOptions = {}
): T {
  const {
    delay = 100,
    leading = true,
    trailing = true
  } = options;

  const callbackRef = useRef(callback);
  
  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Create throttled function
  const throttledFn = useMemo(
    () => throttle(
      (...args: Parameters<T>) => callbackRef.current(...args),
      delay,
      { leading, trailing }
    ),
    [delay, leading, trailing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      throttledFn.cancel();
    };
  }, [throttledFn]);

  return throttledFn as T;
}

// Debounced value hook
export function useDebouncedValue<T>(
  value: T,
  delay: number = 300
): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled value hook
export function useThrottledValue<T>(
  value: T,
  delay: number = 100
): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, delay - (Date.now() - lastRun.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

// Combined hook for optimized state updates
export function useOptimizedState<T>(
  initialValue: T,
  options: {
    debounceDelay?: number;
    throttleDelay?: number;
    mode?: 'debounce' | 'throttle';
  } = {}
) {
  const {
    debounceDelay = 300,
    throttleDelay = 100,
    mode = 'debounce'
  } = options;

  const [value, setValue] = React.useState(initialValue);
  const [optimizedValue, setOptimizedValue] = React.useState(initialValue);

  // Create optimized setter
  const optimizedSetter = mode === 'debounce'
    ? useDebouncedCallback((newValue: T) => {
        setOptimizedValue(newValue);
      }, { delay: debounceDelay })
    : useThrottledCallback((newValue: T) => {
        setOptimizedValue(newValue);
      }, { delay: throttleDelay });

  // Update optimized value when value changes
  useEffect(() => {
    optimizedSetter(value);
  }, [value, optimizedSetter]);

  return [value, setValue, optimizedValue] as const;
}

// Batched updates hook
export function useBatchedUpdates<T>(
  updateFn: (updates: T[]) => void,
  options: {
    maxBatchSize?: number;
    flushDelay?: number;
  } = {}
) {
  const {
    maxBatchSize = 100,
    flushDelay = 50
  } = options;

  const batchRef = useRef<T[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const flush = useCallback(() => {
    if (batchRef.current.length > 0) {
      updateFn([...batchRef.current]);
      batchRef.current = [];
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [updateFn]);

  const addUpdate = useCallback((update: T) => {
    batchRef.current.push(update);

    // Flush if batch is full
    if (batchRef.current.length >= maxBatchSize) {
      flush();
      return;
    }

    // Schedule flush
    if (!timerRef.current) {
      timerRef.current = setTimeout(flush, flushDelay);
    }
  }, [flush, maxBatchSize, flushDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      flush();
    };
  }, [flush]);

  return {
    addUpdate,
    flush,
    batchSize: batchRef.current.length
  };
}

// Request animation frame hook
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  enabled: boolean = true
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled]);
}