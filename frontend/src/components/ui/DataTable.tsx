import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'

export interface DataTableColumn<T> {
  /** Stable column id, also used as the React key. */
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  /** Extra classes for every body cell in this column. */
  className?: string
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>
  rows: T[]
  rowKey: (row: T) => string | number
  ariaLabel: string
  /** Minimum table width; the card scrolls horizontally below this. */
  minWidth?: string
  /** The table body scrolls vertically past this height. */
  maxHeight?: string
  /** Rendered below the scroll area, outside the table, when there are rows. */
  footer?: ReactNode
  loading?: boolean
  loadingLabel?: string
  emptyState?: ReactNode
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

/**
 * Modern scrollable data table.
 *
 * - The card clips its rounded corners and carries the shadow.
 * - The inner scroll area handles horizontal overflow and vertical overflow.
 * - The header sticks to the top while the body scrolls.
 * - The footer (normally pagination) sits outside the scroll area, so it never
 *   scrolls away with the rows.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  ariaLabel,
  minWidth = '860px',
  maxHeight = 'min(68vh, 720px)',
  footer,
  loading = false,
  loadingLabel = 'Loading records...',
  emptyState,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-ink-500">
            <LoaderCircle
              size={20}
              className="animate-spin text-brand-600"
              aria-hidden
            />
            {loadingLabel}
          </div>
        ) : (
          emptyState
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
      <div
        className="relative overflow-auto overscroll-contain"
        style={{ maxHeight }}
      >
        <table
          aria-label={ariaLabel}
          className="w-full border-separate border-spacing-0 text-left text-sm"
          style={{ minWidth }}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`sticky top-0 z-10 border-b border-ink-200 bg-ink-50 px-5 py-3 text-xs font-semibold tracking-wide text-ink-500 uppercase ${
                    alignClasses[column.align ?? 'left']
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="transition-colors hover:bg-brand-50/40"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`border-b border-ink-100 px-5 py-4 align-middle ${
                      alignClasses[column.align ?? 'left']
                    } ${column.className ?? ''}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  )
}
