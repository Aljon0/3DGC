import { cn } from '@/lib/utils'

/**
 * Table primitives — composable table components.
 * Use with DataTable for paginated/searchable tables.
 */

export function Table({ children, className }) {
  return (
    // Horizontally scrollable wrapper for mobile
    <div className="w-full overflow-x-auto rounded-xl border border-brand-700">
      <table className={cn(
        'w-full border-collapse text-sm font-sans',
        'min-w-150',  // prevents collapse on mobile
        className,
      )}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children, className }) {
  return (
    <thead className={cn(
      'bg-brand-800/80 border-b border-brand-700',
      className,
    )}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }) {
  return (
    <tbody className={cn(
      'divide-y divide-brand-800',
      className,
    )}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, onClick, selected }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors duration-100',
        onClick && 'cursor-pointer hover:bg-brand-800/50',
        selected && 'bg-accent-500/5',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function TableHeader({ children, className, sortable, sorted, asc, onSort }) {
  return (
    <th
      onClick={sortable ? onSort : undefined}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold',
        'text-brand-400 uppercase tracking-wider',
        'whitespace-nowrap',
        sortable && 'cursor-pointer select-none hover:text-brand-200',
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        {children}
        {sortable && (
          <span className={cn(
            'text-brand-600 transition-colors',
            sorted && 'text-accent-400',
          )}>
            {sorted ? (asc ? '↑' : '↓') : '↕'}
          </span>
        )}
      </span>
    </th>
  )
}

export function TableCell({ children, className, muted }) {
  return (
    <td className={cn(
      'px-4 py-3 whitespace-nowrap',
      muted ? 'text-brand-400' : 'text-brand-200',
      className,
    )}>
      {children}
    </td>
  )
}

export function TableFooter({ children, className }) {
  return (
    <tfoot className={cn(
      'border-t border-brand-700 bg-brand-800/50',
      className,
    )}>
      {children}
    </tfoot>
  )
}