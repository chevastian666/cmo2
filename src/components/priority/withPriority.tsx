import React, { useEffect, useState } from 'react';
import { PriorityProvider, usePriority } from './PriorityProvider';

export function withPriority<P extends object>(Component: React.ComponentType<P>) {
  return (props: P) => {
    const { priority, isActive, schedulePriorityUpdate, cancelUpdate } = usePriority();
    const [isPriorityActive, setIsPriorityActive] = useState(_false);

    useEffect(() => {
      if (_isActive) {
        setIsPriorityActive(_true);
        const timer = setTimeout(() => {
          setIsPriorityActive(_false);
        }, 5000);

        return () => {
          clearTimeout(timer);
        };
      }
    }, [isActive]);

    const enhancedProps = {
      ...props,
      priority,
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