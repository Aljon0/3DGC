import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

// ── Context ────────────────────────────────────────────────────────────────
const TabsCtx = createContext(null)

/**
 * Tabs — accessible tabbed interface.
 *
 * @example
 * <Tabs defaultValue="designs">
 *   <TabsList>
 *     <TabsTrigger value="designs">Designs</TabsTrigger>
 *     <TabsTrigger value="elements">Elements</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="designs">...</TabsContent>
 *   <TabsContent value="elements">...</TabsContent>
 * </Tabs>
 */
export function Tabs({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
}) {
  const [internal, setInternal] = useState(defaultValue ?? '')
  const active   = value ?? internal
  const setActive = onValueChange ?? setInternal

  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      <div className={cn('flex flex-col', className)}>
        {children}
      </div>
    </TabsCtx.Provider>
  )
}

export function TabsList({ children, className, variant = 'line' }) {

  const variants = {
    // Underline style
    line: cn(
      'flex border-b border-brand-700 gap-0',
    ),
    // Pill/segment style
    pill: cn(
      'flex gap-1 p-1',
      'bg-brand-800 rounded-xl border border-brand-700',
      'w-fit',
    ),
  }

  return (
    <div
      role="tablist"
      className={cn(variants[variant], className)}
      data-variant={variant}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  children,
  value,
  className,
  icon,
  badge,
}) {
  const { active, setActive } = useContext(TabsCtx)
  const isActive = active === value

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn(
        // Base
        'relative flex items-center gap-2 font-sans text-sm',
        'transition-all duration-150 whitespace-nowrap',
        'focus:outline-none',

        // Line variant (default feel)
        'px-4 py-2.5 -mb-px border-b-2',
        isActive
          ? 'border-accent-500 text-accent-400 font-medium'
          : 'border-transparent text-brand-400 hover:text-brand-200 hover:border-brand-500',

        className,
      )}
    >
      {icon && <span className="size-4 shrink-0">{icon}</span>}
      {children}
      {badge != null && (
        <span className={cn(
          'ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium',
          isActive
            ? 'bg-accent-500/20 text-accent-400'
            : 'bg-brand-700 text-brand-400',
        )}>
          {badge}
        </span>
      )}
    </button>
  )
}

export function TabsContent({ children, value, className }) {
  const { active } = useContext(TabsCtx)
  if (active !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  )
}