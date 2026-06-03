import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SlideOver — right-side panel for order details, forms, etc.
 * Slides in from the right on desktop; full-screen on mobile.
 *
 * @example
 * <SlideOver
 *   open={isOpen}
 *   onClose={() => setOpen(false)}
 *   title="Order Details"
 * >
 *   <OrderDetailSlideOver orderId={id} />
 * </SlideOver>
 */
export default function SlideOver({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width     = 'md',   // 'sm' | 'md' | 'lg' | 'xl'
  closable  = true,
  className,
}) {

  // ── Escape key ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape' && closable) onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, closable, onClose])

  // ── Body scroll lock ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="slideover-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => closable && onClose()}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-hidden
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            <motion.div
              key="slideover-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                'pointer-events-auto',
                'relative flex flex-col h-full w-full',
                'bg-brand-900 border-l border-brand-700',
                'shadow-float',
                widths[width],
                className,
              )}
              role="dialog"
              aria-modal="true"
            >

              {/* Header */}
              <div className="flex items-start justify-between gap-4
                              px-6 py-5 border-b border-brand-800 shrink-0">
                <div>
                  {title && (
                    <h2 className="font-display text-base font-semibold text-brand-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-brand-400 mt-0.5 font-sans">
                      {description}
                    </p>
                  )}
                </div>

                {closable && (
                  <button
                    onClick={onClose}
                    className="size-7 flex items-center justify-center rounded-lg
                               text-brand-500 hover:text-brand-200 hover:bg-brand-800
                               transition-colors duration-150 shrink-0 -mt-0.5 -mr-1"
                    aria-label="Close panel"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-brand-800 shrink-0
                                flex items-center justify-end gap-3 flex-wrap">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}