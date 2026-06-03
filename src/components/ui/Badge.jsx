import { cn, getStatusStyle, getStatusLabel } from '@/lib/utils'

/**
 * Badge — small label pill for statuses, categories, counts.
 * Variants: default, success, warning, danger, info, accent
 * Also exports StatusBadge for order statuses.
 */
export default function Badge({
  children,
  className,
  variant = 'default',
  size    = 'md',
  dot     = false,
}) {

  const variants = {
    default: 'bg-brand-700 text-brand-300 border border-brand-600',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/10  text-amber-400  border border-amber-500/30',
    danger:  'bg-red-500/10    text-red-400    border border-red-500/30',
    info:    'bg-blue-500/10   text-blue-400   border border-blue-500/30',
    accent:  'bg-accent-500/10 text-accent-400 border border-accent-500/30',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs  gap-1',
    md: 'px-2   py-0.5 text-xs  gap-1.5',
    lg: 'px-2.5 py-1   text-sm  gap-1.5',
  }

  const dotColors = {
    default: 'bg-brand-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger:  'bg-red-400',
    info:    'bg-blue-400',
    accent:  'bg-accent-400',
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      'font-sans leading-none whitespace-nowrap',
      variants[variant],
      sizes[size],
      className,
    )}>
      {dot && (
        <span className={cn(
          'rounded-full shrink-0',
          size === 'lg' ? 'size-2' : 'size-1.5',
          dotColors[variant],
        )} />
      )}
      {children}
    </span>
  )
}

/**
 * StatusBadge — auto-styled badge for order status strings.
 * @param {{ status: 'new'|'processing'|'finished'|'cancelled' }} props
 */
export function StatusBadge({ status, className }) {
  const style = getStatusStyle(status)
  const label = getStatusLabel(status)

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full',
      'px-2 py-0.5 text-xs font-medium font-sans',
      'border whitespace-nowrap',
      style.bg, style.text, style.border,
      className,
    )}>
      {/* Animated dot for active statuses */}
      <span className={cn(
        'size-1.5 rounded-full shrink-0',
        style.text.replace('text-', 'bg-'),
        status === 'processing' && 'animate-pulse',
      )} />
      {label}
    </span>
  )
}