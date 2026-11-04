import { useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: string
}

/**
 * Labelled input with an inline error message and an optional
 * show/hide toggle for passwords.
 */
export default function TextField({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const id = props.name ? `${props.name}-${generatedId}` : generatedId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-ink-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-400 focus:outline-none focus:ring-2 ${
            isPassword ? 'pr-11' : ''
          } ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
              : 'border-ink-200 focus:border-brand-500 focus:ring-brand-500/20'
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink-400 transition-colors hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden />
            ) : (
              <Eye size={18} aria-hidden />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
