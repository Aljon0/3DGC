import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Dropdown — accessible menu with trigger + item list.
 *
 * @example
 * <Dropdown
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { label: 'Edit',   icon: <Pencil />, onClick: () => {} },
 *     { label: 'Delete', icon: <Trash />,  onClick: () => {}, danger: true },
 *     { divider: true },
 *     { label: 'View',   href: '/order/1' },
 *   ]}
 * />
 */
export default function Dropdown({
  trigger,
  items     = [],
  align     = 'left',   // 'left' | 'right'
  className,
}) {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>

      {/* Trigger */}
      <div onClick={() => setOpen(v => !v)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div className={cn(
          'absolute top-full mt-1.5 z-50 min-w-40',
          'bg-brand-800 border border-brand-600',
          'rounded-xl shadow-float overflow-hidden',
          'animate-scale-in origin-top',
          alignClass,
        )}>
          <div className="py-1">
            {items.map((item, i) => {

              // Divider
              if (item.divider) {
                return <div key={i} className="my-1 border-t border-brand-700" />
              }

              const content = (
                <span className="flex items-center gap-2.5">
                  {item.icon && (
                    <span className={cn(
                      'size-4 shrink-0',
                      item.danger ? 'text-red-400' : 'text-brand-400',
                    )}>
                      {item.icon}
                    </span>
                  )}
                  <span className={cn(
                    'text-sm font-sans',
                    item.danger ? 'text-red-400' : 'text-brand-200',
                  )}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-accent-500/20 text-accent-400 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              )

              const itemClass = cn(
                'w-full flex items-center px-3 py-2',
                'transition-colors duration-100 cursor-pointer',
                item.danger
                  ? 'hover:bg-red-500/10'
                  : 'hover:bg-brand-700',
                item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
              )

              // Link item
              if (item.href) {
                return (
                  <a
                    key={i}
                    href={item.href}
                    className={itemClass}
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </a>
                )
              }

              // Button item
              return (
                <button
                  key={i}
                  type="button"
                  disabled={item.disabled}
                  className={itemClass}
                  onClick={() => {
                    item.onClick?.()
                    setOpen(false)
                  }}
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * SelectDropdown — styled select replacement.
 */
export function SelectDropdown({
  value,
  onChange,
  options = [],   // [{ value, label }]
  placeholder = 'Select...',
  className,
  size = 'md',
}) {
  const [open, setOpen]   = useState(false)
  const ref               = useRef(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const sizes = {
    sm: 'h-8  px-3 text-xs',
    md: 'h-9  px-3 text-sm',
    lg: 'h-11 px-4 text-base',
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'bg-brand-800 border border-brand-600 rounded-lg',
          'text-brand-100 font-sans',
          'hover:border-brand-400 transition-colors duration-150',
          'focus:outline-none focus:border-accent-500',
          sizes[size],
        )}
      >
        <span className={cn(!selected && 'text-brand-500')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cn(
          'size-4 text-brand-400 shrink-0 transition-transform duration-150',
          open && 'rotate-180',
        )} />
      </button>

      {open && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-1 z-50',
          'bg-brand-800 border border-brand-600 rounded-xl',
          'shadow-float overflow-hidden animate-scale-in',
          'max-h-56 overflow-y-auto',
        )}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2.5',
                'text-sm font-sans text-brand-200',
                'hover:bg-brand-700 transition-colors duration-100',
                opt.value === value && 'text-accent-400 bg-accent-500/5',
              )}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.icon && <span className="size-4 shrink-0">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}