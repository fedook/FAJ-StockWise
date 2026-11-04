/**
 * Display helpers. The database stores plain NUMERIC amounts, so the
 * currency symbol is a presentation choice (Philippine peso for this project).
 */
const moneyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-PH')

export function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "Not provided" placeholder for empty optional columns. */
export function orDash(value: string | null | undefined): string {
  return value?.trim() ? value : '—'
}

/**
 * Stable human-readable record code derived from the database serial ID.
 * IDs are never reused by PostgreSQL, so codes remain stable after edits/deletes
 * and can be generated without a schema migration or client-side counter.
 */
export function formatRecordCode(
  prefix: 'CUST' | 'SUP' | 'SKU',
  id: number,
): string {
  return `${prefix}-${String(id).padStart(5, '0')}`
}
