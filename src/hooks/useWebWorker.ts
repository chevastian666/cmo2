/**
 * Web Worker Hook
 * Easy integration with Web Workers using Comlink
 * By Cheva
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Comlink from 'comlink';

interface UseWebWorkerOptions {
  terminateOnUnmount?: boolean;
  fallbackToMainThread?: boolean;
  onError?: (error: Error) => void;
}

export function useWebWorker<T>(
  workerPath: string,
  options: UseWebWorkerOptions = {}
) {
  const {
    terminateOnUnmount = true,
    fallbackToMainThread = true,
    onError
  } = options;

  const workerRef = useRef<Worker | null>(null);
  const proxyRef = useRef<T | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initWorker = async () => {
      try {
        // Create worker
        const worker = new Worker(
          new URL(workerPath, import.meta.url),
          { type: 'module' }
        );

        // Handle worker errors
        worker.onerror = (event) => {
          const error = new Error(`Worker error: ${event.message}`);
          setError(error);
          if (onError) onError(error);
          
          if (fallbackToMainThread) {
            console.warn('Worker failed, falling back to main thread');
          }
        };

        // Create Comlink proxy
        const proxy = Comlink.wrap<T>(worker);

        if (mounted) {
          workerRef.current = worker;
          proxyRef.current = proxy;
          setIsReady(true);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        if (onError) onError(error);
        
        if (fallbackToMainThread) {
          console.warn('Failed to create worker, falling back to main thread');
          setIsReady(true);
        }
      }
    };

    initWorker();

    return () => {
      mounted = false;
      
      if (terminateOnUnmount && workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        proxyRef.current = null;
      }
    };
  }, [workerPath, terminateOnUnmount, fallbackToMainThread, onError]);

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      proxyRef.current = null;
      setIsReady(false);
    }
  }, []);

  const restart = useCallback(() => {
    terminate();
    // Re-trigger effect
    setError(null);
  }, [terminate]);

  return {
    proxy: proxyRef.current,
    isReady,
    error,
    terminate,
    restart
  };
}

// Specific hook for data processor worker
export function useDataProcessor() {
  const { proxy, isReady, error } = useWebWorker<
    import('../workers/dataProcessor.worker').DataProcessor
  >('../workers/dataProcessor.worker.ts');

  const processLargeDataset = useCallback(async <T extends Record<string, any>>(
    data: T[],
    options?: Parameters<typeof proxy.processLargeDataset>[1]
  ) => {
    if (!proxy) {
      throw new Error('Data processor not ready');
    }
    return proxy.processLargeDataset(data, options || {});
  }, [proxy]);

  const calculateStatistics = useCallback(async (values: number[]) => {
    if (!proxy) {
      throw new Error('Data processor not ready');
    }
    return proxy.calculateStatistics(values);
  }, [proxy]);

  const aggregateTimeSeries = useCallback(async (
    data: Parameters<typeof proxy.aggregateTimeSeries>[0],
    interval: Parameters<typeof proxy.aggregateTimeSeries>[1],
    aggregationType?: Parameters<typeof proxy.aggregateTimeSeries>[2]
  ) => {
    if (!proxy) {
      throw new Error('Data processor not ready');
    }
    return proxy.aggregateTimeSeries(data, interval, aggregationType);
  }, [proxy]);

  const detectAnomalies = useCallback(async (
    values: number[],
    threshold?: number
  ) => {
    if (!proxy) {
      throw new Error('Data processor not ready');
    }
    return proxy.detectAnomalies(values, threshold);
  }, [proxy]);

  return {
    isReady,
    error,
    processLargeDataset,
    calculateStatistics,
    aggregateTimeSeries,
    detectAnomalies
  };
}