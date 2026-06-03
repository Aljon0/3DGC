import { AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import Modal from './Modal'
import Button from '@/components/ui/Button'

/**
 * ConfirmDialog — reusable confirmation prompt.
 * Variants: danger, warning, info, success
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   description="This action cannot be undone."
 *   variant="danger"
 *   confirmLabel="Yes, Delete"
 *   loading={isLoading}
 * />
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title        = 'Are you sure?',
  description  = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
}) {

  const config = {
    danger: {
      icon:        <Trash2 className="size-6" />,
      iconBg:      'bg-red-500/10 text-red-400 border border-red-500/20',
      confirmVariant: 'danger',
    },
    warning: {
      icon:        <AlertTriangle className="size-6" />,
      iconBg:      'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      confirmVariant: 'solid',
    },
    info: {
      icon:        <Info className="size-6" />,
      iconBg:      'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      confirmVariant: 'solid',
    },
    success: {
      icon:        <CheckCircle className="size-6" />,
      iconBg:      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      confirmVariant: 'solid',
    },
  }

  const c = config[variant] ?? config.danger

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      closable={!loading}
      footer={
        <>
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={c.confirmVariant}
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">

        {/* Icon */}
        <div className={cn(
          'size-14 rounded-2xl flex items-center justify-center',
          c.iconBg,
        )}>
          {c.icon}
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="font-display text-base font-semibold text-brand-100">
            {title}
          </h3>
          <p className="text-sm text-brand-400 font-sans leading-relaxed max-w-xs">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  )
}