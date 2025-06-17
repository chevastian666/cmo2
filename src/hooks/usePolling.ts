import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  immediateFirstCall?: boolean;
}

/**
 * Hook para realizar polling de datos con actualización automática
 * @param callback Función a ejecutar en cada intervalo
 * @param options Opciones de configuración del polling
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const {
    interval = 45000, // 45 segundos por defecto
    enabled = true,
    onError,
    immediateFirstCall = true
  } = options;

  const savedCallback = useRef(callback);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar el callback guardado cuando cambie
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Función para ejecutar el callback con manejo de errores
  const executeCallback = useCallback(async () => {
    try {
      await savedCallback.current();
    } catch (error) {
      console.error('Error during polling:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Función para iniciar el polling
  const startPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(executeCallback, interval);
  }, [executeCallback, interval]);

  // Función para detener el polling
  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // Efecto principal para manejar el polling
  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    // Ejecutar inmediatamente si está configurado
    if (immediateFirstCall) {
      executeCallback();
    }

    // Iniciar el polling
    startPolling();

    // Cleanup
    return () => {
      stopPolling();
    };
  }, [enabled, immediateFirstCall, executeCallback, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    executeNow: executeCallback
  };
}

/**
 * Hook para detectar cambios en los datos y actualizar solo lo necesario
 */
export function useDataDiff<T extends { id: string }>(
  currentData: T[],
  newData: T[]
): {
  added: T[];
  updated: T[];
  removed: T[];
  hasChanges: boolean;
} {
  const currentMap = new Map(currentData.map(item => [item.id, item]));
  const newMap = new Map(newData.map(item => [item.id, item]));

  const added: T[] = [];
  const updated: T[] = [];
  const removed: T[] = [];

  // Detectar items agregados o actualizados
  newData.forEach(newItem => {
    const currentItem = currentMap.get(newItem.id);
    if (!currentItem) {
      added.push(newItem);
    } else if (JSON.stringify(currentItem) !== JSON.stringify(newItem)) {
      updated.push(newItem);
    }
  });

  // Detectar items eliminados
  currentData.forEach(currentItem => {
    if (!newMap.has(currentItem.id)) {
      removed.push(currentItem);
    }
  });

  return {
    added,
    updated,
    removed,
    hasChanges: added.length > 0 || updated.length > 0 || removed.length > 0
  };
}

/**
 * Hook para polling con detección de cambios
 */
export function usePollingWithDiff<T extends { id: string }>(
  fetchData: () => Promise<T[]>,
  currentData: T[],
  onDataChange: (data: T[]) => void,
  options: UsePollingOptions = {}
) {
  const fetchAndCompare = useCallback(async () => {
    try {
      const newData = await fetchData();
      const diff = useDataDiff(currentData, newData);

      if (diff.hasChanges) {
        onDataChange(newData);
        
        // Log de cambios para debugging
        if (diff.added.length > 0) {
          console.log(`[Polling] ${diff.added.length} nuevos items detectados`);
        }
        if (diff.updated.length > 0) {
          console.log(`[Polling] ${diff.updated.length} items actualizados`);
        }
        if (diff.removed.length > 0) {
          console.log(`[Polling] ${diff.removed.length} items eliminados`);
        }
      }
    } catch (error) {
      console.error('Error fetching data during polling:', error);
      options.onError?.(error as Error);
    }
  }, [fetchData, currentData, onDataChange, options]);

  return usePolling(fetchAndCompare, options);
}

/**
 * Hook para manejar reconexión automática en caso de pérdida de conexión
 */
export function useAutoReconnect(
  onReconnect: () => void,
  checkInterval = 5000
) {
  const isOnlineRef = useRef(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      if (!isOnlineRef.current) {
        console.log('Conexión restaurada, reiniciando polling...');
        isOnlineRef.current = true;
        onReconnect();
      }
    };

    const handleOffline = () => {
      console.log('Conexión perdida, pausando polling...');
      isOnlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check periódico de conectividad
    const intervalId = setInterval(() => {
      const wasOnline = isOnlineRef.current;
      const isOnline = navigator.onLine;

      if (!wasOnline && isOnline) {
        handleOnline();
      } else if (wasOnline && !isOnline) {
        handleOffline();
      }
    }, checkInterval);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [onReconnect, checkInterval]);

  return {
    isOnline: navigator.onLine
  };
}