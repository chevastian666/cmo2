import { useState, useCallback, useRef, useEffect } from 'react';
import type { Alert } from '../types/alerts';

interface UseInfiniteLoadingProps {
  loadMore: (page: number) => Promise<{
    alerts: Alert[];
    hasMore: boolean;
    total?: number;
  }>;
  threshold?: number; // Distance from bottom to trigger load
  retryDelay?: number; // Delay between retries
  maxRetries?: number;
}

interface InfiniteLoadingState {
  items: Alert[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  page: number;
  total?: number;
  retryCount: number;
}

export function useInfiniteLoading({
  loadMore,
  threshold = 500,
  retryDelay = 1000,
  maxRetries = 3
}: UseInfiniteLoadingProps) {
  const [state, setState] = useState<InfiniteLoadingState>({
    items: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    error: null,
    page: 0,
    total: undefined,
    retryCount: 0
  });

  const loadingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Load initial data
  useEffect(() => {
    mountedRef.current = true;
    loadInitialData();
    
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await loadMore(0);
      
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        items: result.alerts,
        hasMore: result.hasMore,
        total: result.total,
        page: 1,
        isLoading: false,
        error: null,
        retryCount: 0
      }));
    } catch (error) {
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }));
      
      // Auto-retry with exponential backoff
      if (state.retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, state.retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
          loadInitialData();
        }, delay);
      }
    } finally {
      loadingRef.current = false;
    }
  }, [loadMore, retryDelay, maxRetries, state.retryCount]);

  // Load more data
  const loadMoreData = useCallback(async () => {
    if (loadingRef.current || !state.hasMore || state.isLoadingMore) return;
    
    loadingRef.current = true;
    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const result = await loadMore(state.page);
      
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...result.alerts],
        hasMore: result.hasMore,
        total: result.total || prev.total,
        page: prev.page + 1,
        isLoadingMore: false,
        error: null,
        retryCount: 0
      }));
    } catch (error) {
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        isLoadingMore: false,
        error: error as Error
      }));
      
      // Auto-retry for load more
      if (state.retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, state.retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
          loadMoreData();
        }, delay);
      }
    } finally {
      loadingRef.current = false;
    }
  }, [loadMore, state.hasMore, state.isLoadingMore, state.page, state.retryCount, retryDelay, maxRetries]);

  // Check if should load more based on scroll position
  const checkLoadMore = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom < threshold && state.hasMore && !state.isLoadingMore && !state.error) {
      loadMoreData();
    }
  }, [threshold, state.hasMore, state.isLoadingMore, state.error, loadMoreData]);

  // Retry failed load
  const retry = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0, error: null }));
    if (state.items.length === 0) {
      loadInitialData();
    } else {
      loadMoreData();
    }
  }, [state.items.length, loadInitialData, loadMoreData]);

  // Reset and reload
  const reset = useCallback(() => {
    setState({
      items: [],
      isLoading: true,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      page: 0,
      total: undefined,
      retryCount: 0
    });
    loadInitialData();
  }, [loadInitialData]);

  // Insert new items at the beginning (for real-time updates)
  const prependItems = useCallback((newItems: Alert[]) => {
    setState(prev => ({
      ...prev,
      items: [...newItems, ...prev.items],
      total: prev.total ? prev.total + newItems.length : undefined
    }));
  }, []);

  // Update existing item
  const updateItem = useCallback((id: string, updates: Partial<Alert>) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  }, []);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      total: prev.total ? prev.total - 1 : undefined
    }));
  }, []);

  return {
    items: state.items,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.hasMore,
    error: state.error,
    total: state.total,
    loadMoreData,
    checkLoadMore,
    retry,
    reset,
    prependItems,
    updateItem,
    removeItem
  };
}

/**
 * Hook for subscribing to real-time alert updates
 */
export function useAlertSubscription(
  onNewAlert: (alert: Alert) => void,
  onUpdateAlert: (id: string, updates: Partial<Alert>) => void,
  onRemoveAlert: (id: string) => void
) {
  useEffect(() => {
    // Subscribe to WebSocket or SSE for real-time updates
    const unsubscribe = subscribeToAlertUpdates({
      onNew: onNewAlert,
      onUpdate: onUpdateAlert,
      onRemove: onRemoveAlert
    });

    return unsubscribe;
  }, [onNewAlert, onUpdateAlert, onRemoveAlert]);
}

// Mock subscription function - replace with actual implementation
function subscribeToAlertUpdates(handlers: {
  onNew: (alert: Alert) => void;
  onUpdate: (id: string, updates: Partial<Alert>) => void;
  onRemove: (id: string) => void;
}): () => void {
  // Mock implementation
  const interval = setInterval(() => {
    // Simulate random updates
    if (Math.random() > 0.7) {
      const mockAlert: Alert = {
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as Alert['severity'],
        precintoId: `PRECINTO-${Math.floor(Math.random() * 1000)}`,
        vehicleId: Math.random() > 0.5 ? `VEHICLE-${Math.floor(Math.random() * 100)}` : undefined,
        location: {
          lat: -34.6037 + (Math.random() - 0.5) * 0.1,
          lng: -58.3816 + (Math.random() - 0.5) * 0.1,
          address: 'Buenos Aires, Argentina'
        },
        message: 'Nueva alerta de prueba',
        status: 'active',
        assignedTo: undefined
      };
      handlers.onNew(mockAlert);
    }
  }, 5000);

  return () => clearInterval(interval);
}