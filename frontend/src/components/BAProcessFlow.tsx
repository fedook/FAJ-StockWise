import { ArrowRight, BarChart3, Lightbulb, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import Badge from './ui/Badge'
import { formatMoney, formatNumber } from '../utils/format'
import type {
  AnalyticsOverview,
  ForecastResponse,
  InventorySummary,
  Recommendation,
  TopProduct,
} from '../types/analytics'

interface Props {
  overview: AnalyticsOverview
  topProducts: TopProduct[]
  inventory: InventorySummary | null
  forecast: ForecastResponse | null
  recommendations: Recommendation[]
}

function Step({
  number,
  title,
  question,
  icon,
  tone,
  children,
}: {
  number: number
  title: string
  question: string
  icon: ReactNode
  tone: string
  children: ReactNode
}) {
  return (
    <div className="flex-1 rounded-xl border border-ink-200 bg-ink-50 p-4">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${tone}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-ink-500 uppercase">
            Step {number}
          </p>
          <p className="text-sm font-semibold text-ink-900">{title}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-500 italic">{question}</p>
      <div className="mt-3 space-y-1.5 text-sm text-ink-700">{children}</div>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-ink-400 xl:px-1">
      <ArrowRight size={20} aria-hidden className="rotate-90 xl:rotate-0" />
    </div>
  )
}

/**
 * Shows how Descriptive -> Predictive -> Prescriptive analytics connect,
 * using one real product from the live database as a worked example.
 */
export default function BAProcessFlow({
  overview,
  topProducts,
  inventory,
  forecast,
  recommendations,
}: Props) {
  const demand = forecast?.productDemand ?? []

  // Pick a case-study product: a recommended product that also has demand data,
  // otherwise the first recommendation, otherwise the fastest-moving product.
  const featuredRec =
    recommendations.find(
      (rec) =>
        rec.type !== 'slow-moving' &&
        demand.some((item) => item.id === rec.productId && item.unitsSold30Days > 0),
    ) ?? recommendations.find((rec) => rec.type !== 'slow-moving')

  const featuredDemand =
    (featuredRec && demand.find((item) => item.id === featuredRec.productId)) ??
    demand[0]

  const productName = featuredRec?.productName ?? featuredDemand?.name
  const topProduct = topProducts[0]

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink-900 sm:text-base">
          Business analytics process
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          How the three analytics steps connect, using live data from this
          database.
          {productName ? ` Worked example: ${productName}.` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-2 xl:flex-row xl:items-stretch">
        <Step
          number={1}
          title="Descriptive"
          question="What happened?"
          icon={<BarChart3 size={16} aria-hidden />}
          tone="bg-brand-700"
        >
          <p>
            Revenue: <strong>{formatMoney(overview.revenue)}</strong> from{' '}
            {formatNumber(overview.transactionCount)} transactions.
          </p>
          {topProduct && (
            <p>
              Best seller: <strong>{topProduct.productName}</strong> (
              {formatNumber(topProduct.unitsSold)} units).
            </p>
          )}
          {featuredDemand && (
            <p>
              {featuredDemand.name}: sold{' '}
              <strong>{formatNumber(featuredDemand.unitsSold30Days)}</strong>{' '}
              units in the last 30 days, with{' '}
              <strong>{formatNumber(featuredDemand.stock)}</strong> in stock.
            </p>
          )}
          {inventory && (
            <p>
              {formatNumber(inventory.outOfStockCount)} products out of stock,{' '}
              {formatNumber(inventory.lowStockCount)} low.
            </p>
          )}
        </Step>

        <Arrow />

        <Step
          number={2}
          title="Predictive"
          question="What will happen?"
          icon={<TrendingUp size={16} aria-hidden />}
          tone="bg-brand-500"
        >
          {featuredDemand && (
            <>
              <p>
                Sales rate: <strong>{featuredDemand.averageDailyDemand.toFixed(2)}</strong>{' '}
                units/day (units sold in 30 days ÷ 30).
              </p>
              <p>
                Estimated stock cover:{' '}
                <strong>
                  {featuredDemand.estimatedDaysUntilStockout === null
                    ? 'not enough sales to estimate'
                    : `${featuredDemand.estimatedDaysUntilStockout} days`}
                </strong>
                .
              </p>
            </>
          )}
          {forecast && (
            <p>
              {forecast.revenue.forecastLabel} revenue forecast:{' '}
              <strong>{formatMoney(forecast.revenue.predictedRevenue)}</strong>{' '}
              (3-month moving average).
            </p>
          )}
        </Step>

        <Arrow />

        <Step
          number={3}
          title="Prescriptive"
          question="What should we do?"
          icon={<Lightbulb size={16} aria-hidden />}
          tone="bg-accent-600"
        >
          {featuredRec ? (
            <>
              <p className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={
                    featuredRec.priority === 'high'
                      ? 'danger'
                      : featuredRec.priority === 'medium'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {featuredRec.priority} priority
                </Badge>
                <span className="font-semibold">
                  {featuredRec.type.replace('-', ' ')}
                </span>
              </p>
              <p>{featuredRec.reason}</p>
              {featuredRec.suggestedQuantity !== undefined && (
                <p>
                  Action: order{' '}
                  <strong>{formatNumber(featuredRec.suggestedQuantity)} units</strong>
                  {featuredRec.supplierName
                    ? ` from ${featuredRec.supplierName}`
                    : ''}
                  .
                </p>
              )}
            </>
          ) : (
            <p>No urgent actions: stock levels match current demand.</p>
          )}
        </Step>
      </div>

      <p className="mt-4 text-xs text-ink-500">
        Each step feeds the next: sales history (descriptive) gives the daily
        demand rate, the rate gives the stock-out estimate (predictive), and the
        estimate decides what to reorder and how much (prescriptive).
      </p>
    </section>
  )
}