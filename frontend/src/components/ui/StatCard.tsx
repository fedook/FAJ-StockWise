import type { LucideIcon } from 'lucide-react'

type StatTone = 'brand' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral'

const toneStyles: Record<StatTone, { icon: string; value: string }> = {
  brand: { icon: 'bg-brand-50 text-brand-700 ring-brand-100', value: 'text-ink-900' },
  success: {
    icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    value: 'text-ink-900',
  },
  warning: {
    icon: 'bg-accent-50 text-accent-700 ring-accent-100',
    value: 'text-accent-800',
  },
  danger: { icon: 'bg-rose-50 text-rose-700 ring-rose-100', value: 'text-rose-800' },
  accent: {
    icon: 'bg-accent-50 text-accent-700 ring-accent-100',
    value: 'text-ink-900',
  },
  neutral: { icon: 'bg-ink-100 text-ink-600 ring-ink-200', value: 'text-ink-900' },
}

interface StatCardProps {
  label: string
  value: string
  detail?: string
  icon: LucideIcon
  tone?: StatTone
}

/** Compact KPI card shared by the dashboard and analytics pages. */
export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'brand',
}: StatCardProps) {
  const styles = toneStyles[tone]

  return (
    <article className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-500 sm:text-sm">{label}</p>
          <p
            className={`mt-2 truncate text-xl font-semibold tracking-tight sm:text-2xl ${styles.value}`}
          >
            {value}
          </p>
          {detail && (
            <p className="mt-1 text-[11px] leading-relaxed text-ink-500 sm:text-xs">
              {detail}
            </p>
          )}
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${styles.icon}`}
        >
          <Icon size={19} aria-hidden />
        </span>
      </div>
    </article>
  )
}
