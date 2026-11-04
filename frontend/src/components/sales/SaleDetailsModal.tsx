import { LoaderCircle, Receipt } from 'lucide-react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import type { SaleDetail } from '../../types/sale'
import { paymentMethodLabels } from '../../types/sale'
import { formatDateTime, formatMoney, formatNumber } from '../../utils/format'

interface SaleDetailsModalProps {
  open: boolean
  sale: SaleDetail | null
  loading: boolean
  onClose: () => void
}

export default function SaleDetailsModal({
  open,
  sale,
  loading,
  onClose,
}: SaleDetailsModalProps) {
  return (
    <Modal
      open={open}
      size="lg"
      title={sale ? `Sale #${sale.id}` : 'Sale details'}
      description={
        sale
          ? `${formatDateTime(sale.saleDate)} · ${paymentMethodLabels[sale.paymentMethod]}`
          : undefined
      }
      onClose={onClose}
    >
      {loading || !sale ? (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-ink-500">
          <LoaderCircle
            size={20}
            className="animate-spin text-brand-600"
            aria-hidden
          />
          Loading sale...
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-ink-500">Customer</p>
              <p className="mt-1 font-medium text-ink-900">
                {sale.customerName ?? 'Walk-in customer'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">Recorded by</p>
              <p className="mt-1 font-medium text-ink-900">
                {sale.processedByName ?? 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500">Payment</p>
              <p className="mt-1 font-medium text-ink-900">
                {paymentMethodLabels[sale.paymentMethod]}
              </p>
            </div>
          </div>

          <div className="divide-y divide-ink-100 rounded-2xl border border-ink-200">
            {sale.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {item.productName}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {formatNumber(item.quantity)} × {formatMoney(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-ink-900">
                  {formatMoney(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 pt-4">
            <span className="inline-flex items-center gap-2 text-xs text-ink-500">
              <Receipt size={14} aria-hidden />
              {sale.itemCount} line{sale.itemCount === 1 ? '' : 's'}
            </span>
            <div className="text-right">
              <p className="text-xs font-medium text-ink-500">Total</p>
              <p className="text-2xl font-semibold text-ink-900">
                {formatMoney(sale.totalAmount)}
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-ink-500">
            Sales are permanent records. Stock movements for this sale are listed
            on the Inventory page with reference <strong>Sale #{sale.id}</strong>.
          </p>

          <div className="flex justify-end">
            <Badge tone="success">Recorded</Badge>
          </div>
        </div>
      )}
    </Modal>
  )
}
