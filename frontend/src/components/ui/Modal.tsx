import { useEffect, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

/**
 * Accessible dialog used by every create/edit form and the purchase history.
 * Escape and the backdrop close it; the page behind cannot scroll while open.
 */
export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-950/50 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <div className="relative flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative w-full ${
            size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg'
          } max-h-[92vh] overflow-y-auto rounded-t-2xl border border-ink-200 bg-white shadow-2xl sm:rounded-2xl`}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold text-ink-900 sm:text-lg">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:outline-none"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="px-5 py-5 sm:px-6">{children}</div>

          {footer && (
            <div className="border-t border-ink-100 bg-ink-50/60 px-5 py-4 sm:px-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
