import React from 'react';
import { motion } from 'framer-motion';
import { useClipboard } from '../../hooks/useClipboard';
import {
  DocumentDuplicateIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface ClipboardContextMenuProps {
  selection: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ClipboardContextMenu: React.FC<ClipboardContextMenuProps> = ({
  selection,
  position,
  onClose
}) => {
  const { copyToClipboard } = useClipboard();

  const handleCopy = async (context: string) => {
    await copyToClipboard(selection, {
      source: 'context-menu',
      context: { action: context }
    });
    onClose();
  };

  const menuItems = [
    {
      icon: DocumentDuplicateIcon,
      label: 'Copiar',
      action: () => handleCopy('copy')
    },
    {
      icon: MagnifyingGlassIcon,
      label: 'Copiar para búsqueda',
      action: () => handleCopy('search')
    },
    {
      icon: DocumentTextIcon,
      label: 'Copiar para reporte',
      action: () => handleCopy('report')
    },
    {
      icon: ChatBubbleLeftIcon,
      label: 'Copiar para mensaje',
      action: () => handleCopy('message')
    }
  ];

  return (
    <motion.div
      className="fixed z-50 bg-gray-800 rounded-lg shadow-xl py-2 min-w-[200px]"
      style={{ left: position.x, top: position.y }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700 transition-colors text-left"
        >
          <item.icon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-white">{item.label}</span>
        </button>
      ))}
    </motion.div>
  );
};