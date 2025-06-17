import { useMemo, useCallback, useState, useRef } from 'react';
import type { Alert, AlertFilters } from '../types/alerts';

interface UseAlertFilteringProps {
  alerts: Alert[];
  initialFilters?: AlertFilters;
  debounceMs?: number;
}

interface FilterResult {
  filteredAlerts: Alert[];
  filters: AlertFilters;
  updateFilters: (filters: Partial<AlertFilters>) => void;
  resetFilters: () => void;
  filterCount: number;
  isFiltering: boolean;
  highlightedIndices: Set<number>;
}

export function useAlertFiltering({
  alerts,
  initialFilters = {},
  debounceMs = 100
}: UseAlertFilteringProps): FilterResult {
  const [filters, setFilters] = useState<AlertFilters>(initialFilters);
  const [isFiltering, setIsFiltering] = useState(false);
  const filterTimeout = useRef<NodeJS.Timeout>();

  // Create search index for performance
  const searchIndex = useMemo(() => {
    const index = new Map<string, Set<number>>();
    
    alerts.forEach((alert, i) => {
      // Index by message words
      const words = alert.message.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (!index.has(word)) index.set(word, new Set());
        index.get(word)!.add(i);
      });
      
      // Index by precinto ID
      const precintoWords = alert.precintoId.toLowerCase().split(/[\s-_]+/);
      precintoWords.forEach(word => {
        if (!index.has(word)) index.set(word, new Set());
        index.get(word)!.add(i);
      });
      
      // Index by vehicle ID
      if (alert.vehicleId) {
        const vehicleWords = alert.vehicleId.toLowerCase().split(/[\s-_]+/);
        vehicleWords.forEach(word => {
          if (!index.has(word)) index.set(word, new Set());
          index.get(word)!.add(i);
        });
      }
      
      // Index by location
      const locationWords = alert.location.address.toLowerCase().split(/\s+/);
      locationWords.forEach(word => {
        if (!index.has(word)) index.set(word, new Set());
        index.get(word)!.add(i);
      });
    });
    
    return index;
  }, [alerts]);

  // Filter alerts with optimized performance
  const { filteredAlerts, highlightedIndices } = useMemo(() => {
    const startTime = performance.now();
    
    let indices = new Set<number>(Array.from({ length: alerts.length }, (_, i) => i));
    const highlighted = new Set<number>();
    
    // Apply severity filter
    if (filters.severity && filters.severity.length > 0) {
      const severitySet = new Set(filters.severity);
      indices = new Set(
        Array.from(indices).filter(i => severitySet.has(alerts[i].severity))
      );
    }
    
    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      const statusSet = new Set(filters.status);
      indices = new Set(
        Array.from(indices).filter(i => statusSet.has(alerts[i].status))
      );
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      indices = new Set(
        Array.from(indices).filter(i => {
          const date = alerts[i].timestamp;
          return date >= start && date <= end;
        })
      );
    }
    
    // Apply search query filter using index
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const searchWords = query.split(/\s+/);
      const matchingIndices = new Set<number>();
      
      searchWords.forEach(word => {
        if (searchIndex.has(word)) {
          searchIndex.get(word)!.forEach(i => {
            if (indices.has(i)) {
              matchingIndices.add(i);
              highlighted.add(i);
            }
          });
        }
      });
      
      // Also check for partial matches
      Array.from(indices).forEach(i => {
        const alert = alerts[i];
        const searchText = `${alert.message} ${alert.precintoId} ${alert.vehicleId || ''} ${alert.location.address}`.toLowerCase();
        
        if (searchWords.every(word => searchText.includes(word))) {
          matchingIndices.add(i);
          highlighted.add(i);
        }
      });
      
      indices = matchingIndices;
    }
    
    // Apply location filter
    if (filters.location) {
      const { lat, lng, radius } = filters.location;
      indices = new Set(
        Array.from(indices).filter(i => {
          const alert = alerts[i];
          const distance = calculateDistance(
            lat, lng,
            alert.location.lat, alert.location.lng
          );
          return distance <= radius;
        })
      );
    }
    
    // Apply assignedTo filter
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      const assignedSet = new Set(filters.assignedTo);
      indices = new Set(
        Array.from(indices).filter(i => 
          alerts[i].assignedTo && assignedSet.has(alerts[i].assignedTo!)
        )
      );
    }
    
    // Apply precinto IDs filter
    if (filters.precintoIds && filters.precintoIds.length > 0) {
      const precintoSet = new Set(filters.precintoIds);
      indices = new Set(
        Array.from(indices).filter(i => precintoSet.has(alerts[i].precintoId))
      );
    }
    
    // Apply vehicle IDs filter
    if (filters.vehicleIds && filters.vehicleIds.length > 0) {
      const vehicleSet = new Set(filters.vehicleIds);
      indices = new Set(
        Array.from(indices).filter(i => 
          alerts[i].vehicleId && vehicleSet.has(alerts[i].vehicleId!)
        )
      );
    }
    
    const filtered = Array.from(indices)
      .sort((a, b) => b - a) // Most recent first
      .map(i => alerts[i]);
    
    const endTime = performance.now();
    console.log(`Filtering ${alerts.length} alerts took ${(endTime - startTime).toFixed(2)}ms`);
    
    return { filteredAlerts: filtered, highlightedIndices: highlighted };
  }, [alerts, filters, searchIndex]);

  // Update filters with debouncing
  const updateFilters = useCallback((newFilters: Partial<AlertFilters>) => {
    setIsFiltering(true);
    
    if (filterTimeout.current) {
      clearTimeout(filterTimeout.current);
    }
    
    filterTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, ...newFilters }));
      setIsFiltering(false);
    }, debounceMs);
  }, [debounceMs]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setIsFiltering(false);
  }, []);

  // Count active filters
  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.severity?.length) count++;
    if (filters.status?.length) count++;
    if (filters.dateRange) count++;
    if (filters.searchQuery?.trim()) count++;
    if (filters.location) count++;
    if (filters.assignedTo?.length) count++;
    if (filters.precintoIds?.length) count++;
    if (filters.vehicleIds?.length) count++;
    return count;
  }, [filters]);

  return {
    filteredAlerts,
    filters,
    updateFilters,
    resetFilters,
    filterCount,
    isFiltering,
    highlightedIndices
  };
}

// Helper function to calculate distance between coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}