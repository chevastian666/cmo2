// @ts-nocheck

/**
 * Button with enhanced visual feedback
 * By Cheva
 */
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'
import {Loader2, Check, X} from 'lucide-react'
import { motion, AnimatePresence} from 'framer-motion'
import { cn} from '@/lib/utils'
import { toast} from '@/hooks/use-toast'
export interface FeedbackButtonProps extends ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
  loadingText?: string
  successText?: string
  errorText?: string
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  successDuration?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
  showToastOnSuccess?: boolean
  showToastOnError?: boolean
  toastSuccessMessage?: string
  toastErrorMessage?: string
}
type ButtonState = 'idle' | 'loading' | 'success' | 'error'
export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  children, onClick, loadingText, successText, errorText, showSuccessIcon = true, showErrorIcon = true, successDuration = 2000, onSuccess, onError, disabled, className, variant = 'default', size = 'default', showToastOnSuccess = false, showToastOnError = true, toastSuccessMessage, toastErrorMessage, ...props
}) => {
  const [state, setState] = useState<ButtonState>('idle')
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || state !== 'idle') return
    setState('loading')
    try {
      await onClick(e)
      setState('success')
      if (showToastOnSuccess && toastSuccessMessage) {
        toast({
          title: "Éxito",
          description: toastSuccessMessage,
          variant: "default"
        })
      }
      onSuccess?.()
      // Reset to idle after success duration
      setTimeout(() => {
        setState('idle')
      }, successDuration)
    } catch (error) {
      setState('error')
      if (showToastOnError) {
        toast({
          title: "Error",
          description: toastErrorMessage || (error as Error).message || "Ha ocurrido un error",
          variant: "destructive"
        })
      }
      onError?.(error as Error)
      // Reset to idle after error duration
      setTimeout(() => {
        setState('idle')
      }, 3000)
    }
  }
  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        )
      case 'success':
        return (
          <>
            {showSuccessIcon && <Check className="mr-2 h-4 w-4" />}
            {successText || children}
          </>
        )
      case 'error':
        return (
          <>
            {showErrorIcon && <X className="mr-2 h-4 w-4" />}
            {errorText || 'Error'}
          </>
        )
      default:
        return children
    }
  }
  const getButtonVariant = () => {
    switch (state) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return variant
    }
  }
  return (
    <motion.div
      animate={state === 'success' ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Button
        {...props}
        onClick={handleClick}
        disabled={disabled || state !== 'idle'}
        variant={getButtonVariant()}
        size={size}
        className={cn(
          'transition-all duration-200',
          state === 'success' && 'bg-green-600 hover:bg-green-700',
          className
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {getButtonContent()}
          </motion.div>
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}
// Preset configurations for common use cases
export const SaveButton: React.FC<Omit<FeedbackButtonProps, 'loadingText' | 'successText'>> = (props) => (
  <FeedbackButton
    loadingText="Guardando..."
    successText="Guardado"
    toastSuccessMessage="Los cambios se han guardado correctamente"
    showToastOnSuccess
    {...props}
  >
    Guardar
  </FeedbackButton>
)
export const DeleteButton: React.FC<Omit<FeedbackButtonProps, 'loadingText' | 'successText'>> = (props) => (
  <FeedbackButton
    variant="destructive"
    loadingText="Eliminando..."
    successText="Eliminado"
    toastSuccessMessage="El elemento se ha eliminado correctamente"
    showToastOnSuccess
    {...props}
  >
    Eliminar
  </FeedbackButton>
)
export const SubmitButton: React.FC<Omit<FeedbackButtonProps, 'loadingText' | 'successText'>> = (props) => (
  <FeedbackButton
    loadingText="Enviando..."
    successText="Enviado"
    toastSuccessMessage="Formulario enviado correctamente"
    showToastOnSuccess
    {...props}
  >
    Enviar
  </FeedbackButton>
)
export const RefreshButton: React.FC<Omit<FeedbackButtonProps, 'loadingText' | 'successText'>> = (props) => (
  <FeedbackButton
    variant="outline"
    loadingText="Actualizando..."
    successText="Actualizado"
    successDuration={1000}
    {...props}
  >
    Actualizar
  </FeedbackButton>
)
