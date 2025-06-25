import { useMemo } from 'react';

export interface OptimizationOptions {
  sortBy?: string;
  filterBy?: {
    key: string;
    value: unknown;
  };
  limit?: number;
  dependencies?: React.DependencyList;
}

export function useOptimizedData<T>(data: T[], options?: OptimizationOptions): T[] {
  return useMemo(() => {
    let result = [...data];
    
    if (options?.sortBy) {
      result = result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[options.sortBy!];
        const bVal = (b as Record<string, unknown>)[options.sortBy!];
        return String(aVal) > String(bVal) ? 1 : -1;
      });
    }
    
    if (options?.filterBy) {
      result = result.filter(item => 
        (item as Record<string, unknown>)[options.filterBy!.key] === options.filterBy!.value
      );
    }
    
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    
    return result;
  }, [data, options?.sortBy, options?.filterBy, options?.limit]);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let _timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (_timeout) clearTimeout(_timeout);
    _timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Additional exports for compatibility
export const createOptimizedComponent = () => {
  console.warn('createOptimizedComponent is deprecated')
  return null
}

export const useOptimizedRender = () => {
  console.warn('useOptimizedRender is deprecated')
  return null
}

export const withOptimization = () => {
  console.warn('withOptimization is deprecated')
  return null
}
