 
/**
 * Componentes animados reutilizables con Framer Motion
 * By Cheva
 */

import React from 'react'
import { motion, AnimatePresence} from 'framer-motion'
import {fadeVariants, scaleVariants, slideUpVariants, slideDownVariants, hoverScaleVariants, hoverLiftVariants, staggerContainer, staggerItem, modalVariants, overlayVariants} from './AnimationPresets'
import { tokenClasses} from '../../styles/useDesignTokens'
// ==========================================
// COMPONENTES BASE ANIMADOS
// ==========================================

interface AnimatedDivProps {
  children: React.ReactNode
  className?: string
  [key: string]: unknown; // Allow all motion props
}

// Div con fade animation
export const FadeDiv: React.FC<AnimatedDivProps> = (children, className = "", ...props 
) => (
  <motion.div
    variants={fadeVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    {...props}
  >
    {children}
  </motion.div>
)
// Div con scale animation
export const ScaleDiv: React.FC<AnimatedDivProps> = (children, className = "", ...props 
) => (
  <motion.div
    variants={scaleVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    {...props}
  >
    {children}
  </motion.div>
)
// Div con slide up animation
export const SlideUpDiv: React.FC<AnimatedDivProps> = (children, className = "", ...props 
) => (
  <motion.div
    variants={slideUpVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    {...props}
  >
    {children}
  </motion.div>
)
// Div con slide down animation
export const SlideDownDiv: React.FC<AnimatedDivProps> = (children, className = "", ...props 
) => (
  <motion.div
    variants={slideDownVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={className}
    {...props}
  >
    {children}
  </motion.div>
)
// ==========================================
// COMPONENTES DE UI ANIMADOS
// ==========================================

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

// Card animada con hover effect
export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, className = "", hover = true, onClick 
}) => {
  const baseClasses = `${tokenClasses.components.card} ${className}`
  return (
    <motion.div
      className={baseClasses}
      variants={hover ? hoverLiftVariants : scaleVariants}
      initial={hover ? "initial" : "hidden"}
      animate={hover ? "initial" : "visible"}
      whileHover={hover ? "hover" : undefined}
      whileTap={hover ? "tap" : undefined}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  )
}
interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onClick?: () => void
  disabled?: boolean
}

// Botón animado
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, className = "", variant = 'primary', onClick, disabled = false
}) => {
  const variantClasses = {
    primary: tokenClasses.components.button.primary,
    secondary: tokenClasses.components.button.secondary,
    danger: tokenClasses.components.button.danger,
    ghost: tokenClasses.components.button.ghost
  }
  const baseClasses = `${tokenClasses.components.button.base} ${variantClasses[variant]} ${className}`
  return (
    <motion.button
      className={baseClasses}
      variants={hoverScaleVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
// ==========================================
// LISTA ANIMADA
// ==========================================

interface AnimatedListProps {
  children: React.ReactNode
  className?: string
}

export const AnimatedList: React.FC<AnimatedListProps> = (children, className = "" 
) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
)
interface AnimatedListItemProps {
  children: React.ReactNode
  className?: string
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = (children, className = "" 
) => (
  <motion.div
    variants={staggerItem}
    className={className}
  >
    {children}
  </motion.div>
)
// ==========================================
// MODAL ANIMADO
// ==========================================

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({ 
  isOpen, onClose, children, className = "" 
}) => {
  return (<AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${tokenClasses.components.modal.content} ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
// ==========================================
// BADGE ANIMADO
// ==========================================

interface AnimatedBadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray'
  pulse?: boolean
  className?: string
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({ 
  children, variant = 'gray', pulse = false, className = "" 
}) => {
  const variantClasses = tokenClasses.components.badge[variant]
  const baseClasses = `${tokenClasses.components.badge.base} ${variantClasses} ${className}`
  return (
    <motion.span
      className={baseClasses}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        ...(pulse && {
          scale: [1, 1.1, 1],
          transition: {
            scale: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }
          }
        })
      }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      {children}
    </motion.span>
  )
}
// ==========================================
// LOADING SPINNER ANIMADO
// ==========================================

interface AnimatedSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const AnimatedSpinner: React.FC<AnimatedSpinnerProps> = ({ 
  size = 'md', className = "" 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  )
}
// ==========================================
// SKELETON ANIMADO
// ==========================================

interface AnimatedSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({ 
  className = "", variant = 'text'
}) => {
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'h-12 w-12 rounded-full',
    rectangular: 'h-32 w-full'
  }
  return (
    <motion.div
      className={`bg-gray-700 ${variantClasses[variant]} ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}
// ==========================================
// ANIMATED DIV - CONTENEDOR GENÉRICO
// ==========================================

interface AnimatedDivProps {
  children: React.ReactNode
  className?: string
  delay?: number
  [key: string]: unknown; // Allow all motion props
}

export const AnimatedDiv: React.FC<AnimatedDivProps> = ({ 
  children, className = "", delay = 0, ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
// ==========================================
// PROGRESS BAR ANIMADO
// ==========================================

interface AnimatedProgressProps {
  value: number
  className?: string
  color?: string
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ 
  value, className = "", color = "bg-blue-500"
}) => {
  return (
    <div className={`w-full bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  )
}
export default {
  FadeDiv,
  ScaleDiv,
  SlideUpDiv,
  SlideDownDiv,
  AnimatedDiv,
  AnimatedCard,
  AnimatedButton,
  AnimatedList,
  AnimatedListItem,
  AnimatedModal,
  AnimatedBadge,
  AnimatedSpinner,
  AnimatedSkeleton,
  AnimatedProgress
}