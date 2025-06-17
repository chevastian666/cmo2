import React, { ComponentType, useEffect, useRef } from 'react';
import { usePriorityScheduler } from './PriorityProvider';
import type { RenderPriority } from './types';

interface WithPriorityOptions {
  priority: RenderPriority;
  fallback?: React.ReactNode;
  suspense?: boolean;
}

/**
 * HOC to wrap components with priority scheduling
 */
export function withPriority<P extends object>(
  Component: ComponentType<P>,
  options: WithPriorityOptions
) {
  const { priority, fallback, suspense = true } = options;

  return React.forwardRef<any, P>((props, ref) => {
    const { schedulePriorityUpdate, cancelUpdate, isPending } = usePriorityScheduler();
    const [shouldRender, setShouldRender] = React.useState(priority === 'immediate');
    const taskIdRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
      isMountedRef.current = true;

      // Schedule render based on priority
      if (!shouldRender && priority !== 'immediate') {
        taskIdRef.current = schedulePriorityUpdate(priority, () => {
          if (isMountedRef.current) {
            setShouldRender(true);
          }
        });
      }

      return () => {
        isMountedRef.current = false;
        if (taskIdRef.current) {
          cancelUpdate(taskIdRef.current);
        }
      };
    }, [priority, schedulePriorityUpdate, cancelUpdate, shouldRender]);

    // Show fallback while pending
    if (!shouldRender && fallback) {
      return <>{fallback}</>;
    }

    // Don't render until scheduled
    if (!shouldRender) {
      return null;
    }

    return <Component {...props} ref={ref} />;
  });
}

/**
 * Component wrapper for priority scheduling
 */
interface PriorityBoundaryProps {
  priority: RenderPriority;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PriorityBoundary: React.FC<PriorityBoundaryProps> = ({
  priority,
  children,
  fallback
}) => {
  const { schedulePriorityUpdate, cancelUpdate } = usePriorityScheduler();
  const [canRender, setCanRender] = React.useState(priority === 'immediate');
  const taskIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!canRender && priority !== 'immediate') {
      taskIdRef.current = schedulePriorityUpdate(priority, () => {
        setCanRender(true);
      });
    }

    return () => {
      if (taskIdRef.current) {
        cancelUpdate(taskIdRef.current);
      }
    };
  }, [priority, canRender, schedulePriorityUpdate, cancelUpdate]);

  if (!canRender) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
};