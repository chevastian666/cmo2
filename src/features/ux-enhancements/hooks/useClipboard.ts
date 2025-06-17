import { useCallback, useEffect } from 'react';
import { useClipboardStore } from '../stores/clipboardStore';
import { detectClipboardContent, generateSmartPaste } from '../utils/clipboardDetector';
import type { ClipboardEntry } from '../types';

export function useClipboard() {
  const {
    history,
    isOpen,
    addEntry,
    setIsOpen,
    getFilteredHistory,
    setSyncStatus
  } = useClipboardStore();

  // Copy to clipboard with smart detection
  const copyToClipboard = useCallback(async (
    content: string,
    metadata?: Partial<ClipboardEntry['metadata']>
  ) => {
    try {
      await navigator.clipboard.writeText(content);
      
      // Detect content type
      const detection = detectClipboardContent(content);
      
      // Add to history
      addEntry({
        content,
        type: detection.type,
        metadata: {
          source: metadata?.source || 'manual',
          operatorId: metadata?.operatorId || 'system',
          context: metadata?.context,
          precintoId: detection.extractedData?.id || metadata?.precintoId,
          alertId: metadata?.alertId
        },
        tags: generateTags(content, detection.type),
        formatted: {
          form: generateSmartPaste(content, 'form'),
          search: generateSmartPaste(content, 'search'),
          report: generateSmartPaste(content, 'report'),
          message: generateSmartPaste(content, 'message')
        }
      });
      
      // Show notification
      showNotification('Copiado al portapapeles', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showNotification('Error al copiar', 'error');
    }
  }, [addEntry]);

  // Paste from clipboard with smart formatting
  const pasteFromClipboard = useCallback(async (
    targetContext: 'form' | 'search' | 'report' | 'message' = 'form'
  ): Promise<string> => {
    try {
      const content = await navigator.clipboard.readText();
      
      // Generate smart paste based on context
      const formattedContent = generateSmartPaste(content, targetContext);
      
      // Track paste action
      const detection = detectClipboardContent(content);
      addEntry({
        content,
        type: detection.type,
        metadata: {
          source: 'paste',
          operatorId: 'system',
          context: { targetContext }
        },
        tags: generateTags(content, detection.type),
        formatted: {
          [targetContext]: formattedContent
        }
      });
      
      return formattedContent;
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      throw error;
    }
  }, [addEntry]);

  // Paste specific entry from history
  const pasteFromHistory = useCallback(async (
    entryId: string,
    targetContext: 'form' | 'search' | 'report' | 'message' = 'form'
  ) => {
    const entry = history.find(e => e.id === entryId);
    if (!entry) return;
    
    const content = entry.formatted?.[targetContext] || entry.content;
    
    try {
      await navigator.clipboard.writeText(content);
      showNotification('Pegado desde historial', 'success');
      return content;
    } catch (error) {
      console.error('Error pasting from history:', error);
      showNotification('Error al pegar', 'error');
    }
  }, [history]);

  // Listen for clipboard changes (experimental API)
  useEffect(() => {
    if (!('clipboard' in navigator) || !('read' in navigator.clipboard)) {
      return;
    }

    const checkClipboard = async () => {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes('text/plain')) {
            const blob = await item.getType('text/plain');
            const text = await blob.text();
            
            // Check if this is new content
            const lastEntry = history[0];
            if (!lastEntry || lastEntry.content !== text) {
              const detection = detectClipboardContent(text);
              
              // Only auto-add if it's relevant content
              if (detection.confidence > 0.7) {
                addEntry({
                  content: text,
                  type: detection.type,
                  metadata: {
                    source: 'auto-detect',
                    operatorId: 'system',
                    context: { confidence: detection.confidence }
                  },
                  tags: generateTags(text, detection.type)
                });
              }
            }
          }
        }
      } catch (error) {
        // Permission denied or API not available
        console.debug('Clipboard auto-detection not available');
      }
    };

    // Check clipboard periodically when panel is open
    if (isOpen) {
      const interval = setInterval(checkClipboard, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, history, addEntry]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + V to open clipboard panel
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'v') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  return {
    copyToClipboard,
    pasteFromClipboard,
    pasteFromHistory,
    history: getFilteredHistory(),
    isOpen,
    setIsOpen
  };
}

// Helper functions
function generateTags(content: string, type: string): string[] {
  const tags = [type];
  
  // Add date tag
  const today = new Date().toLocaleDateString('es-ES');
  tags.push(today);
  
  // Add content-based tags
  if (content.includes('CRITICA') || content.includes('CRITICAL')) {
    tags.push('crítico');
  }
  if (content.includes('VIOLACION') || content.includes('VIOLATION')) {
    tags.push('violación');
  }
  if (content.includes('ACTIVO') || content.includes('ACTIVE')) {
    tags.push('activo');
  }
  
  return tags;
}

function showNotification(message: string, type: 'success' | 'error') {
  // This would integrate with your notification system
  if (type === 'success') {
    console.log(`✅ ${message}`);
  } else {
    console.error(`❌ ${message}`);
  }
}