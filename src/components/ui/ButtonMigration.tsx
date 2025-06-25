/* eslint-disable react-refresh/only-export-components */
import { forwardRef} from 'react'
import { Button as ShadcnButton} from './button'
import { cn} from '@/lib/utils'
import type { ButtonProps as ShadcnButtonProps } from './button'

export interface ButtonMigrationProps extends ShadcnButtonProps {
  // Additional props to help with migration
  fullWidth?: boolean
  loading?: boolean
}

/**
 * Migration helper component that maps common button patterns to shadcn/ui Button
 * This helps maintain compatibility while migrating existing button styles
 */
export const ButtonMigration = forwardRef<HTMLButtonElement, ButtonMigrationProps>(({ className, variant, size, fullWidth, loading, disabled, children, ...props }, ref) => {
    // Map common class patterns to shadcn/ui variants
    let mappedVariant = variant
    let mappedSize = size
    if (!variant && className) {
      // Primary button pattern
      if (className.includes('bg-blue-600') || className.includes('bg-blue-500')) {
        mappedVariant = 'default'
      }
      // Secondary button pattern
      else if (className.includes('bg-gray-700') || className.includes('bg-gray-600')) {
        mappedVariant = 'secondary'
      }
      // Danger button pattern
      else if (className.includes('bg-red-600') || className.includes('bg-red-500')) {
        mappedVariant = 'destructive'
      }
      // Success button pattern (map to default with custom class)
      else if (className.includes('bg-green-600') || className.includes('bg-green-500')) {
        mappedVariant = 'default'
      }
      // Ghost/Text button pattern
      else if (className.includes('hover:bg-gray-600') && !className.includes('bg-')) {
        mappedVariant = 'ghost'
      }
      // Outline pattern
      else if (className.includes('border') && !className.includes('bg-')) {
        mappedVariant = 'outline'
      }
    }

    // Map size patterns
    if (!size && className) {
      if (className.includes('px-2 py-1') || className.includes('text-sm')) {
        mappedSize = 'sm'
      }
      else if (className.includes('p-1') && !className.includes('px-') && !className.includes('py-')) {
        mappedSize = 'icon'
      }
      else if (className.includes('px-6') || className.includes('py-3') || className.includes('text-lg')) {
        mappedSize = 'lg'
      }
    }

    // Build custom classes for special cases
    const customClasses = cn(
      fullWidth && 'w-full',
      // Preserve green color for success buttons
      className?.includes('bg-green') && 'bg-green-600 hover:bg-green-700 text-white',
      // Remove conflicting classes from original className
      className?.split(' ').filter(cls => 
        !cls.startsWith('bg-') && 
        !cls.startsWith('hover:bg-') && 
        !cls.startsWith('text-') && 
        !cls.startsWith('px-') && 
        !cls.startsWith('py-') && 
        !cls.startsWith('rounded') &&
        !cls.startsWith('disabled:') &&
        !cls.startsWith('focus:') &&
        !cls.startsWith('transition')
      ).join(' ')
    )
    return (
      <ShadcnButton
        ref={ref}
        variant={mappedVariant}
        size={mappedSize}
        disabled={disabled || loading}
        className={customClasses}
        {...props}
      >
        {loading ? (
          <>
            <span className="mr-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            {children}
          </>
        ) : (
          children
        )}
      </ShadcnButton>
    )
  }
)
ButtonMigration.displayName = 'ButtonMigration'
// Export a simple function to help with migration
export const migrateButtonClass = (className: string): { variant?: string; size?: string; className?: string } => {
  const result: { variant?: string; size?: string; className?: string } = {}
  // Variant mapping
  if (className.includes('bg-blue-600') || className.includes('bg-blue-500')) {
    result.variant = 'default'
  } else if (className.includes('bg-gray-700') || className.includes('bg-gray-600')) {
    result.variant = 'secondary'
  } else if (className.includes('bg-red-600') || className.includes('bg-red-500')) {
    result.variant = 'destructive'
  } else if (className.includes('hover:bg-gray-600') && !className.includes('bg-')) {
    result.variant = 'ghost'
  } else if (className.includes('border') && !className.includes('bg-')) {
    result.variant = 'outline'
  }

  // Size mapping
  if (className.includes('px-2 py-1') || className.includes('text-sm')) {
    result.size = 'sm'
  } else if (className.includes('p-1') && !className.includes('px-') && !className.includes('py-')) {
    result.size = 'icon'
  } else if (className.includes('px-6') || className.includes('py-3') || className.includes('text-lg')) {
    result.size = 'lg'
  }

  // Preserve non-style classes
  const preservedClasses = className.split(' ').filter(cls => 
    !cls.startsWith('bg-') && 
    !cls.startsWith('hover:bg-') && 
    !cls.startsWith('text-') && 
    !cls.startsWith('px-') && 
    !cls.startsWith('py-') && 
    !cls.startsWith('rounded') &&
    !cls.startsWith('disabled:') &&
    !cls.startsWith('focus:') &&
    !cls.startsWith('transition')
  ).join(' ')
  if (preservedClasses) {
    result.className = preservedClasses
  }

  return result
}