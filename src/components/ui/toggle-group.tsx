 
/**
 * Toggle Group Component
 * Group of toggle buttons for selection
 * By Cheva
 */

import React, { createContext, useContext } from 'react'
import { cn} from '@/utils/utils'
interface ToggleGroupContextValue {
  value: string
  onValueChange: (value: string) => void
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | undefined>(undefined)
interface ToggleGroupProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value, onValueChange, className, children
}) => {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn('inline-flex rounded-md shadow-sm', className)} role="group">
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}
interface ToggleGroupItemProps {
  value: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

export const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  value, className, children, disabled = false
}) => {
  const context = useContext(ToggleGroupContext)
  if (!context) {
    throw new Error('ToggleGroupItem must be used within ToggleGroup')
  }

  const { value: selectedValue } = context
  const isSelected = selectedValue === value
  return (<button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-all',
        'focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isSelected
          ? 'bg-gray-700 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white',
        'first:rounded-l-md last:rounded-r-md',
        'border-y border-r first:border-l border-gray-600',
        className
      )}
    >
      {children}
    </button>
  )
}