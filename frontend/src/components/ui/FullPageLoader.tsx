import { LoaderCircle } from 'lucide-react'
import Logo from '../brand/Logo'

/** Full-screen loading state used while the stored token is validated. */
export default function FullPageLoader({
  label = 'Loading...',
}: {
  label?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 text-ink-600"
      >
        <Logo size="md" />
        <div className="flex items-center gap-2.5">
          <LoaderCircle size={20} className="animate-spin text-brand-700" aria-hidden />
          <p className="text-sm font-medium">{label}</p>
        </div>
      </div>
    </div>
  )
}
