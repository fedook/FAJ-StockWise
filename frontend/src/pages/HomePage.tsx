import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/brand/Logo'
import { useAuth } from '../hooks/useAuth'

const features = [
  {
    icon: Boxes,
    title: 'Inventory control',
    text: 'Track product quantities, stock movements and the items that need attention before they run out.',
  },
  {
    icon: ShoppingCart,
    title: 'Sales made simple',
    text: 'Record transactions while stock, totals and customer history stay connected automatically.',
  },
  {
    icon: Users,
    title: 'Customer & supplier records',
    text: 'Keep the people behind every order organised in one dependable workspace.',
  },
  {
    icon: BarChart3,
    title: 'Actionable insights',
    text: 'Understand sales trends, stock risk and recommended actions using your real recorded data.',
  },
]

const benefits = [
  {
    title: 'One source of truth',
    text: 'Sales, stock and purchase history are written in the same transaction, so the numbers always agree.',
  },
  {
    title: 'Role-aware by design',
    text: 'Administrators manage accounts and analytics. Staff get exactly the workspace they need to serve customers.',
  },
  {
    title: 'Built for daily work',
    text: 'Fast search, clear stock alerts and focused forms keep routine tasks quick and predictable.',
  },
  {
    title: 'No guesswork',
    text: 'Dashboard figures come straight from the database — never mocked or hardcoded.',
  },
]

const previewStats = [
  { label: 'Total sales', value: '₱48,250', note: '+12.8%' },
  { label: 'Orders', value: '128', note: '+8.2%' },
  { label: 'Products', value: '342', note: 'Active' },
  { label: 'Low stock', value: '06', note: 'Needs review' },
]

const previewNav = [
  { icon: BarChart3, label: 'Overview' },
  { icon: PackageCheck, label: 'Products' },
  { icon: ShoppingCart, label: 'Sales' },
  { icon: Boxes, label: 'Inventory' },
  { icon: Users, label: 'Customers' },
  { icon: Truck, label: 'Suppliers' },
]

const currentYear = new Date().getFullYear()

/**
 * Marketing page with a clearly labelled illustrative dashboard preview.
 * All numbers inside the preview are sample values, not real business data.
 */
function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl shadow-brand-950/10">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size="sm" />
            <span className="hidden h-5 w-px shrink-0 bg-ink-200 sm:block" />
            <p className="hidden truncate text-[10px] text-ink-400 sm:block">
              Business overview
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100 ring-inset">
            Workspace
          </span>
        </div>

        <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[132px_1fr]">
          <aside className="space-y-1.5 border-r border-ink-100 bg-ink-50/70 p-2.5 sm:p-3">
            {previewNav.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] ${
                  index === 0
                    ? 'bg-brand-950 font-semibold text-white'
                    : 'text-ink-500'
                }`}
              >
                <Icon size={13} aria-hidden />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </aside>

          <div className="min-w-0 p-3 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink-900 sm:text-base">
                  Good morning
                </p>
                <p className="mt-0.5 text-[10px] text-ink-400">
                  Here&apos;s what&apos;s happening in your store.
                </p>
              </div>
              <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[9px] font-semibold text-accent-700 ring-1 ring-accent-200 ring-inset">
                Sample
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {previewStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-ink-100 p-2.5 sm:p-3"
                >
                  <p className="text-[9px] text-ink-400">{stat.label}</p>
                  <p className="mt-1 text-base font-semibold text-ink-900 sm:text-lg">
                    {stat.value}
                  </p>
                  <p
                    className={`mt-1 text-[9px] ${
                      index === 3 ? 'text-accent-700' : 'text-brand-600'
                    }`}
                  >
                    {stat.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-ink-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-ink-700">
                    Sales activity
                  </p>
                  <span className="text-[9px] text-ink-400">This week</span>
                </div>
                <div className="mt-3 flex h-20 items-end gap-1.5">
                  {[38, 54, 44, 68, 58, 82, 72].map((height, index) => (
                    <div
                      key={index}
                      style={{ height: `${height}%` }}
                      className={`flex-1 rounded-t ${
                        index === 5 ? 'bg-accent-400' : 'bg-brand-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-ink-100 p-3">
                <p className="text-[10px] font-semibold text-ink-700">
                  Recent activity
                </p>
                <ul className="mt-2 space-y-2">
                  {['New sale recorded', 'Stock received', 'Customer added'].map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-center gap-1.5 text-[9px] text-ink-500"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-100 bg-ink-50/80 px-4 py-2.5 text-center text-[10px] font-medium text-ink-500">
          Illustrative preview only — sample values, not real business data.
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'

  return (
    <div className="min-h-screen bg-surface text-ink-800">
      <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-600 md:flex">
            <a href="#features" className="transition-colors hover:text-brand-800">
              Features
            </a>
            <a href="#benefits" className="transition-colors hover:text-brand-800">
              Why Stockwise
            </a>
            <a href="#preview" className="transition-colors hover:text-brand-800">
              Preview
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Open dashboard
                <ArrowRight size={15} aria-hidden />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:inline-flex"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Get started
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-ink-200/60">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-sm">
                <Sparkles size={14} className="text-accent-500" aria-hidden />
                A clearer way to run your business
              </p>

              <h1 className="mt-6 max-w-xl text-4xl leading-[1.1] font-semibold tracking-tight text-ink-900 sm:text-5xl">
                Sales and inventory,{' '}
                <span className="text-brand-700">finally in step.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-ink-600">
                FAJ Stockwise brings products, sales, stock movements, customers and
                suppliers into one reliable workspace — so every decision starts
                from the same accurate records.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={signedIn ? '/dashboard' : '/register'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {signedIn ? 'Open your dashboard' : 'Create your workspace'}
                  <ArrowRight size={16} aria-hidden />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 shadow-sm transition-colors hover:border-ink-300 hover:bg-ink-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Explore features
                  <ChevronRight size={16} aria-hidden />
                </a>
              </div>

              <ul className="mt-8 grid gap-2.5 text-sm text-ink-600 sm:grid-cols-2">
                {[
                  'Real API data only',
                  'Role-based access',
                  'Stock audit trail',
                  'Responsive on every device',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Check size={12} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div id="preview" className="scroll-mt-24">
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 border-b border-ink-200/60 bg-white"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">
                Everything connected
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                The essentials, without the clutter
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink-600">
                Each part of the workspace updates the others, so staff spend less
                time reconciling records and more time serving customers.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-200"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <Icon size={19} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-ink-900">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="scroll-mt-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">
                Why Stockwise
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                Confidence in every record
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-ink-600">
                The system is built around the way small businesses actually work:
                quick counter sales, incoming deliveries, and a clear view of what
                needs attention next.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm">
                  <ShieldCheck size={15} className="text-brand-700" aria-hidden />
                  Secure by default
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm">
                  <CircleDollarSign
                    size={15}
                    className="text-accent-600"
                    aria-hidden
                  />
                  Accurate totals
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm">
                  <Store size={15} className="text-brand-700" aria-hidden />
                  Built for daily use
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-50 text-accent-700 ring-1 ring-accent-200">
                    <Check size={14} aria-hidden />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-ink-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                    {benefit.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <p className="text-xs text-ink-500">
              Smarter stock. Better business.
            </p>
          </div>
          <p className="text-xs text-ink-400">
            © {currentYear} FAJ Stockwise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
