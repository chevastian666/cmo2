/**
 * Types and interfaces for UX Enhancement Features
 */

import { ComponentType } from 'react';

// Radial Menu Types
export interface RadialMenuAction {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  action: (context?: any) => void;
  color?: string;
  shortcut?: string;
  permissions?: string[];
  disabled?: boolean;
  badge?: string | number;
}

export interface RadialMenuProps {
  actions: RadialMenuAction[];
  position: { x: number; y: number };
  isOpen: boolean;
  onClose: () => void;
  customizable?: boolean;
  gestureEnabled?: boolean;
  context?: any;
  size?: 'small' | 'medium' | 'large';
  animationPreset?: 'smooth' | 'bouncy' | 'stiff';
}

export interface RadialMenuSettings {
  favoriteActions: string[];
  customOrder?: string[];
  defaultSize: 'small' | 'medium' | 'large';
  animationSpeed: number;
  hapticFeedback: boolean;
}

// Smart Clipboard Types
export type ClipboardContentType = 'precinto' | 'alerta' | 'reporte' | 'datos' | 'custom';

export interface ClipboardEntry {
  id: string;
  timestamp: Date;
  content: string;
  type: ClipboardContentType;
  metadata: {
    source: string;
    operatorId: string;
    context?: any;
    precintoId?: string;
    alertId?: string;
  };
  tags: string[];
  formatted?: Record<string, string>; // Different format versions
}

export interface PasteTemplate {
  id: string;
  name: string;
  type: ClipboardContentType;
  format: (entry: ClipboardEntry) => string;
  validator?: (content: string) => boolean;
}

export interface SmartClipboardProps {
  maxHistory?: number;
  syncEnabled?: boolean;
  templates?: PasteTemplate[];
  onCopy?: (entry: ClipboardEntry) => void;
  onPaste?: (entry: ClipboardEntry) => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  hotkeys?: boolean;
}

export interface ClipboardState {
  history: ClipboardEntry[];
  searchQuery: string;
  selectedType: ClipboardContentType | 'all';
  isOpen: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
}