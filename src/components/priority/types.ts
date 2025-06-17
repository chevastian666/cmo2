/**
 * Priority types and interfaces for React Concurrent Features
 */

export type RenderPriority = 'immediate' | 'high' | 'medium' | 'low' | 'idle';

export interface PriorityConfig {
  immediate: number;  // 1 - Highest priority (critical alerts)
  high: number;      // 2 - High priority (security violations)
  medium: number;    // 3 - Normal priority (state updates)
  low: number;       // 4 - Low priority (visualizations)
  idle: number;      // 5 - Idle priority (background tasks)
}

export interface PriorityTask {
  id: string;
  priority: RenderPriority;
  callback: () => void;
  timestamp: number;
  cancelled?: boolean;
}

export interface PriorityContextValue {
  schedulePriorityUpdate: (priority: RenderPriority, callback: () => void) => string;
  cancelUpdate: (taskId: string) => void;
  getCurrentPriority: () => RenderPriority;
  withPriority: <T>(priority: RenderPriority, callback: () => T) => T;
  isPending: (priority?: RenderPriority) => boolean;
}

export interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  priorityBreakdown: Record<RenderPriority, number>;
  droppedFrames: number;
  interactionLatency: number[];
}