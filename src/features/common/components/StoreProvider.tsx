import React, { useEffect } from 'react';
import { initializeStores, setupAutoRefresh } from '../../../store';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize stores and fetch initial data
    initializeStores();
    
    // Set up auto-refresh intervals
    const cleanupAutoRefresh = setupAutoRefresh();
    
    // Cleanup on unmount
    return () => {
      if (cleanupAutoRefresh) {
        cleanupAutoRefresh();
      }
    };
  }, []);

  return <>{children}</>;
};