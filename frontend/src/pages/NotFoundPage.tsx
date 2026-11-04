import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-5">
      <div className="w-full max-w-md rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-xl shadow-brand-950/5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900">404</h1>
        <p className="mt-2 text-sm text-ink-600">
          The page you are looking for does not exist yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to home
        </Link>
      </div>
    </main>
  )
}
