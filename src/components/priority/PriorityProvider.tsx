import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { unstable_scheduleCallback, unstable_cancelCallback, unstable_runWithPriority } from 'scheduler';
import type { RenderPriority, PriorityConfig, PriorityTask, PriorityContextValue } from './types';

// Map our priorities to React Scheduler priorities
const PRIORITY_MAP = {
  immediate: 1, // ImmediatePriority
  high: 2,      // UserBlockingPriority
  medium: 3,    // NormalPriority
  low: 4,       // LowPriority
  idle: 5       // IdlePriority
};

const PriorityContext = createContext<PriorityContextValue | null>(null);

interface PriorityProviderProps {
  children: React.ReactNode;
  config?: Partial<PriorityConfig>;
  enableMetrics?: boolean;
}

export const PriorityProvider: React.FC<PriorityProviderProps> = ({ 
  children, 
  config,
  enableMetrics = true 
}) => {
  const [currentPriority, setCurrentPriority] = useState<RenderPriority>('medium');
  const [pendingTasks, setPendingTasks] = useState<Map<RenderPriority, number>>(new Map());
  
  const tasksRef = useRef<Map<string, PriorityTask>>(new Map());
  const metricsRef = useRef({
    renderCount: 0,
    totalRenderTime: 0,
    priorityBreakdown: {
      immediate: 0,
      high: 0,
      medium: 0,
      low: 0,
      idle: 0
    },
    lastInteraction: Date.now()
  });

  // Schedule a priority update
  const schedulePriorityUpdate = useCallback((priority: RenderPriority, callback: () => void) => {
    const taskId = `task-${Date.now()}-${Math.random()}`;
    const task: PriorityTask = {
      id: taskId,
      priority,
      callback,
      timestamp: Date.now(),
      cancelled: false
    };

    tasksRef.current.set(taskId, task);
    
    // Update pending tasks count
    setPendingTasks(prev => {
      const newMap = new Map(prev);
      newMap.set(priority, (newMap.get(priority) || 0) + 1);
      return newMap;
    });

    // Schedule with React Scheduler
    const schedulerPriority = PRIORITY_MAP[priority];
    const schedulerTask = unstable_scheduleCallback(
      schedulerPriority,
      () => {
        if (!task.cancelled) {
          // Set current priority context
          setCurrentPriority(priority);
          
          // Track metrics
          if (enableMetrics) {
            const startTime = performance.now();
            metricsRef.current.renderCount++;
            metricsRef.current.priorityBreakdown[priority]++;
            
            try {
              callback();
            } finally {
              const endTime = performance.now();
              metricsRef.current.totalRenderTime += (endTime - startTime);
            }
          } else {
            callback();
          }
          
          // Clean up
          tasksRef.current.delete(taskId);
          setPendingTasks(prev => {
            const newMap = new Map(prev);
            const count = newMap.get(priority) || 0;
            if (count > 1) {
              newMap.set(priority, count - 1);
            } else {
              newMap.delete(priority);
            }
            return newMap;
          });
        }
      }
    );

    // Store scheduler task handle for cancellation
    task.schedulerTask = schedulerTask;
    
    return taskId;
  }, [enableMetrics]);

  // Cancel a scheduled update
  const cancelUpdate = useCallback((taskId: string) => {
    const task = tasksRef.current.get(taskId);
    if (task && !task.cancelled) {
      task.cancelled = true;
      if (task.schedulerTask) {
        unstable_cancelCallback(task.schedulerTask);
      }
      tasksRef.current.delete(taskId);
      
      // Update pending count
      setPendingTasks(prev => {
        const newMap = new Map(prev);
        const count = newMap.get(task.priority) || 0;
        if (count > 1) {
          newMap.set(task.priority, count - 1);
        } else {
          newMap.delete(task.priority);
        }
        return newMap;
      });
    }
  }, []);

  // Get current render priority
  const getCurrentPriority = useCallback(() => currentPriority, [currentPriority]);

  // Run callback with specific priority
  const withPriority = useCallback(<T,>(priority: RenderPriority, callback: () => T): T => {
    let result: T;
    unstable_runWithPriority(PRIORITY_MAP[priority], () => {
      result = callback();
    });
    return result!;
  }, []);

  // Check if there are pending tasks
  const isPending = useCallback((priority?: RenderPriority) => {
    if (priority) {
      return (pendingTasks.get(priority) || 0) > 0;
    }
    return pendingTasks.size > 0;
  }, [pendingTasks]);

  // Performance monitoring
  useEffect(() => {
    if (!enableMetrics) return;

    const interval = setInterval(() => {
      const metrics = metricsRef.current;
      const avgRenderTime = metrics.renderCount > 0 
        ? metrics.totalRenderTime / metrics.renderCount 
        : 0;

      console.log('[Priority Scheduler Metrics]', {
        totalRenders: metrics.renderCount,
        avgRenderTime: `${avgRenderTime.toFixed(2)}ms`,
        priorityBreakdown: metrics.priorityBreakdown,
        pendingTasks: Object.fromEntries(pendingTasks)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [enableMetrics, pendingTasks]);

  const value: PriorityContextValue = {
    schedulePriorityUpdate,
    cancelUpdate,
    getCurrentPriority,
    withPriority,
    isPending
  };

  return (
    <PriorityContext.Provider value={value}>
      {children}
    </PriorityContext.Provider>
  );
};

// Hook to use priority scheduling
export const usePriorityScheduler = () => {
  const context = useContext(PriorityContext);
  if (!context) {
    throw new Error('usePriorityScheduler must be used within PriorityProvider');
  }
  return context;
};