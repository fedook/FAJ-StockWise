import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'

type AlertTone = 'error' | 'success' | 'info'

interface AlertProps {
  tone?: AlertTone
  children: ReactNode
}

const toneStyles: Record<AlertTone, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-brand-200 bg-brand-50 text-brand-900',
}

const iconStyles: Record<AlertTone, string> = {
  error: 'text-rose-600',
  success: 'text-emerald-600',
  info: 'text-brand-600',
}

/** Consistent feedback box for form errors and confirmations. */
export default function Alert({ tone = 'info', children }: AlertProps) {
  const Icon = tone === 'error' ? CircleAlert : tone === 'success' ? CircleCheck : Info

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${toneStyles[tone]}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconStyles[tone]}`} aria-hidden />
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  )
}
