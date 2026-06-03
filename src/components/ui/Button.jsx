import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Spinner from './Spinner'

/**
 * Button — primary interactive element.
 * Variants: solid, outline, ghost, danger
 * Sizes: sm, md, lg
 */
const Button = forwardRef(({
  children,
  className,
  variant  = 'solid',
  size     = 'md',
  loading  = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  type     = 'button',
  ...props
}, ref) => {

  const base = cn(
    // Base styles
    'relative inline-flex items-center justify-center gap-2',
    'font-sans font-medium rounded-lg',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-accent-500 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-brand-900',
    'select-none cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Full width
    fullWidth && 'w-full',
  )

  const variants = {
    solid: cn(
      'bg-accent-500 text-white',
      'hover:bg-accent-400 active:bg-accent-600',
      'shadow-sm hover:shadow-glow',
    ),
    outline: cn(
      'border border-brand-600 text-brand-100',
      'bg-transparent',
      'hover:border-brand-400 hover:bg-brand-800',
      'active:bg-brand-700',
    ),
    ghost: cn(
      'text-brand-300 bg-transparent',
      'hover:bg-brand-800 hover:text-brand-100',
      'active:bg-brand-700',
    ),
    danger: cn(
      'bg-red-500/10 text-red-400',
      'border border-red-500/30',
      'hover:bg-red-500/20 hover:border-red-500/50',
      'active:bg-red-500/30',
    ),
    accent: cn(
      'bg-brand-800 text-accent-400',
      'border border-accent-500/30',
      'hover:border-accent-500/60 hover:bg-brand-700',
      'active:bg-brand-600',
    ),
  }

  const sizes = {
    xs: 'h-7  px-2.5 text-xs  gap-1',
    sm: 'h-8  px-3   text-sm  gap-1.5',
    md: 'h-9  px-4   text-sm  gap-2',
    lg: 'h-11 px-5   text-base gap-2',
    xl: 'h-12 px-6   text-base gap-2.5',
  }

  const iconSizes = {
    xs: 'size-3',
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-4',
    xl: 'size-5',
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {/* Loading spinner overlays content */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}

      {/* Content (hidden when loading to preserve width) */}
      <span className={cn('contents', loading && 'invisible')}>
        {iconLeft && (
          <span className={cn('shrink-0', iconSizes[size])}>
            {iconLeft}
          </span>
        )}
        {children}
        {iconRight && (
          <span className={cn('shrink-0', iconSizes[size])}>
            {iconRight}
          </span>
        )}
      </span>
    </button>
  )
})

Button.displayName = 'Button'
export default Button