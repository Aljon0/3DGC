import { cn } from '@/lib/utils'

/**
 * Avatar — user profile picture with fallback initials.
 * Sizes: xs, sm, md, lg, xl
 */
export default function Avatar({
  src,
  name,
  size      = 'md',
  className,
  online,
}) {

  const sizes = {
    xs:  'size-6  text-xs',
    sm:  'size-8  text-xs',
    md:  'size-9  text-sm',
    lg:  'size-11 text-base',
    xl:  'size-14 text-lg',
    '2xl': 'size-20 text-2xl',
  }

  const onlineSizes = {
    xs:  'size-1.5 border',
    sm:  'size-2   border',
    md:  'size-2.5 border-2',
    lg:  'size-3   border-2',
    xl:  'size-3.5 border-2',
    '2xl': 'size-4 border-2',
  }

  // Generate initials from name
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // Generate a consistent bg color from name
  const hue = name
    ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    : 200

  return (
    <div className={cn('relative shrink-0', className)}>
      <div className={cn(
        'rounded-full flex items-center justify-center',
        'font-display font-semibold text-white',
        'overflow-hidden select-none',
        sizes[size],
      )}
        style={{ background: src ? 'transparent' : `hsl(${hue}, 45%, 35%)` }}
      >
        {src ? (
          <img
            src={src}
            alt={name ?? 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online indicator */}
      {online !== undefined && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full',
          'border-brand-900',
          onlineSizes[size],
          online ? 'bg-emerald-400' : 'bg-brand-500',
        )} />
      )}
    </div>
  )
}

/**
 * AvatarGroup — stack multiple avatars with overflow count.
 */
export function AvatarGroup({ users = [], max = 3, size = 'sm' }) {
  const visible  = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div
          key={user.id ?? i}
          className="relative"
          style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: visible.length - i }}
        >
          <Avatar
            src={user.avatar}
            name={user.name}
            size={size}
            className="ring-2 ring-brand-900"
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full',
            'bg-brand-700 text-brand-300 text-xs font-medium font-sans',
            'ring-2 ring-brand-900 -ml-2',
            size === 'sm' ? 'size-8' : 'size-9',
          )}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}