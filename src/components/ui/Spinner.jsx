import { cn } from '@/lib/utils'

/**
 * Spinner — loading indicator.
 * Sizes: xs, sm, md, lg
 * Variants: accent (default), white, muted
 */
export default function Spinner({
  size    = 'md',
  variant = 'accent',
  className,
}) {
  const sizes = {
    xs: 'size-3   border-[1.5px]',
    sm: 'size-4   border-2',
    md: 'size-5   border-2',
    lg: 'size-7   border-[3px]',
    xl: 'size-10  border-4',
  }

  const variants = {
    accent: 'border-accent-500/30 border-t-accent-500',
    white:  'border-white/30      border-t-white',
    muted:  'border-brand-600     border-t-brand-400',
  }

  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full animate-spin',
        sizes[size],
        variants[variant],
        className,
      )}
    />
  )
}

/**
 * FullPageSpinner — centered spinner for page-level loading.
 */
export function FullPageSpinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner size="xl" />
      {message && (
        <p className="text-brand-400 text-sm font-sans animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * InlineSpinner — for loading states inside cards/sections.
 */
export function InlineSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-brand-400">
      <Spinner size="md" variant="muted" />
      <span className="text-sm font-sans">{message}</span>
    </div>
  )
}