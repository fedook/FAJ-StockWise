import { useCallback, useEffect, useState } from 'react'
import { Eye, LoaderCircle, Plus, Receipt, RefreshCw } from 'lucide-react'
import SaleDetailsModal from '../components/sales/SaleDetailsModal'
import SaleFormModal from '../components/sales/SaleFormModal'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import IconButton from '../components/ui/IconButton'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import SearchField from '../components/ui/SearchField'
import SelectField from '../components/ui/SelectField'
import TextField from '../components/ui/TextField'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import * as customerService from '../services/customer.service'
import * as productService from '../services/product.service'
import * as saleService from '../services/sale.service'
import type { Customer } from '../types/customer'
import type { Pagination as PaginationInfo } from '../types/pagination'
import type { Product } from '../types/product'
import type {
  PaymentMethod,
  SaleDetail,
  SaleListItem,
  SaleListParams,
} from '../types/sale'
import { paymentMethodLabels } from '../types/sale'
import { getErrorMessage } from '../utils/getErrorMessage'
import {
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

const sortOptions = [
  { value: 'date:desc', label: 'Newest first' },
  { value: 'date:asc', label: 'Oldest first' },
  { value: 'total:desc', label: 'Total: high to low' },
  { value: 'total:asc', label: 'Total: low to high' },
]

const paymentOptions = (
  Object.keys(paymentMethodLabels) as PaymentMethod[]
).map((value) => ({ value, label: paymentMethodLabels[value] }))

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function SalesPage() {
  const [sales, setSales] = useState<SaleListItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sortValue, setSortValue] = useState('date:desc')
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [optionsLoading, setOptionsLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SaleDetail | null>(null)

  const [sort, direction] = sortValue.split(':') as [
    SaleListParams['sort'],
    'asc' | 'desc',
  ]

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true)

    try {
      const [productList, customerList] = await Promise.all([
        productService.listAllProducts(),
        customerService.listAllCustomers(),
      ])

      setProducts(productList)
      setCustomers(customerList)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  const loadSales = useCallback(async () => {
    setLoading(true)
    setPageError(null)

    try {
      const result = await saleService.listSales({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        paymentMethod: (paymentMethod || undefined) as PaymentMethod | undefined,
        customerId: customerId ? Number(customerId) : undefined,
        from: from || undefined,
        to: to || undefined,
        sort,
        direction,
      })

      setSales(result.items)
      setPagination(result.pagination)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [
    page,
    debouncedSearch,
    paymentMethod,
    customerId,
    from,
    to,
    sort,
    direction,
  ])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadOptions()
  }, [loadOptions])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadSales()
  }, [loadSales])

  const hasFilters =
    search.trim() !== '' ||
    paymentMethod !== '' ||
    customerId !== '' ||
    from !== '' ||
    to !== '' ||
    sortValue !== 'date:desc'

  function clearFilters() {
    setSearch('')
    setPaymentMethod('')
    setCustomerId('')
    setFrom('')
    setTo('')
    setSortValue('date:desc')
    setPage(1)
  }

  function handleSaleSaved(sale: SaleDetail) {
    setFormOpen(false)
    setPage(1)
    setNotice(
      `Sale #${sale.id} was recorded for ${formatMoney(sale.totalAmount)}. Stock was deducted automatically.`,
    )
    void loadSales()
    void loadOptions()
  }

  async function openDetails(id: number) {
    setDetailOpen(true)
    setDetailLoading(true)
    setSelectedSale(null)

    try {
      setSelectedSale(await saleService.getSale(id))
    } catch (error) {
      setPageError(getErrorMessage(error))
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description={`${formatNumber(pagination.total)} sale${
          pagination.total === 1 ? '' : 's'
        } recorded. Each sale is saved with its products, deducts stock, and writes inventory movements in one transaction.`}
        badge={{ icon: Receipt, label: 'Transactions' }}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => void loadSales()}
              loading={loading}
            >
              <RefreshCw size={16} aria-hidden />
              Reload
            </Button>
            <Button
              onClick={() => setFormOpen(true)}
              disabled={optionsLoading}
              loading={optionsLoading}
            >
              <Plus size={16} aria-hidden />
              New sale
            </Button>
          </>
        }
      />

      {pageError && <Alert tone="error">{pageError}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <section
        aria-label="Sale filters"
        className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search sale #, customer, cashier or product"
            label="Search sales"
          />

          <SelectField
            label="Customer"
            name="saleCustomerFilter"
            value={customerId}
            onChange={(value) => {
              setCustomerId(value)
              setPage(1)
            }}
            options={[
              { value: '', label: 'All customers' },
              ...customers.map((customer) => ({
                value: String(customer.id),
                label: customer.name,
              })),
            ]}
          />

          <SelectField
            label="Payment method"
            name="salePaymentFilter"
            value={paymentMethod}
            onChange={(value) => {
              setPaymentMethod(value)
              setPage(1)
            }}
            options={[{ value: '', label: 'All payment methods' }, ...paymentOptions]}
          />

          <TextField
            label="From date"
            name="saleFromDate"
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value)
              setPage(1)
            }}
          />

          <TextField
            label="To date"
            name="saleToDate"
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value)
              setPage(1)
            }}
          />

          <SelectField
            label="Sort by"
            name="saleSort"
            value={sortValue}
            onChange={(value) => {
              setSortValue(value)
              setPage(1)
            }}
            options={sortOptions}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-xs">
              Clear filters
            </Button>
          )}

          {loading && sales.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-2 text-xs text-ink-500">
              <LoaderCircle size={14} className="animate-spin" aria-hidden />
              Updating...
            </span>
          )}
        </div>
      </section>

      <DataTable
        ariaLabel="Sales list"
        minWidth="900px"
        rows={sales}
        rowKey={(sale) => sale.id}
        loading={loading}
        loadingLabel="Loading sales..."
        emptyState={
          <EmptyState
            icon={Receipt}
            title={hasFilters ? 'No sales match these filters' : 'No sales yet'}
            description={
              hasFilters
                ? 'Try a different date range, customer or payment method.'
                : 'Record your first sale to start building the sales history and stock audit trail.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus size={16} aria-hidden />
                  Record a sale
                </Button>
              )
            }
          />
        }
        footer={
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            itemLabel="sales"
            onPageChange={setPage}
          />
        }
        columns={[
          {
            key: 'sale',
            header: 'Sale',
            cell: (sale) => (
              <>
                <p className="font-medium text-ink-900">Sale #{sale.id}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {formatDateTime(sale.saleDate)}
                </p>
              </>
            ),
          },
          {
            key: 'customer',
            header: 'Customer',
            className: 'text-ink-600',
            cell: (sale) => sale.customerName ?? 'Walk-in customer',
          },
          {
            key: 'items',
            header: 'Items',
            align: 'right',
            className: 'text-ink-700',
            cell: (sale) => formatNumber(sale.itemCount),
          },
          {
            key: 'payment',
            header: 'Payment',
            cell: (sale) => (
              <Badge tone="neutral">
                {paymentMethodLabels[sale.paymentMethod]}
              </Badge>
            ),
          },
          {
            key: 'cashier',
            header: 'Cashier',
            cell: (sale) =>
              sale.processedByName ? (
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-900 text-[10px] font-semibold text-white">
                    {getInitials(sale.processedByName)}
                  </span>
                  <span className="text-ink-700">{sale.processedByName}</span>
                </div>
              ) : (
                <span className="text-ink-500">Unassigned</span>
              ),
          },
          {
            key: 'total',
            header: 'Total',
            align: 'right',
            className: 'font-medium text-ink-900',
            cell: (sale) => formatMoney(sale.totalAmount),
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            cell: (sale) => (
              <div className="flex justify-end">
                <IconButton
                  label={`View sale #${sale.id}`}
                  onClick={() => void openDetails(sale.id)}
                >
                  <Eye size={16} aria-hidden />
                </IconButton>
              </div>
            ),
          },
        ]}
      />

      <p className="text-xs leading-relaxed text-ink-500">
        Sales are permanent records. Prices and totals are calculated by the API
        from the product catalogue, and stock can never be sold below zero.
      </p>

      <SaleFormModal
        open={formOpen}
        products={products}
        customers={customers}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaleSaved}
      />

      <SaleDetailsModal
        open={detailOpen}
        sale={selectedSale}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false)
          setSelectedSale(null)
        }}
      />
    </div>
  )
}
