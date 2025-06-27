/* eslint-disable react-refresh/only-export-components */
/**
 * Input with enhanced visual feedback
 * By Cheva
 */

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Check, X, Loader2, Search, Eye, EyeOff} from 'lucide-react'
import { motion, AnimatePresence} from 'framer-motion'
import { cn} from '@/lib/utils'
export interface FeedbackInputProps extends Omit<React.ComponentProps<"input">, 'type'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  validationFn?: (value: string) => boolean | Promise<boolean>
  validationMessage?: string
  debounceMs?: number
  showValidationIcon?: boolean
  showPasswordToggle?: boolean
  onValidationChange?: (isValid: boolean) => void
  showSearchIcon?: boolean
  clearable?: boolean
  onClear?: () => void
}

export const FeedbackInput: React.FC<FeedbackInputProps> = ({
  type = 'text', validationFn, validationMessage, debounceMs = 500, showValidationIcon = true, showPasswordToggle = true, onValidationChange, showSearchIcon = true, clearable = false, onClear, className, onChange, value, ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '')
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value as string)
    }
  }, [value])
  const handleValidation = async (val: string) => {
    if (!validationFn || !val) {
      setIsValid(null)
      return
    }

    setIsValidating(true)
    try {
      const result = await validationFn(val)
      setIsValid(result)
      onValidationChange?.(result)
    } catch {
      setIsValid(false)
      onValidationChange?.(false)
    } finally {
      setIsValidating(false)
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange?.(e)
    // Debounced validation
    if (validationFn) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (newValue) {
        debounceTimerRef.current = setTimeout(() => {
          handleValidation(newValue)
        }, debounceMs)
      } else {
        setIsValid(null)
      }
    }
  }
  const handleClear = () => {
    setLocalValue('')
    setIsValid(null)
    onClear?.()
    // Create synthetic event
    const input = document.createElement('input')
    input.value = ''
    const syntheticEvent = {
      target: input,
      currentTarget: input,
      preventDefault: () => {},
      stopPropagation: () => {},
      bubbles: true,
      cancelable: true,
      type: 'change',
      nativeEvent: new Event('change')
    } as React.ChangeEvent<HTMLInputElement>
    onChange?.(syntheticEvent)
  }
  const getIcon = () => {
    if (isValidating && showValidationIcon) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    }

    if (isValid !== null && showValidationIcon && localValue) {
      return isValid ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )
    }

    if (type === 'search' && showSearchIcon && !localValue) {
      return <Search className="h-4 w-4 text-gray-400" />
    }

    return null
  }
  const inputType = type === 'password' && showPassword ? 'text' : type
  return (<div className="relative">
      <div className="relative">
        <Input
          {...props}
          type={inputType}
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'pr-10 transition-all duration-200',
            isFocused && 'ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900',
            isValid === false && localValue && 'border-red-500 focus:ring-red-500',
            isValid === true && localValue && 'border-green-500 focus:ring-green-500',
            type === 'search' && showSearchIcon && 'pl-10',
            className
          )}
        />

        {/* Left icon for search */}
        {type === 'search' && showSearchIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        )}

        {/* Right side icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Clear button */}
          <AnimatePresence>
            {clearable && localValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-3 w-3 text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Password toggle */}
          {type === 'password' && showPasswordToggle && (<button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}

          {/* Validation icon */}
          <AnimatePresence mode="wait">
            {getIcon() && (
              <motion.div
                key={isValidating ? 'validating' : isValid ? 'valid' : 'invalid'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {getIcon()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Validation message */}
      <AnimatePresence>
        {isValid === false && validationMessage && localValue && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-red-500 mt-1"
          >
            {validationMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Progress bar for loading */}
      {isValidating && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      )}
    </div>
  )
}
// Preset validation functions
export const emailValidation = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
export const urlValidation = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
export const phoneValidation = (phone: string): boolean => {
  const regex = /^[\d\s\-+()]+$/
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10
}