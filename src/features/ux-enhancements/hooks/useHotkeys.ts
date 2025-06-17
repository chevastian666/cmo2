import { useEffect, useRef } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;

export function useHotkeys(
  keys: string,
  callback: HotkeyCallback,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef<HotkeyCallback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Parse the hotkey string (e.g., "cmd+k", "ctrl+shift+s")
      const parts = keys.toLowerCase().split('+');
      const key = parts[parts.length - 1];
      const modifiers = parts.slice(0, -1);

      // Check if the key matches
      if (event.key.toLowerCase() !== key) return;

      // Check modifiers
      const hasCmd = modifiers.includes('cmd') || modifiers.includes('meta');
      const hasCtrl = modifiers.includes('ctrl');
      const hasShift = modifiers.includes('shift');
      const hasAlt = modifiers.includes('alt');

      const isCmdPressed = event.metaKey || event.ctrlKey;
      const isCtrlPressed = event.ctrlKey;
      const isShiftPressed = event.shiftKey;
      const isAltPressed = event.altKey;

      // Platform-specific handling
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      
      if (hasCmd && !isCmdPressed) return;
      if (hasCtrl && !isCtrlPressed && !isMac) return;
      if (hasShift && !isShiftPressed) return;
      if (hasAlt && !isAltPressed) return;

      // Prevent default behavior
      event.preventDefault();
      
      // Call the callback
      callbackRef.current(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keys, ...deps]);
}