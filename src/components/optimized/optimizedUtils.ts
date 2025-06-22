/**
 * Optimization utilities for React components
 * By Cheva
 */

import React, { memo, useMemo } from 'react';

// Factory for creating optimized components
export function createOptimizedComponent<P extends object>(Component: React.ComponentType<P>, compareProps?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, compareProps);
}

// Hook for optimizing render
export function useOptimizedRender<T>(
  data: T,
  dependencies: React.DependencyList = []
): T {
  return 
   

  useMemo(() => data, dependencies);
}

// Utility for component comparison
export const shallowCompare = <P extends object>(prevProps: P, nextProps: P): boolean => {
  const keys1 = Object.keys(prevProps) as (keyof P)[];
  const keys2 = Object.keys(nextProps) as (keyof P)[];
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  
  return true;
};

// Performance measurement utilities
export const measureRenderTime = <T extends any[]>(fn: (...args: T) => any,
  label = 'Render'
) => {
  return (...args: T) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  };
};

// Higher order component for optimization
export function withOptimization<P extends object>(Component: React.ComponentType<P>, options: {
    compareProps?: (prevProps: P, nextProps: P) => boolean;
    debounceProps?: Array<keyof P>;
    throttleProps?: Array<keyof P>;
  } = {}
): React.ComponentType<P> {
  const OptimizedComponent = memo(Component, options.compareProps);

  return (props: P) => {
    // Apply debounce/throttle to specific props if needed
    const optimizedProps = { ...props };

    if (options.debounceProps) {
      // Implementation would use useDebouncedValue for specified props
    }

    if (options.throttleProps) {
      // Implementation would use useThrottledValue for specified props
    }

    return React.createElement(OptimizedComponent, optimizedProps);
  };
}