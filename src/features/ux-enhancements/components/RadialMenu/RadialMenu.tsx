import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn } from '../../../../utils/utils';
import type { RadialMenuProps, RadialMenuAction } from '../../types';
import { useRadialMenuStore } from '../../stores/radialMenuStore';
import { useHotkeys } from '../../hooks/useHotkeys';

const RADIUS = {
  small: 80,
  medium: 120,
  large: 160
};

const ANIMATION_PRESETS = {
  smooth: {
    type: 'spring',
    stiffness: 260,
    damping: 20
  },
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 15
  },
  stiff: {
    type: 'spring',
    stiffness: 400,
    damping: 25
  }
};

export const RadialMenu: React.FC<RadialMenuProps> = ({
  actions,
  position,
  isOpen,
  onClose,
  customizable = true,
  gestureEnabled = true,
  context,
  size = 'medium',
  animationPreset = 'smooth'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();
  const { settings, updateSettings, canUseAction } = useRadialMenuStore();

  // Filter actions based on permissions
  const availableActions = actions.filter(action => 
    canUseAction(action.permissions || [])
  );

  // Sort actions based on user preferences
  const sortedActions = customizable && settings.customOrder
    ? availableActions.sort((a, b) => {
        const orderA = settings.customOrder!.indexOf(a.id);
        const orderB = settings.customOrder!.indexOf(b.id);
        if (orderA === -1) return 1;
        if (orderB === -1) return -1;
        return orderA - orderB;
      })
    : availableActions;

  const radius = RADIUS[size];
  const angleStep = (2 * Math.PI) / sortedActions.length;

  // Calculate action positions
  const getActionPosition = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle through actions
        const currentIndex = selectedAction 
          ? sortedActions.findIndex(a => a.id === selectedAction)
          : -1;
        const nextIndex = (currentIndex + 1) % sortedActions.length;
        setSelectedAction(sortedActions[nextIndex].id);
      } else if (e.key === 'Enter' && selectedAction) {
        const action = sortedActions.find(a => a.id === selectedAction);
        if (action && !action.disabled) {
          handleActionClick(action);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedAction, sortedActions, onClose]);

  // Register hotkeys for actions
  sortedActions.forEach(action => {
    if (action.shortcut) {
      useHotkeys(action.shortcut, () => {
        if (isOpen && !action.disabled) {
          handleActionClick(action);
        }
      }, [isOpen]);
    }
  });

  const handleActionClick = useCallback((action: RadialMenuAction) => {
    // Haptic feedback on mobile
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Execute action with context
    action.action(context);

    // Track usage for customization
    if (customizable) {
      const usageStats = JSON.parse(localStorage.getItem('radialMenuUsage') || '{}');
      usageStats[action.id] = (usageStats[action.id] || 0) + 1;
      localStorage.setItem('radialMenuUsage', JSON.stringify(usageStats));
    }

    onClose();
  }, [context, onClose, settings.hapticFeedback, customizable]);

  // Gesture support for touch devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!gestureEnabled) return;
    setIsDragging(true);
  }, [gestureEnabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent, action: RadialMenuAction) => {
    if (!isDragging || !gestureEnabled) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element?.getAttribute('data-action-id') === action.id) {
      setSelectedAction(action.id);
    }
  }, [isDragging, gestureEnabled]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !gestureEnabled) return;
    
    setIsDragging(false);
    if (selectedAction) {
      const action = sortedActions.find(a => a.id === selectedAction);
      if (action && !action.disabled) {
        handleActionClick(action);
      }
    }
  }, [isDragging, gestureEnabled, selectedAction, sortedActions, handleActionClick]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="fixed z-50"
          style={{ left: position.x, top: position.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={ANIMATION_PRESETS[animationPreset]}
        >
          {/* Center button */}
          <motion.div
            className="absolute w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer border-2 border-gray-700 shadow-lg"
            style={{ transform: 'translate(-50%, -50%)' }}
            whileHover={{ scale: 1.1 }}
            onClick={onClose}
          >
            <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </motion.div>

          {/* Action buttons */}
          {sortedActions.map((action, index) => {
            const { x, y } = getActionPosition(index);
            const isSelected = selectedAction === action.id;
            const isFavorite = settings.favoriteActions.includes(action.id);

            return (
              <motion.div
                key={action.id}
                data-action-id={action.id}
                className="absolute"
                style={{ transform: 'translate(-50%, -50%)' }}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{ 
                  x, 
                  y, 
                  scale: 1,
                  rotate: isSelected ? 360 : 0
                }}
                exit={{ x: 0, y: 0, scale: 0 }}
                transition={{
                  ...ANIMATION_PRESETS[animationPreset],
                  delay: index * 0.02
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => handleTouchMove(e, action)}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  className={cn(
                    'relative group w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200',
                    action.disabled 
                      ? 'bg-gray-800 cursor-not-allowed opacity-50'
                      : action.color || 'bg-gray-700 hover:bg-gray-600',
                    isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900',
                    isFavorite && 'border-2 border-yellow-500'
                  )}
                  onClick={() => !action.disabled && handleActionClick(action)}
                  onMouseEnter={() => setSelectedAction(action.id)}
                  onMouseLeave={() => setSelectedAction(null)}
                  disabled={action.disabled}
                >
                  <action.icon className="w-6 h-6 text-white" />
                  
                  {/* Badge */}
                  {action.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {action.badge}
                    </span>
                  )}

                  {/* Tooltip */}
                  <div className={cn(
                    'absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 pointer-events-none transition-opacity duration-200',
                    isSelected ? 'opacity-100' : 'opacity-0'
                  )}>
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      <div className="font-medium">{action.label}</div>
                      {action.shortcut && (
                        <div className="text-xs text-gray-400 mt-1">
                          Shortcut: {action.shortcut}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};