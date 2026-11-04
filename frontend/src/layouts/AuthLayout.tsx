
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Boxes,
  ChartNoAxesCombined,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react'
import Logo from '../components/brand/Logo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

const highlights = [
  { icon: Boxes, label: 'Inventory control' },
  { icon: ShoppingCart, label: 'Sales tracking' },
  { icon: ChartNoAxesCombined, label: 'Business insights' },
  { icon: ShieldCheck, label: 'Protected access' },
]

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-brand-950 p-10 text-white lg:flex xl:p-14">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(58,128,184,0.28),transparent_45%)]"
        />
        <div
          aria-hidden
          className="absolute -right-24 -bottom-32 h-96 w-96 rounded-full border border-white/5"
        />

        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-lg shadow-brand-950/20 focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:outline-none"
          >
            <Logo size="sm" />
          </Link>

          <div className="mt-14 max-w-lg">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-brand-100">
              Your business workspace
            </p>

            <h2 className="mt-6 text-4xl leading-tight font-semibold tracking-tight xl:text-[2.75rem]">
              Run your store with{' '}
              <span className="text-accent-300">more clarity.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-brand-100/80">
              Keep sales, inventory and the people you work with connected in one
              dependable system — built around the records you already trust.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {highlights.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-medium text-brand-50"
                >
                  <Icon size={17} className="text-accent-300" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 pt-6">
          <p className="text-xs text-brand-100/60">
            FAJ Stockwise · Smarter stock. Better business.
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:justify-center lg:py-12">
        <div className="mx-auto w-full max-w-md">

          {/* Mobile navigation */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="inline-flex items-center">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="rounded-2xl border border-ink-200/80 bg-white p-6 shadow-sm shadow-brand-950/5 sm:p-8">

            {/* Back to home */}
            <Link
              to="/"
              className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
            >
              <ArrowLeft size={18} aria-hidden />
              Back to home
            </Link>

            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {subtitle}
            </p>

            <div className="mt-6">{children}</div>

            <div className="mt-6 border-t border-ink-100 pt-5 text-center text-sm text-ink-500">
              {footer}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-ink-400">
            Secure access · Role-based permissions · Real-time records
          </p>
        </div>
      </main>
    </div>
  )
}
