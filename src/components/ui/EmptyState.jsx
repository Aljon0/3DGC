import { cn } from '@/lib/utils'
import Button from './Button'

/**
 * EmptyState — zero-data placeholder with icon, message, and optional CTA.
 *
 * @example
 * <EmptyState
 *   icon={<Package />}
 *   title="No orders yet"
 *   description="Place your first order to get started."
 *   action={{ label: 'Browse Catalog', onClick: () => navigate('/customer/catalog') }}
 * />
 */
export default function EmptyState({
  icon,
  title       = 'Nothing here yet',
  description,
  action,
  className,
  size        = 'md',
}) {

  const sizes = {
    sm: { wrap: 'py-10', icon: 'size-10', title: 'text-base', desc: 'text-sm' },
    md: { wrap: 'py-16', icon: 'size-12', title: 'text-lg',   desc: 'text-sm' },
    lg: { wrap: 'py-24', icon: 'size-16', title: 'text-xl',   desc: 'text-base' },
  }

  const s = sizes[size]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      'gap-3 w-full px-4',
      s.wrap,
      className,
    )}>

      {/* Icon with subtle glow container */}
      {icon && (
        <div className={cn(
          'flex items-center justify-center rounded-2xl',
          'bg-brand-800 border border-brand-700',
          'text-brand-500 mb-1',
          size === 'lg' ? 'size-20 rounded-3xl' : 'size-16',
        )}>
          <span className={s.icon}>{icon}</span>
        </div>
      )}

      {/* Title */}
      <h3 className={cn(
        'font-display font-semibold text-brand-200',
        s.title,
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn('text-brand-400 max-w-sm leading-relaxed', s.desc)}>
          {description}
        </p>
      )}

      {/* CTA */}
      {action && (
        <div className="mt-2">
          <Button
            variant={action.variant ?? 'solid'}
            size={action.size ?? 'md'}
            onClick={action.onClick}
            iconLeft={action.icon}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}