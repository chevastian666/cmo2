import React, { useEffect, useState } from 'react';
import { PriorityProvider, usePriority } from './PriorityProvider';

export function withPriority<P extends object>(Component: React.ComponentType<P>) {
  return (props: P) => {
    const { schedulePriorityUpdate, cancelUpdate, getCurrentPriority, isPending } = usePriority();
    const [isPriorityActive, setIsPriorityActive] = useState(false);

    useEffect(() => {
      const isActive = isPending();
      if (isActive) {
        setIsPriorityActive(true);
        const timer = setTimeout(() => {
          setIsPriorityActive(false);
        }, 5000);

        return () => {
          clearTimeout(timer);
        };
      }
    }, [isPending]);

    const enhancedProps = {
      ...props,
      priority: getCurrentPriority(),
      isPriorityActive,
      schedulePriorityUpdate,
      cancelUpdate
    };

    return (
      <PriorityProvider>
        <Component {...enhancedProps} />
      </PriorityProvider>
    );
  };
}