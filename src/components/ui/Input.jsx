import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Input — text field with optional label, hint, error, and icon slots.
 */
const Input = forwardRef(({
  className,
  label,
  hint,
  error,
  iconLeft,
  iconRight,
  size     = 'md',
  id,
  required,
  ...props
}, ref) => {

  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`

  const sizes = {
    sm: 'h-8  px-3 text-xs',
    md: 'h-9  px-3 text-sm',
    lg: 'h-11 px-4 text-base',
  }

  const iconPad = {
    left:  { sm: 'pl-8',  md: 'pl-9',  lg: 'pl-10' },
    right: { sm: 'pr-8',  md: 'pr-9',  lg: 'pr-10' },
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">

      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-brand-200"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-accent-500" aria-hidden>*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">

        {/* Left icon */}
        {iconLeft && (
          <span className={cn(
            'absolute left-0 flex items-center justify-center',
            'text-brand-400 pointer-events-none',
            size === 'sm' ? 'size-8' : size === 'md' ? 'size-9' : 'size-11',
          )}>
            <span className="size-4">{iconLeft}</span>
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            // Base
            'w-full rounded-lg font-sans',
            'bg-brand-800 text-brand-100',
            'border border-brand-600',
            'placeholder:text-brand-500',
            // Focus
            'focus:outline-none focus:border-accent-500',
            'focus:ring-1 focus:ring-accent-500/40',
            // Transition
            'transition-colors duration-150',
            // Disabled
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Error state
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30',
            // Sizes
            sizes[size],
            // Icon padding
            iconLeft  && iconPad.left[size],
            iconRight && iconPad.right[size],
            className,
          )}
          {...props}
        />

        {/* Right icon */}
        {iconRight && (
          <span className={cn(
            'absolute right-0 flex items-center justify-center',
            'text-brand-400',
            size === 'sm' ? 'size-8' : size === 'md' ? 'size-9' : 'size-11',
          )}>
            <span className="size-4">{iconRight}</span>
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 mt-0.5" role="alert">
          {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="text-xs text-brand-500">{hint}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// ── Textarea variant ───────────────────────────────────────────────────────
export const Textarea = forwardRef(({
  className,
  label,
  hint,
  error,
  id,
  required,
  rows = 4,
  ...props
}, ref) => {
  const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 7)}`

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-brand-200">
          {label}
          {required && <span className="ml-0.5 text-accent-500" aria-hidden>*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        className={cn(
          'w-full rounded-lg font-sans text-sm',
          'bg-brand-800 text-brand-100',
          'border border-brand-600',
          'placeholder:text-brand-500',
          'px-3 py-2.5 resize-y',
          'focus:outline-none focus:border-accent-500',
          'focus:ring-1 focus:ring-accent-500/40',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500/60 focus:border-red-500',
          className,
        )}
        {...props}
      />

      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-brand-500">{hint}</p>}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Input