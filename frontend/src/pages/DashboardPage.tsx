import {
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  KeyRound,
  Package,
  Receipt,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import * as analyticsService from '../services/analytics.service'
import * as saleService from '../services/sale.service'
import type { AnalyticsOverview } from '../types/analytics'
import type { SaleListItem } from '../types/sale'
import { formatMoney, formatDateTime, formatNumber } from '../utils/format'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'

const quickLinks = [
  {
    to: '/products',
    title: 'Products',
    description: 'Catalogue, prices, suppliers and low-stock alerts.',
    icon: Package,
  },
  {
    to: '/sales',
    title: 'Sales',
    description: 'Record transactions and review the full sales history.',
    icon: Receipt,
  },
  {
    to: '/inventory',
    title: 'Inventory',
    description: 'Stock levels, deliveries and the movement audit trail.',
    icon: Boxes,
  },
  {
    to: '/customers',
    title: 'Customers',
    description: 'Contact details, spend totals and purchase history.',
    icon: UserRound,
  },
  {
    to: '/suppliers',
    title: 'Suppliers',
    description: 'Contacts, delivery times and linked products.',
    icon: Truck,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [recentSales, setRecentSales] = useState<SaleListItem[]>([])
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      try {
        const [salesResult, summary] = await Promise.all([
          saleService.listSales({ page: 1, limit: 5, sort: 'date', direction: 'desc' }),
          user?.role === 'admin' ? analyticsService.getOverview({}) : Promise.resolve(null),
        ])
        if (active) {
          setRecentSales(salesResult.items)
          setOverview(summary)
          setDataError(null)
        }
      } catch (error: unknown) {
        if (active)
          setDataError(
            error instanceof Error ? error.message : 'Unable to load dashboard data.',
          )
      }
    }
    void loadDashboard()
    return () => {
      active = false
    }
  }, [user?.role])

  if (!user) {
    return null
  }

  const firstName = user.name.split(' ')[0] ?? user.name
  const isAdmin = user.role === 'admin'
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const permissions = isAdmin
    ? [
        'Create, edit and delete products, customers and suppliers',
        'Record sales, receive stock and review inventory movements',
        'Manage every account and change roles',
        'Full access to sales, stock and analytics reports',
      ]
    : [
        'Create and edit products, customers and suppliers',
        'Record sales and receive stock deliveries',
        'View purchase history and inventory movements',
        'No delete permissions or user administration',
      ]

  return (
    <div className="space-y-7">
      <header className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              Business workspace · Live records
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
              Record sales, manage the product catalogue and keep stock accurate.
              Every sale deducts stock and writes an inventory movement in the same
              database transaction.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/sales"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Receipt size={16} aria-hidden />
              Record a sale
            </Link>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition-colors hover:border-ink-300 hover:bg-ink-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Boxes size={16} aria-hidden />
              Review stock
            </Link>
          </div>
        </div>
      </header>

      {dataError && <Alert tone="error">{dataError}</Alert>}

      {overview && (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Business summary"
        >
          <StatCard
            label="Total revenue"
            value={formatMoney(overview.revenue)}
            detail="All recorded sales"
            icon={CircleDollarSign}
            tone="brand"
          />
          <StatCard
            label="Transactions"
            value={formatNumber(overview.transactionCount)}
            detail="Recorded sales"
            icon={Receipt}
            tone="success"
          />
          <StatCard
            label="Customers"
            value={formatNumber(overview.customerCount)}
            detail="Registered customers"
            icon={UserRound}
            tone="accent"
          />
          <StatCard
            label="Low stock"
            value={formatNumber(overview.lowStockCount)}
            detail="Products to review"
            icon={Boxes}
            tone="warning"
          />
        </section>
      )}

      {recentSales.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-900 sm:text-base">
                Recent transactions
              </h2>
              <p className="mt-0.5 text-xs text-ink-500">Latest recorded sales</p>
            </div>
            <Link
              to="/sales"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              View all
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>

          <div className="divide-y divide-ink-100">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">
                    Sale #{sale.id} · {sale.customerName ?? 'Walk-in customer'}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {formatDateTime(sale.saleDate)} · {sale.itemCount} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <p className="text-sm font-semibold text-ink-900">
                    {formatMoney(sale.totalAmount)}
                  </p>
                  <Badge tone="success">Recorded</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <UserRound size={19} aria-hidden />
            </span>
            <h2 className="text-sm font-semibold text-ink-900">Your account</h2>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
                Name
              </dt>
              <dd className="mt-0.5 font-medium text-ink-800">{user.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
                Email
              </dt>
              <dd className="mt-0.5 break-all text-ink-700">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
                Role
              </dt>
              <dd className="mt-1">
                <Badge tone="info">
                  <ShieldCheck size={12} aria-hidden />
                  {user.role}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-ink-500">
              <CalendarDays size={14} aria-hidden />
              Joined {joined}
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-700 ring-1 ring-accent-100">
              <KeyRound size={19} aria-hidden />
            </span>
            <h2 className="text-sm font-semibold text-ink-900">What you can do</h2>
          </div>

          <ul className="mt-5 space-y-3">
            {permissions.map((permission) => (
              <li
                key={permission}
                className="flex items-start gap-3 text-sm text-ink-600"
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-brand-600"
                  aria-hidden
                />
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm md:col-span-2 sm:p-6 xl:col-span-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-600 ring-1 ring-ink-200">
              <ShieldCheck size={19} aria-hidden />
            </span>
            <h2 className="text-sm font-semibold text-ink-900">Session security</h2>
          </div>

          <ul className="mt-5 space-y-3 text-sm text-ink-600">
            <li className="rounded-lg bg-ink-50 px-3 py-2.5">
              Passwords are hashed with <strong className="text-ink-800">bcrypt</strong>;
              the API never returns them.
            </li>
            <li className="rounded-lg bg-ink-50 px-3 py-2.5">
              Requests use an{' '}
              <strong className="text-ink-800">Authorization: Bearer</strong> token
              with a configurable expiry.
            </li>
            <li className="rounded-lg bg-ink-50 px-3 py-2.5">
              Your role is checked against the database on every protected request.
            </li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="quick-links-heading">
        <h2
          id="quick-links-heading"
          className="text-lg font-semibold text-ink-900"
        >
          Business data
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Jump straight into the records that power your sales and reports.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-xl border border-ink-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/30 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-900 group-hover:text-white">
                <item.icon size={19} aria-hidden />
              </span>
              <p className="mt-4 flex items-center justify-between gap-2 text-sm font-semibold text-ink-900">
                {item.title}
                <ArrowRight
                  size={15}
                  aria-hidden
                  className="text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700"
                />
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-brand-100">
              <BarChart3 size={19} aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold text-ink-900">
                Business analytics is ready
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                Review sales trends, forecasts, stock risks and recommended actions.
              </p>
            </div>
          </div>
          <Link
            to="/analytics"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 sm:mt-0 sm:ml-5 sm:shrink-0"
          >
            Open analytics
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
      )}
    </div>
  )
}
