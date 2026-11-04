import { useCallback, useEffect, useState } from 'react'
import {
  Info,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Truck,
} from 'lucide-react'
import SupplierDetailsModal from '../components/suppliers/SupplierDetailsModal'
import SupplierFormModal from '../components/suppliers/SupplierFormModal'
import Alert from '../components/ui/Alert'
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
import * as supplierService from '../services/supplier.service'
import type { Pagination as PaginationInfo } from '../types/pagination'
import type { Supplier } from '../types/supplier'
import { getErrorMessage } from '../utils/getErrorMessage'
import {
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

const sortOptions = [
  { value: 'name:asc', label: 'Name A → Z' },
  { value: 'name:desc', label: 'Name Z → A' },
  { value: 'newest:desc', label: 'Newest first' },
  { value: 'delivery:asc', label: 'Fastest delivery' },
  { value: 'delivery:desc', label: 'Slowest delivery' },
]

function deliveryLabel(days: number | null): string {
  if (days === null) {
    return 'Not recorded'
  }

  return `${days} day${days === 1 ? '' : 's'}`
}

export default function SuppliersPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [sortValue, setSortValue] = useState('name:asc')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [detailsSupplier, setDetailsSupplier] = useState<Supplier | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [sort, direction] = sortValue.split(':') as [
    'name' | 'newest' | 'delivery',
    'asc' | 'desc',
  ]

  const loadSuppliers = useCallback(async () => {
    setLoading(true)
    setPageError(null)

    try {
      const result = await supplierService.listSuppliers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        sort,
        direction,
      })

      setSuppliers(result.items)
      setPagination(result.pagination)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, sort, direction])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void loadSuppliers()
  }, [loadSuppliers])

  const hasFilters = search.trim() !== '' || sortValue !== 'name:asc'

  function clearFilters() {
    setSearch('')
    setSortValue('name:asc')
    setPage(1)
  }

  function openCreate() {
    setEditingSupplier(null)
    setFormOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditingSupplier(supplier)
    setFormOpen(true)
  }

  function handleSaved(saved: Supplier, mode: 'created' | 'updated') {
    setFormOpen(false)
    setEditingSupplier(null)
    setConfirmingId(null)
    setNotice(
      mode === 'created'
        ? `"${saved.name}" was added to the supplier list.`
        : `"${saved.name}" was updated.`,
    )

    if (mode === 'created' && page !== 1) {
      setPage(1)
      return
    }

    void loadSuppliers()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    setPageError(null)
    setNotice(null)

    try {
      await supplierService.deleteSupplier(id)
      setConfirmingId(null)
      setNotice('Supplier deleted. Linked products were kept in the catalogue.')

      if (suppliers.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        await loadSuppliers()
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
        title="Suppliers"
        description={`${formatNumber(pagination.total)} supplier${
          pagination.total === 1 ? '' : 's'
        }. Link suppliers to products to see where your stock comes from.`}
        badge={{ icon: Truck, label: 'Supply chain' }}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => void loadSuppliers()}
              loading={loading}
            >
              <RefreshCw size={16} aria-hidden />
              Reload
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} aria-hidden />
              Add supplier
            </Button>
          </>
        }
      />

      {pageError && <Alert tone="error">{pageError}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <section
        aria-label="Supplier filters"
        className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-end">
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search name, contact or address"
            label="Search suppliers"
          />

          <SelectField
            label="Sort by"
            name="supplierSort"
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

          {loading && suppliers.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-2 text-xs text-ink-500">
              <LoaderCircle size={14} className="animate-spin" aria-hidden />
              Updating...
            </span>
          )}
        </div>
      </section>

      <DataTable
        ariaLabel="Supplier list"
        minWidth="860px"
        rows={suppliers}
        rowKey={(supplier) => supplier.id}
        loading={loading}
        loadingLabel="Loading suppliers..."
        emptyState={
          <EmptyState
            icon={Truck}
            title={
              hasFilters ? 'No suppliers match this search' : 'No suppliers yet'
            }
            description={
              hasFilters
                ? 'Try a different search term.'
                : 'Add a supplier to record where your products come from.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus size={16} aria-hidden />
                  Add supplier
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
            itemLabel="suppliers"
            onPageChange={setPage}
          />
        }
        columns={[
          {
            key: 'supplier',
            header: 'Supplier',
            cell: (supplier) => (
              <>
                <p className="font-medium text-ink-900">{supplier.name}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  <span className="font-semibold text-ink-400">
                    {formatRecordCode('SUP', supplier.id)}
                  </span>
                  <span className="mx-1.5 text-ink-300">·</span>
                  {orDash(supplier.contactInformation)}
                </p>
              </>
            ),
          },
          {
            key: 'address',
            header: 'Address',
            className: 'max-w-xs text-ink-600',
            cell: (supplier) => (
              <p className="truncate">{orDash(supplier.address)}</p>
            ),
          },
          {
            key: 'delivery',
            header: 'Average delivery',
            className: 'text-ink-600',
            cell: (supplier) => deliveryLabel(supplier.averageDeliveryTime),
          },
          {
            key: 'products',
            header: 'Products',
            align: 'right',
            className: 'font-medium text-ink-900',
            cell: (supplier) => formatNumber(supplier.productCount),
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            cell: (supplier) => {
              const isConfirming = confirmingId === supplier.id
              const isDeleting = deletingId === supplier.id

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
                        onClick={() => void handleDelete(supplier.id)}
                      >
                        Confirm delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        label={`View details for ${supplier.name}`}
                        onClick={() => setDetailsSupplier(supplier)}
                      >
                        <Info size={16} aria-hidden />
                      </IconButton>

                      <IconButton
                        label={`Edit ${supplier.name}`}
                        onClick={() => openEdit(supplier)}
                      >
                        <Pencil size={16} aria-hidden />
                      </IconButton>

                      {isAdmin && (
                        <IconButton
                          label={`Delete ${supplier.name}`}
                          tone="danger"
                          onClick={() => setConfirmingId(supplier.id)}
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
        Deleting a supplier never deletes its products. They stay in the catalogue
        without a supplier. Only administrators can delete suppliers.
      </p>

      <SupplierFormModal
        open={formOpen}
        supplier={editingSupplier}
        onClose={() => {
          setFormOpen(false)
          setEditingSupplier(null)
        }}
        onSaved={handleSaved}
      />

      <SupplierDetailsModal
        open={detailsSupplier !== null}
        supplier={detailsSupplier}
        onClose={() => setDetailsSupplier(null)}
      />
    </div>
  )
}
