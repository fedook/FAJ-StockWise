import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Used as aria-label and title, so screen readers get a real action name. */
  label: string
  tone?: 'default' | 'danger'
  children: ReactNode
}

/** Compact icon-only button used in table action columns. */
export default function IconButton({
  label,
  tone = 'default',
  children,
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  const toneStyles =
    tone === 'danger'
      ? 'text-ink-500 hover:bg-rose-50 hover:text-rose-700'
      : 'text-ink-500 hover:bg-brand-50 hover:text-brand-800'

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${toneStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
