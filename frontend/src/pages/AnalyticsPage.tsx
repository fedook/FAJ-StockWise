import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ChartNoAxesCombined,
  CircleDollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { getErrorMessage } from '../utils/getErrorMessage'
import { formatMoney, formatNumber } from '../utils/format'
import * as analyticsService from '../services/analytics.service'
import type {
  AnalyticsOverview,
  CategoryPerformance,
  ForecastResponse,
  InventorySummary,
  LowestProduct,
  Recommendation,
  SalesTrendPoint,
  TopProduct,
} from '../types/analytics'

const currencyTick = (value: number) =>
  `₱${Number(value).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
const chartColors = ['#122f4c', '#24527e', '#3a80b8', '#5f9dce', '#d98b2b', '#e5a44c']
const gridColor = '#e2e8f0'
const tickColor = '#64748b'
const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(10,31,52,0.08)',
  fontSize: 12,
}

function defaultRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  const localDate = (date: Date) => {
    const offset = date.getTimezoneOffset()
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
  }
  return { from: localDate(from), to: localDate(to) }
}

function Panel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string
  subtitle: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-ink-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-ink-900 sm:text-base">{title}</h2>
        <p className="mt-1 text-xs text-ink-500">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

export default function AnalyticsPage() {
  const initialRange = useMemo(() => defaultRange(), [])
  const [from, setFrom] = useState(initialRange.from)
  const [to, setTo] = useState(initialRange.to)
  const [appliedFrom, setAppliedFrom] = useState(initialRange.from)
  const [appliedTo, setAppliedTo] = useState(initialRange.to)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [trend, setTrend] = useState<SalesTrendPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowestProducts, setLowestProducts] = useState<LowestProduct[]>([])
  const [categories, setCategories] = useState<CategoryPerformance[]>([])
  const [inventory, setInventory] = useState<InventorySummary | null>(null)
  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (appliedFrom && appliedTo && appliedFrom > appliedTo) {
      setError('The start date cannot be after the end date.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const filters = { from: appliedFrom || undefined, to: appliedTo || undefined }
      const [
        overviewData,
        trendData,
        productsData,
        lowestData,
        categoryData,
        inventoryData,
        forecastData,
        recommendationData,
      ] = await Promise.all([
        analyticsService.getOverview(filters),
        analyticsService.getSalesTrend(filters),
        analyticsService.getTopProducts(filters),
        analyticsService.getLowestProducts(filters),
        analyticsService.getCategoryPerformance(filters),
        analyticsService.getInventorySummary(),
        analyticsService.getForecast(6),
        analyticsService.getRecommendations(),
      ])
      setOverview(overviewData)
      setTrend(trendData)
      setTopProducts(productsData)
      setLowestProducts(lowestData)
      setCategories(categoryData)
      setInventory(inventoryData)
      setForecast(forecastData)
      setRecommendations(recommendationData)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [appliedFrom, appliedTo])

  useEffect(() => {
    // Analytics is fetched when the applied date range changes.
    // oxlint-disable-next-line react/set-state-in-effect
    void loadAnalytics()
  }, [loadAnalytics])

  const peakSalesMonth = trend.reduce<SalesTrendPoint | null>(
    (peak, item) => (!peak || item.revenue > peak.revenue ? item : peak),
    null,
  )

  const forecastChart = forecast
    ? [
        ...forecast.revenue.historical.map((item) => ({
          month: item.label,
          revenue: item.revenue,
          type: 'Historical',
        })),
        {
          month: forecast.revenue.forecastLabel,
          revenue: forecast.revenue.predictedRevenue,
          type: 'Forecast',
        },
      ]
    : []

  return (
    <div className="space-y-7">
      <PageHeader
        title="Business analytics"
        description="Understand sales performance, estimate demand and turn inventory data into practical actions."
        badge={{ icon: ChartNoAxesCombined, label: 'Live database reports' }}
        actions={
          <Button
            variant="secondary"
            onClick={() => void loadAnalytics()}
            loading={loading}
          >
            <RefreshCw size={15} aria-hidden />
            Refresh
          </Button>
        }
      />

      <section className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="analytics-from"
              className="mb-1.5 block text-xs font-medium text-ink-600"
            >
              From
            </label>
            <input
              id="analytics-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm text-ink-900 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="analytics-to"
              className="mb-1.5 block text-xs font-medium text-ink-600"
            >
              To
            </label>
            <input
              id="analytics-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm text-ink-900 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <Button
            onClick={() => {
              setAppliedFrom(from)
              setAppliedTo(to)
            }}
            loading={loading}
          >
            Apply date range
          </Button>
        </div>
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      {loading && !overview ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center text-sm text-ink-500">
          Loading analytics from your database…
        </div>
      ) : null}

      {overview && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total revenue"
              value={formatMoney(overview.revenue)}
              detail="For selected sales period"
              icon={CircleDollarSign}
              tone="brand"
            />
            <StatCard
              label="Transactions"
              value={formatNumber(overview.transactionCount)}
              detail="Recorded sales"
              icon={ShoppingCart}
              tone="success"
            />
            <StatCard
              label="Average order value"
              value={formatMoney(overview.averageOrderValue)}
              detail="Revenue divided by transactions"
              icon={ChartNoAxesCombined}
              tone="accent"
            />
            <StatCard
              label="Products"
              value={formatNumber(overview.productCount)}
              detail={`${formatNumber(overview.inventoryUnits)} units in stock`}
              icon={Package}
              tone="neutral"
            />
            <StatCard
              label="Customers"
              value={formatNumber(overview.customerCount)}
              detail="Registered customer records"
              icon={Users}
              tone="success"
            />
            <StatCard
              label="Low-stock products"
              value={formatNumber(overview.lowStockCount)}
              detail="At or below reorder level"
              icon={AlertTriangle}
              tone="warning"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <Panel
              title="Monthly sales performance"
              subtitle="Revenue and transaction activity for the selected date range"
            >
              <div className="h-72 w-full">
                {trend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trend}
                      margin={{ top: 8, right: 12, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={gridColor}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 11, fill: tickColor }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={currencyTick}
                        tick={{ fontSize: 11, fill: tickColor }}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                      />
                      <Tooltip
                        formatter={(value) => formatMoney(Number(value))}
                        contentStyle={tooltipStyle}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#24527e"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#24527e' }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No sales recorded in this date range." />
                )}
              </div>
              {peakSalesMonth && (
                <p className="mt-2 text-xs text-ink-500">
                  Highest revenue month in this range:{' '}
                  <strong className="text-ink-700">{peakSalesMonth.period}</strong> ·{' '}
                  {formatMoney(peakSalesMonth.revenue)}
                </p>
              )}
            </Panel>

            <Panel
              title="Revenue by category"
              subtitle="Share of sales revenue across product categories"
            >
              <div className="h-72 w-full">
                {categories.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="revenue"
                        nameKey="category"
                        innerRadius={58}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {categories.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatMoney(Number(value))}
                        contentStyle={tooltipStyle}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: 11, color: tickColor }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Category data will appear after sales are recorded." />
                )}
              </div>
            </Panel>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <Panel
              title="Top-selling products"
              subtitle="Top 10 products ranked by units sold"
            >
              {topProducts.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 12, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke={gridColor}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: tickColor }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="productName"
                        width={120}
                        tick={{ fontSize: 11, fill: tickColor }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                      <Bar
                        dataKey="unitsSold"
                        name="Units sold"
                        fill="#3a80b8"
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart message="No product sales found for this period." />
              )}
            </Panel>

            <Panel
              title="Inventory health"
              subtitle="Current stock position across the catalogue"
            >
              {inventory && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-ink-50 p-3 ring-1 ring-ink-100">
                      <p className="text-xl font-semibold text-ink-900">
                        {inventory.totalProducts}
                      </p>
                      <p className="mt-1 text-[11px] text-ink-500">Products</p>
                    </div>
                    <div className="rounded-lg bg-accent-50 p-3 ring-1 ring-accent-100">
                      <p className="text-xl font-semibold text-accent-800">
                        {inventory.lowStockCount}
                      </p>
                      <p className="mt-1 text-[11px] text-accent-700">Low stock</p>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-3 ring-1 ring-rose-100">
                      <p className="text-xl font-semibold text-rose-800">
                        {inventory.outOfStockCount}
                      </p>
                      <p className="mt-1 text-[11px] text-rose-700">Out of stock</p>
                    </div>
                  </div>

                  {inventory.lowStock.length ? (
                    <div className="divide-y divide-ink-100">
                      {inventory.lowStock.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink-800">
                              {item.name}
                            </p>
                            <p className="text-xs text-ink-500">{item.category}</p>
                          </div>
                          <Badge tone={item.stock === 0 ? 'danger' : 'warning'}>
                            {item.stock} / {item.reorderLevel}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-100">
                      All products are above their reorder levels.
                    </p>
                  )}
                </div>
              )}
            </Panel>
          </section>

          <Panel
            title="Lowest-selling products"
            subtitle="Products with the fewest units sold in the selected period, including products with no sales"
          >
            {lowestProducts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                      <th className="px-2 pb-2.5 font-semibold">Product</th>
                      <th className="px-2 pb-2.5 font-semibold">Category</th>
                      <th className="px-2 pb-2.5 text-right font-semibold">
                        Units sold
                      </th>
                      <th className="px-2 pb-2.5 text-right font-semibold">
                        Current stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowestProducts.map((item) => (
                      <tr
                        key={item.productId}
                        className="border-b border-ink-100 transition-colors last:border-0 hover:bg-brand-50/30"
                      >
                        <td className="px-2 py-3 font-medium text-ink-800">
                          {item.productName}
                        </td>
                        <td className="px-2 py-3 text-ink-500">{item.category}</td>
                        <td className="px-2 py-3 text-right tabular-nums text-ink-700">
                          {formatNumber(item.unitsSold)}
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums text-ink-700">
                          {formatNumber(item.stock)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyChart message="No products are available for this report." />
            )}
          </Panel>

          <section className="grid gap-5 xl:grid-cols-2">
            <Panel
              title="Next-month revenue forecast"
              subtitle="Simple moving average based on the last three completed months"
            >
              {forecast && (
                <>
                  <div className="mb-4 rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
                    <p className="text-xs font-medium text-brand-700">
                      Estimated revenue · {forecast.revenue.forecastLabel}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-brand-950">
                      {formatMoney(forecast.revenue.predictedRevenue)}
                    </p>
                    <p className="mt-1 text-xs text-brand-700">
                      {forecast.revenue.method}
                    </p>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={forecastChart}
                        margin={{ top: 8, right: 8, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={gridColor}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: tickColor }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={currencyTick}
                          tick={{ fontSize: 10, fill: tickColor }}
                          axisLine={false}
                          tickLine={false}
                          width={65}
                        />
                        <Tooltip
                          formatter={(value) => formatMoney(Number(value))}
                          contentStyle={tooltipStyle}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="revenue" name="Revenue" radius={[5, 5, 0, 0]}>
                          {forecastChart.map((entry, index) => (
                            <Cell
                              key={`${entry.month}-${index}`}
                              fill={entry.type === 'Forecast' ? '#d98b2b' : '#24527e'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-ink-500">
                    {forecast.revenue.assumptions.map((assumption) => (
                      <li key={assumption}>• {assumption}</li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>

            <Panel
              title="Demand outlook"
              subtitle="Products with recent demand or stock at/below reorder level"
            >
              {forecast?.productDemand.length ? (
                <div className="divide-y divide-ink-100">
                  {forecast.productDemand.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-ink-500">
                          {item.unitsSold30Days} sold in 30 days ·{' '}
                          {item.averageDailyDemand.toFixed(2)} units/day
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-800">
                          {item.estimatedDaysUntilStockout === null
                            ? '—'
                            : `${item.estimatedDaysUntilStockout} days`}
                        </p>
                        <p className="text-[11px] text-ink-500">stock cover</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChart message="No recent product demand to forecast yet." />
              )}
            </Panel>
          </section>

          <Panel
            title="Recommended actions"
            subtitle="Rules-based recommendations calculated from real stock, sales velocity and supplier lead times"
          >
            {recommendations.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.map((item) => (
                  <article
                    key={`${item.productId}-${item.type}`}
                    className="rounded-xl border border-ink-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">
                          {item.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {item.category}
                          {item.supplierName ? ` · ${item.supplierName}` : ''}
                        </p>
                      </div>
                      <Badge
                        tone={
                          item.priority === 'high'
                            ? 'danger'
                            : item.priority === 'medium'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {item.priority} priority
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">
                      {item.reason}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Badge tone="neutral">{item.type.replace('-', ' ')}</Badge>
                      {item.suggestedQuantity !== undefined && (
                        <span className="text-xs font-semibold text-brand-800">
                          Order {formatNumber(item.suggestedQuantity)} units
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-100">
                <Sparkles size={18} aria-hidden />
                No immediate reorder or slow-moving product actions were identified.
              </div>
            )}
          </Panel>

          <p className="text-xs leading-relaxed text-ink-400">
            Revenue reports include all recorded sales because this database does not
            currently have a sale-status field. Inventory cost value uses current
            purchase cost and current stock, not historical accounting valuation.
          </p>
        </>
      )}
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-xl bg-ink-50 px-6 text-center text-sm text-ink-500">
      {message}
    </div>
  )
}
