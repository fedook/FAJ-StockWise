import { useCallback, useEffect, useState } from 'react'
import {
  History,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react'
import CustomerFormModal from '../components/customers/CustomerFormModal'
import PurchaseHistoryModal from '../components/customers/PurchaseHistoryModal'
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
import { useAuth } from '../hooks/useAuth'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import * as customerService from '../services/customer.service'
import type { Customer, CustomerType } from '../types/customer'
import type { Pagination as PaginationInfo } from '../types/pagination'
import { getErrorMessage } from '../utils/getErrorMessage'
import {
  formatDate,
  formatMoney,
  formatNumber,
  formatRecordCode,
  orDash,
} from '../utils/format'

const PAGE_SIZE = 20

const initialPagination: PaginationInfo = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

const typeBadgeTone: Record<CustomerType, 'neutral' | 'success' | 'info'> = {
  'walk-in': 'neutral',
  regular: 'success',
  wholesale: 'info',
}

const typeLabel: Record<CustomerType, string> = {
  'walk-in': 'Walk-in',
  regular: 'Regular',
  wholesale: 'Wholesale',
}

const sortOptions = [
  { value: 'name:asc', label: 'Name A → Z' },
  { value: 'name:desc', label: 'Name Z → A' },
  { value: 'newest:desc', label: 'Newest first' },
]

export default function CustomersPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [customers, setCustomers] = useState<Customer[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [customerType, setCustomerType] = useState('')
  const [sortValue, setSortValue] = useState('name:asc')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [sort, direction] = sortValue.split(':') as [
    'name' | 'newest',
    'asc' | 'desc',
  ]

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setPageError(null)

    try {
      const result = await customerService.listCustomers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        customerType:
          customerType === '' ? undefined : (customerType as CustomerType),
        sort,
        direction,
      })

      setCustomers(result.items)
      setPagination(result.pagination)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, customerType, sort, direction])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadCustomers()
  }, [loadCustomers])

  const hasFilters =
    search.trim() !== '' || customerType !== '' || sortValue !== 'name:asc'

  function clearFilters() {
    setSearch('')
    setCustomerType('')
    setSortValue('name:asc')
    setPage(1)
  }

  function openCreate() {
    setEditingCustomer(null)
    setFormOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer)
    setFormOpen(true)
  }

  function handleSaved(saved: Customer, mode: 'created' | 'updated') {
    setFormOpen(false)
    setEditingCustomer(null)
    setConfirmingId(null)
    setNotice(
      mode === 'created'
        ? `"${saved.name}" was added to the customer list.`
        : `"${saved.name}" was updated.`,
    )

    if (mode === 'created' && page !== 1) {
      setPage(1)
      return
    }

    void loadCustomers()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    setPageError(null)
    setNotice(null)

    try {
      await customerService.deleteCustomer(id)
      setConfirmingId(null)
      setNotice('Customer deleted. Their past sales are kept for reporting.')

      if (customers.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        await loadCustomers()
      }
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${formatNumber(pagination.total)} customer${
          pagination.total === 1 ? '' : 's'
        }. Spend totals and purchase counts come from real recorded sales, not estimates.`}
        badge={{ icon: Users, label: 'Customer book' }}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => void loadCustomers()}
              loading={loading}
            >
              <RefreshCw size={16} aria-hidden />
              Reload
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} aria-hidden />
              Add customer
            </Button>
          </>
        }
      />

      {pageError && <Alert tone="error">{pageError}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <section
        aria-label="Customer filters"
        className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_190px] lg:items-end">
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search name, location or contact"
            label="Search customers"
          />

          <SelectField
            label="Customer type"
            name="customerTypeFilter"
            value={customerType}
            onChange={(value) => {
              setCustomerType(value)
              setPage(1)
            }}
            options={[
              { value: '', label: 'All types' },
              { value: 'walk-in', label: 'Walk-in' },
              { value: 'regular', label: 'Regular' },
              { value: 'wholesale', label: 'Wholesale' },
            ]}
          />

          <SelectField
            label="Sort by"
            name="customerSort"
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

          {loading && customers.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-2 text-xs text-ink-500">
              <LoaderCircle size={14} className="animate-spin" aria-hidden />
              Updating...
            </span>
          )}
        </div>
      </section>

      <DataTable
        ariaLabel="Customer list"
        minWidth="960px"
        rows={customers}
        rowKey={(customer) => customer.id}
        loading={loading}
        loadingLabel="Loading customers..."
        emptyState={
          <EmptyState
            icon={Users}
            title={
              hasFilters ? 'No customers match these filters' : 'No customers yet'
            }
            description={
              hasFilters
                ? 'Try a different search term or customer type.'
                : 'Add your first customer to link them to future sales.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus size={16} aria-hidden />
                  Add customer
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
            itemLabel="customers"
            onPageChange={setPage}
          />
        }
        columns={[
          {
            key: 'customer',
            header: 'Customer',
            cell: (customer) => (
              <>
                <p className="font-medium text-ink-900">{customer.name}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  <span className="font-semibold text-ink-400">
                    {formatRecordCode('CUST', customer.id)}
                  </span>
                  <span className="mx-1.5 text-ink-300">·</span>
                  {orDash(customer.contactInformation)}
                </p>
              </>
            ),
          },
          {
            key: 'type',
            header: 'Type',
            cell: (customer) => (
              <Badge tone={typeBadgeTone[customer.customerType]}>
                {typeLabel[customer.customerType]}
              </Badge>
            ),
          },
          {
            key: 'location',
            header: 'Location',
            className: 'text-ink-600',
            cell: (customer) => orDash(customer.location),
          },
          {
            key: 'purchases',
            header: 'Purchases',
            align: 'right',
            className: 'text-ink-700',
            cell: (customer) => formatNumber(customer.saleCount),
          },
          {
            key: 'spent',
            header: 'Total spent',
            align: 'right',
            className: 'font-medium text-ink-900',
            cell: (customer) => formatMoney(customer.totalSpent),
          },
          {
            key: 'lastPurchase',
            header: 'Last purchase',
            className: 'text-ink-600',
            cell: (customer) =>
              customer.lastPurchaseAt
                ? formatDate(customer.lastPurchaseAt)
                : '—',
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            cell: (customer) => {
              const isConfirming = confirmingId === customer.id
              const isDeleting = deletingId === customer.id

              return (
                <div className="flex items-center justify-end gap-1.5">
                  {isConfirming ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => setConfirmingId(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        loading={isDeleting}
                        onClick={() => void handleDelete(customer.id)}
                      >
                        Confirm delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        label={`Purchase history for ${customer.name}`}
                        onClick={() => setHistoryCustomer(customer)}
                      >
                        <History size={16} aria-hidden />
                      </IconButton>

                      <IconButton
                        label={`Edit ${customer.name}`}
                        onClick={() => openEdit(customer)}
                      >
                        <Pencil size={16} aria-hidden />
                      </IconButton>

                      {isAdmin && (
                        <IconButton
                          label={`Delete ${customer.name}`}
                          tone="danger"
                          onClick={() => setConfirmingId(customer.id)}
                        >
                          <Trash2 size={16} aria-hidden />
                        </IconButton>
                      )}
                    </>
                  )}
                </div>
              )
            },
          },
        ]}
      />

      <p className="text-xs leading-relaxed text-ink-500">
        Deleting a customer never deletes their sales. The sale totals stay in the
        reports and only the customer link is cleared. Only administrators can
        delete customers.
      </p>

      <CustomerFormModal
        open={formOpen}
        customer={editingCustomer}
        onClose={() => {
          setFormOpen(false)
          setEditingCustomer(null)
        }}
        onSaved={handleSaved}
      />

      <PurchaseHistoryModal
        open={historyCustomer !== null}
        customer={historyCustomer}
        onClose={() => setHistoryCustomer(null)}
      />
    </div>
  )
}
