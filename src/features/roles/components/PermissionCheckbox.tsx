import React, { memo } from 'react';
import { Check, X, Lock } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { Permission } from '../../../types/roles';

interface PermissionCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  permission: Permission;
  disabled?: boolean;
  loading?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PermissionCheckbox: React.FC<PermissionCheckboxProps> = memo(({
  checked,
  onChange,
  permission,
  disabled = false,
  loading = false,
  showLabel = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const getPermissionColor = () => {
    switch (permission) {
      case 'view':
        return checked ? 'bg-blue-600 border-blue-600' : 'border-gray-600 hover:border-blue-500';
      case 'create':
        return checked ? 'bg-green-600 border-green-600' : 'border-gray-600 hover:border-green-500';
      case 'edit':
        return checked ? 'bg-yellow-600 border-yellow-600' : 'border-gray-600 hover:border-yellow-500';
      case 'delete':
        return checked ? 'bg-red-600 border-red-600' : 'border-gray-600 hover:border-red-500';
      default:
        return checked ? 'bg-gray-600 border-gray-600' : 'border-gray-600';
    }
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'relative rounded border-2 transition-all duration-200 flex items-center justify-center',
          sizeClasses[size],
          getPermissionColor(),
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'cursor-wait',
          !disabled && !loading && 'cursor-pointer hover:scale-110'
        )}
        title={`${permission} permission`}
      >
        {loading ? (
          <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-3 w-3" />
        ) : checked ? (
          <Check className={cn(iconSizes[size], 'text-white')} />
        ) : disabled ? (
          <Lock className={cn(iconSizes[size], 'text-gray-500')} />
        ) : null}
      </button>
      
      {showLabel && (
        <span className={cn(
          'text-gray-300 capitalize select-none',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {permission}
        </span>
      )}
    </div>
  );
});

PermissionCheckbox.displayName = 'PermissionCheckbox';

// Bulk checkbox component for headers
interface BulkPermissionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const BulkPermissionCheckbox: React.FC<BulkPermissionCheckboxProps> = memo(({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  label
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
          checked || indeterminate ? 'bg-blue-600 border-blue-600' : 'border-gray-600 hover:border-blue-500',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:scale-110'
        )}
        title={label || 'Toggle all'}
      >
        {indeterminate ? (
          <div className="w-3 h-0.5 bg-white" />
        ) : checked ? (
          <Check className="h-3 w-3 text-white" />
        ) : null}
      </button>
      
      {label && (
        <span className="text-sm text-gray-300 select-none">
          {label}
        </span>
      )}
    </div>
  );
});

BulkPermissionCheckbox.displayName = 'BulkPermissionCheckbox';