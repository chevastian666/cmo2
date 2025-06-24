 
import React from 'react'
import { cn} from '../../utils/utils'
export type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost'
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  variant?: CardVariant
  noPadding?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  children, className, variant = 'default', noPadding = false, onClick, header, footer, ...props
}) => {
  const variantStyles = {
    default: 'bg-gray-800 border-gray-700',
    elevated: 'bg-gray-800 border-gray-700 shadow-lg',
    bordered: 'bg-transparent border-gray-600 border-2',
    ghost: 'bg-gray-800/50 border-transparent'
  }
  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:border-gray-600',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className={cn(
          'border-b border-gray-700',
          !noPadding && 'px-6 py-4'
        )}>
          {header}
        </div>
      )}
      
      <div className={!noPadding ? 'p-6' : undefined}>
        {children}
      </div>
      
      {footer && (
        <div className={cn(
          'border-t border-gray-700',
          !noPadding && 'px-6 py-4'
        )}>
          {footer}
        </div>
      )}
    </div>
  )
}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children, className, actions, ...props
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      {actions ? (
        <>
          <div className="flex-1">
            {children}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {actions}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  )
}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children, className, ...props
}) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-100', className)} {...props}>
      {children}
    </h3>
  )
}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children, className, ...props
}) => {
  return (
    <div className={cn('text-sm text-gray-400 mt-1', className)} {...props}>
      {children}
    </div>
  )
}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({
  children, className, ...props
}) => {
  return (
    <div className={cn('text-gray-300', className)} {...props}>
      {children}
    </div>
  )
}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children, className, ...props
}) => {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)} {...props}>
      {children}
    </div>
  )
}