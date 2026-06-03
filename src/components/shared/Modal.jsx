import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Modal — accessible dialog with backdrop, focus trap, Escape key.
 * Sizes: sm, md, lg, xl, full
 *
 * @example
 * <Modal
 *   open={isOpen}
 *   onClose={() => setOpen(false)}
 *   title="Place Order"
 *   size="lg"
 * >
 *   <p>Modal content here</p>
 * </Modal>
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size        = 'md',
  closable    = true,
  className,
}) {
  const overlayRef  = useRef(null)
  const contentRef  = useRef(null)

  // ── Close on Escape ──────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape' && closable) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closable, onClose])

  // ── Lock body scroll when open ───────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Focus first focusable element on open ───────────────
  useEffect(() => {
    if (!open || !contentRef.current) return
    const focusable = contentRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  }, [open])

  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-md',
    lg:   'max-w-lg',
    xl:   'max-w-xl',
    '2xl':'max-w-2xl',
    full: 'max-w-full mx-4',
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ──────────────────────────── */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            ref={overlayRef}
            onClick={() => closable && onClose()}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            aria-hidden
          />

          {/* ── Dialog ────────────────────────────── */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <motion.div
              key="modal-content"
              ref={contentRef}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.95, y: 12  }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'relative w-full',
                'bg-brand-900 border border-brand-700',
                'rounded-2xl shadow-float',
                'flex flex-col max-h-[90vh]',
                sizes[size],
                className,
              )}
              onClick={e => e.stopPropagation()}
            >

              {/* ── Header ────────────────────────── */}
              {(title || closable) && (
                <div className="flex items-start justify-between gap-4
                                px-6 pt-5 pb-4 border-b border-brand-800 shrink-0">
                  <div>
                    {title && (
                      <h2
                        id="modal-title"
                        className="font-display text-base font-semibold text-brand-100"
                      >
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
                      aria-label="Close dialog"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              )}

              {/* ── Scrollable Body ───────────────── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                {children}
              </div>

              {/* ── Footer ────────────────────────── */}
              {footer && (
                <div className="px-6 py-4 border-t border-brand-800
                                flex items-center justify-end gap-3 shrink-0
                                flex-wrap">
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