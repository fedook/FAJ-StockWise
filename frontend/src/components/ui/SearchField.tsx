import { useId } from 'react'
import { Search, X } from 'lucide-react'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

/** Search input with a magnifier icon and a clear button. */
export default function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
}: SearchFieldProps) {
  const id = useId()

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-ink-200 bg-white py-2.5 pr-10 pl-10 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-400 transition-colors hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:outline-none"
        >
          <X size={15} aria-hidden />
        </button>
      )}
    </div>
  )
}
