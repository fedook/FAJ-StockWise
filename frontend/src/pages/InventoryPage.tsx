import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeftRight,
  Boxes,
  CalendarDays,
  Filter,
  LoaderCircle,
  PackagePlus,
  RefreshCw,
  TriangleAlert,
  Truck,
  UserRound,
} from 'lucide-react'
import RestockModal from '../components/inventory/RestockModal'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import SearchField from '../components/ui/SearchField'
import SelectField from '../components/ui/SelectField'
import TextField from '../components/ui/TextField'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import * as inventoryService from '../services/inventory.service'
import * as productService from '../services/product.service'
import type {
  InventoryMovement,
  InventoryMovementType,
  LowStockAlert,
  StockItem,
  StockListParams,
} from '../types/inventory'
import { movementTypeLabels } from '../types/inventory'
import type { Pagination as PaginationInfo } from '../types/pagination'
import type { Product } from '../types/product'
import { getErrorMessage } from '../utils/getErrorMessage'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
} from '../utils/format'

const PAGE_SIZE = 20

const initialPagination: PaginationInfo = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

const stockSortOptions = [
  { value: 'name:asc', label: 'Name A → Z' },
  { value: 'name:desc', label: 'Name Z → A' },
  { value: 'stock:asc', label: 'Stock: low to high' },
  { value: 'stock:desc', label: 'Stock: high to low' },
  { value: 'value:desc', label: 'Stock value: high to low' },
  { value: 'newest:desc', label: 'Newest products' },
]

const movementTypeOptions = (
  Object.keys(movementTypeLabels) as InventoryMovementType[]
).map((value) => ({ value, label: movementTypeLabels[value] }))

const movementTones: Record<
  InventoryMovementType,
  'neutral' | 'success' | 'info' | 'warning'
> = {
  initial: 'neutral',
  restock: 'success',
  sale: 'info',
  return: 'success',
  adjustment: 'warning',
}

export default function InventoryPage() {
  const [view, setView] = useState<'stock' | 'movements'>('stock')

  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stockPagination, setStockPagination] =
    useState<PaginationInfo>(initialPagination)
  const [stockLoading, setStockLoading] = useState(true)
  const [stockError, setStockError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [alerts, setAlerts] = useState<LowStockAlert | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [category, setCategory] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [stockSortValue, setStockSortValue] = useState('name:asc')
  const [stockPage, setStockPage] = useState(1)

  const [restockTarget, setRestockTarget] = useState<StockItem | null>(null)

  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [movementPagination, setMovementPagination] =
    useState<PaginationInfo>(initialPagination)
  const [movementLoading, setMovementLoading] = useState(true)
  const [movementError, setMovementError] = useState<string | null>(null)

  const [movementProductId, setMovementProductId] = useState('')
  const [movementType, setMovementType] = useState('')
  const [movementFrom, setMovementFrom] = useState('')
  const [movementTo, setMovementTo] = useState('')
  const [movementDirection, setMovementDirection] = useState<'desc' | 'asc'>('desc')
  const [movementPage, setMovementPage] = useState(1)

  const [stockSort, stockDirection] = stockSortValue.split(':') as [
    StockListParams['sort'],
    'asc' | 'desc',
  ]

  const loadOptions = useCallback(async () => {
    try {
      const [categoryList, productList] = await Promise.all([
        productService.listProductCategories(),
        productService.listAllProducts(),
      ])

      setCategories(categoryList)
      setProducts(productList)
    } catch (error) {
      setStockError(getErrorMessage(error))
    }
  }, [])

  const loadAlerts = useCallback(async () => {
    try {
      setAlerts(await inventoryService.listLowStockAlerts())
    } catch (error) {
      setStockError(getErrorMessage(error))
    }
  }, [])

  const loadStock = useCallback(async () => {
    setStockLoading(true)
    setStockError(null)

    try {
      const result = await inventoryService.listStock({
        page: stockPage,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        category: category || undefined,
        lowStock: lowStockOnly || undefined,
        sort: stockSort,
        direction: stockDirection,
      })

      setStockItems(result.items)
      setStockPagination(result.pagination)
    } catch (error) {
      setStockError(getErrorMessage(error))
    } finally {
      setStockLoading(false)
    }
  }, [stockPage, debouncedSearch, category, lowStockOnly, stockSort, stockDirection])

  const loadMovements = useCallback(async () => {
    setMovementLoading(true)
    setMovementError(null)

    try {
      const result = await inventoryService.listMovements({
        page: movementPage,
        limit: PAGE_SIZE,
        productId: movementProductId ? Number(movementProductId) : undefined,
        movementType: (movementType || undefined) as
          | InventoryMovementType
          | undefined,
        from: movementFrom || undefined,
        to: movementTo || undefined,
        direction: movementDirection,
      })

      setMovements(result.items)
      setMovementPagination(result.pagination)
    } catch (error) {
      setMovementError(getErrorMessage(error))
    } finally {
      setMovementLoading(false)
    }
  }, [
    movementPage,
    movementProductId,
    movementType,
    movementFrom,
    movementTo,
    movementDirection,
  ])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadOptions()
  }, [loadOptions])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadAlerts()
  }, [loadAlerts])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadStock()
  }, [loadStock])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadMovements()
  }, [loadMovements])

  const hasStockFilters =
    search.trim() !== '' ||
    category !== '' ||
    lowStockOnly ||
    stockSortValue !== 'name:asc'

  const hasMovementFilters =
    movementProductId !== '' ||
    movementType !== '' ||
    movementFrom !== '' ||
    movementTo !== '' ||
    movementDirection !== 'desc'

  function clearStockFilters() {
    setSearch('')
    setCategory('')
    setLowStockOnly(false)
    setStockSortValue('name:asc')
    setStockPage(1)
  }

  function clearMovementFilters() {
    setMovementProductId('')
    setMovementType('')
    setMovementFrom('')
    setMovementTo('')
    setMovementDirection('desc')
    setMovementPage(1)
  }

  function showLowStock() {
    setView('stock')
    setLowStockOnly(true)
    setStockPage(1)
  }

  function handleRestocked(updated: StockItem, added: number) {
    setRestockTarget(null)
    setNotice(
      `Added ${formatNumber(added)} unit${
        added === 1 ? '' : 's'
      } to "${updated.name}". New stock: ${formatNumber(updated.stock)}.`,
    )
    void loadStock()
    void loadAlerts()
    void loadMovements()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description={`${formatNumber(stockPagination.total)} product${
          stockPagination.total === 1 ? '' : 's'
        } in the current stock view. Receive deliveries and review every stock change in the audit trail.`}
        badge={{ icon: Boxes, label: 'Stock control' }}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              void loadStock()
              void loadAlerts()
              void loadMovements()
            }}
            loading={stockLoading || movementLoading}
          >
            <RefreshCw size={16} aria-hidden />
            Reload
          </Button>
        }
      />

      {stockError && <Alert tone="error">{stockError}</Alert>}
      {movementError && <Alert tone="error">{movementError}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      {alerts && alerts.total > 0 && (
        <section
          aria-label="Low stock alert"
          className="rounded-2xl border border-accent-200 bg-accent-50 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                <TriangleAlert size={19} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-accent-900">
                  {formatNumber(alerts.total)} product
                  {alerts.total === 1 ? '' : 's'} at or below the reorder level
                </p>
                <p className="mt-1 text-sm leading-relaxed text-accent-800">
                  {alerts.alerts
                    .slice(0, 4)
                    .map((item) => item.name)
                    .join(', ')}
                  {alerts.total > 4 ? ` and ${formatNumber(alerts.total - 4)} more` : ''}
                  . Receive stock to avoid running out.
                </p>
              </div>
            </div>

            <Button variant="secondary" onClick={showLowStock}>
              Show low stock
            </Button>
          </div>
        </section>
      )}

      <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          aria-pressed={view === 'stock'}
          onClick={() => setView('stock')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none ${
            view === 'stock'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-ink-600 hover:bg-ink-100'
          }`}
        >
          Stock levels
        </button>
        <button
          type="button"
          aria-pressed={view === 'movements'}
          onClick={() => setView('movements')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none ${
            view === 'movements'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-ink-600 hover:bg-ink-100'
          }`}
        >
          Movement history
        </button>
      </div>

      {view === 'stock' ? (
        <>
          <section
            aria-label="Stock filters"
            className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px] lg:items-end">
              <SearchField
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setStockPage(1)
                }}
                placeholder="Search name, category or description"
                label="Search stock"
              />

              <SelectField
                label="Category"
                name="stockCategoryFilter"
                value={category}
                onChange={(value) => {
                  setCategory(value)
                  setStockPage(1)
                }}
                options={[
                  { value: '', label: 'All categories' },
                  ...categories.map((item) => ({ value: item, label: item })),
                ]}
              />

              <SelectField
                label="Sort by"
                name="stockSort"
                value={stockSortValue}
                onChange={(value) => {
                  setStockSortValue(value)
                  setStockPage(1)
                }}
                options={stockSortOptions}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={lowStockOnly}
                onClick={() => {
                  setLowStockOnly((current) => !current)
                  setStockPage(1)
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none ${
                  lowStockOnly
                    ? 'border-accent-300 bg-accent-50 text-accent-900'
                    : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                }`}
              >
                <Filter size={14} aria-hidden />
                Low stock only
              </button>

              {hasStockFilters && (
                <Button variant="ghost" onClick={clearStockFilters} className="text-xs">
                  Clear filters
                </Button>
              )}

              {stockLoading && stockItems.length > 0 && (
                <span className="ml-auto inline-flex items-center gap-2 text-xs text-ink-500">
                  <LoaderCircle size={14} className="animate-spin" aria-hidden />
                  Updating...
                </span>
              )}
            </div>
          </section>

          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
            {stockLoading && stockItems.length === 0 ? (
              <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-ink-500">
                <LoaderCircle
                  size={20}
                  className="animate-spin text-brand-600"
                  aria-hidden
                />
                Loading stock...
              </div>
            ) : stockItems.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title={
                  hasStockFilters
                    ? 'No products match these filters'
                    : 'Nothing in stock yet'
                }
                description={
                  hasStockFilters
                    ? 'Try a different search term, category or clear the low-stock filter.'
                    : 'Add products to the catalogue first, or receive stock to see it here.'
                }
                action={
                  hasStockFilters ? (
                    <Button variant="secondary" onClick={clearStockFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div className="grid gap-4 bg-brand-50/20 p-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {stockItems.map((item) => (
                    <article
                      key={item.id}
                      className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${
                              item.isLowStock
                                ? 'bg-accent-50 text-accent-700 ring-accent-200'
                                : 'bg-brand-50 text-brand-700 ring-brand-100'
                            }`}
                          >
                            <Boxes size={20} aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-ink-900">
                              {item.name}
                            </h3>
                            <p className="mt-0.5 truncate text-xs text-ink-500">
                              {item.category}
                            </p>
                          </div>
                        </div>
                        {item.isLowStock && <Badge tone="warning">Low stock</Badge>}
                      </div>

                      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
                        <Truck size={13} className="shrink-0" aria-hidden />
                        <span className="truncate">
                          {item.supplierName ?? 'No supplier assigned'}
                        </span>
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-ink-50/80 p-3">
                        <div>
                          <p className="text-[10px] font-semibold tracking-wide text-ink-400 uppercase">
                            On hand
                          </p>
                          <p
                            className={`mt-1 text-lg font-semibold ${
                              item.isLowStock
                                ? 'text-accent-800'
                                : 'text-ink-900'
                            }`}
                          >
                            {formatNumber(item.stock)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold tracking-wide text-ink-400 uppercase">
                            Reorder at
                          </p>
                          <p className="mt-1 text-lg font-semibold text-ink-700">
                            {formatNumber(item.reorderLevel)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold tracking-wide text-ink-400 uppercase">
                            Stock value
                          </p>
                          <p className="mt-1 text-sm font-semibold text-brand-800">
                            {formatMoney(item.stockValue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
                        <span>@ {formatMoney(item.purchaseCost)} cost</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} aria-hidden />
                          {formatDate(item.updatedAt)}
                        </span>
                      </div>

                      <div className="mt-auto pt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => setRestockTarget(item)}
                        >
                          <PackagePlus size={14} aria-hidden />
                          Restock
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>

                <Pagination
                  page={stockPagination.page}
                  totalPages={stockPagination.totalPages}
                  total={stockPagination.total}
                  limit={stockPagination.limit}
                  itemLabel="products"
                  onPageChange={setStockPage}
                />
              </>
            )}
          </div>

          <p className="text-xs leading-relaxed text-ink-500">
            Stock value uses the purchase cost, not the selling price. Receiving
            stock writes a restock movement so the audit trail stays complete.
          </p>
        </>
      ) : (
        <>
          <section
            aria-label="Movement filters"
            className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SelectField
                label="Product"
                name="movementProductFilter"
                value={movementProductId}
                onChange={(value) => {
                  setMovementProductId(value)
                  setMovementPage(1)
                }}
                options={[
                  { value: '', label: 'All products' },
                  ...products.map((product) => ({
                    value: String(product.id),
                    label: product.name,
                  })),
                ]}
              />

              <SelectField
                label="Movement type"
                name="movementTypeFilter"
                value={movementType}
                onChange={(value) => {
                  setMovementType(value)
                  setMovementPage(1)
                }}
                options={[
                  { value: '', label: 'All movement types' },
                  ...movementTypeOptions,
                ]}
              />

              <SelectField
                label="Order"
                name="movementOrder"
                value={movementDirection}
                onChange={(value) => {
                  setMovementDirection(value as 'asc' | 'desc')
                  setMovementPage(1)
                }}
                options={[
                  { value: 'desc', label: 'Newest first' },
                  { value: 'asc', label: 'Oldest first' },
                ]}
              />

              <TextField
                label="From date"
                name="movementFromDate"
                type="date"
                value={movementFrom}
                onChange={(event) => {
                  setMovementFrom(event.target.value)
                  setMovementPage(1)
                }}
              />

              <TextField
                label="To date"
                name="movementToDate"
                type="date"
                value={movementTo}
                onChange={(event) => {
                  setMovementTo(event.target.value)
                  setMovementPage(1)
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {hasMovementFilters && (
                <Button
                  variant="ghost"
                  onClick={clearMovementFilters}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}

              {movementLoading && movements.length > 0 && (
                <span className="ml-auto inline-flex items-center gap-2 text-xs text-ink-500">
                  <LoaderCircle size={14} className="animate-spin" aria-hidden />
                  Updating...
                </span>
              )}
            </div>
          </section>

          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
            {movementLoading && movements.length === 0 ? (
              <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-ink-500">
                <LoaderCircle
                  size={20}
                  className="animate-spin text-brand-600"
                  aria-hidden
                />
                Loading movements...
              </div>
            ) : movements.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title={
                  hasMovementFilters
                    ? 'No stock movements match these filters'
                    : 'No stock movements yet'
                }
                description={
                  hasMovementFilters
                    ? 'Try a different product, movement type or date range.'
                    : 'Sales, deliveries and stock adjustments will appear here as an audit trail.'
                }
                action={
                  hasMovementFilters ? (
                    <Button variant="secondary" onClick={clearMovementFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div className="divide-y divide-ink-100">
                  {movements.map((movement) => (
                    <article
                      key={movement.id}
                      className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/30 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                          <ArrowLeftRight size={16} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-900">
                            {movement.productName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-500">
                            {formatDateTime(movement.createdAt)}
                            {movement.reason ? ` · ${movement.reason}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pl-12 sm:justify-end sm:pl-0">
                        <Badge tone={movementTones[movement.movementType]}>
                          {movementTypeLabels[movement.movementType]}
                        </Badge>

                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                            movement.quantityChange < 0
                              ? 'bg-rose-50 text-rose-700'
                              : movement.quantityChange > 0
                                ? 'bg-brand-50 text-brand-700'
                                : 'bg-ink-100 text-ink-600'
                          }`}
                        >
                          {movement.quantityChange > 0 ? '+' : ''}
                          {formatNumber(movement.quantityChange)}
                        </span>

                        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                          Stock {formatNumber(movement.stockAfter)}
                        </span>

                        {movement.saleId && (
                          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100 ring-inset">
                            Sale #{movement.saleId}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                          <UserRound size={12} aria-hidden />
                          {movement.userName ?? 'Unassigned'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                <Pagination
                  page={movementPagination.page}
                  totalPages={movementPagination.totalPages}
                  total={movementPagination.total}
                  limit={movementPagination.limit}
                  itemLabel="movements"
                  onPageChange={setMovementPage}
                />
              </>
            )}
          </div>

          <p className="text-xs leading-relaxed text-ink-500">
            Every stock change is recorded: opening stock, sales, deliveries,
            returns and manual adjustments. Negative changes come from sales.
          </p>
        </>
      )}

      <RestockModal
        open={restockTarget !== null}
        product={restockTarget}
        onClose={() => setRestockTarget(null)}
        onSaved={handleRestocked}
      />
    </div>
  )
}
