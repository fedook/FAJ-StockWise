import { useState } from 'react'

/**
 * Shared FAJ Stockwise logo.
 *
 * The bundled design lives at `/assets/faj-stockwise-logo.svg`. A PNG can be
 * dropped in as `/assets/faj-stockwise-logo.png` to override it without code
 * changes.
 *
 * Only the display size changes between pages — the image path is shared so the
 * exact same artwork is used on the landing page, auth pages and dashboards.
 */
export const LOGO_SRC = '/assets/faj-stockwise-logo.svg'
export const LOGO_FALLBACK_SRC = '/assets/faj-stockwise-logo.png'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero'

const sizeClasses: Record<LogoSize, string> = {
  sm: 'h-8 max-w-[168px]',
  md: 'h-10 max-w-[210px]',
  lg: 'h-14 max-w-[280px]',
  xl: 'h-20 max-w-[360px]',
  hero: 'h-24 max-w-[440px]',
}

interface LogoProps {
  size?: LogoSize
  className?: string
  imageClassName?: string
}

export default function Logo({
  size = 'md',
  className = '',
  imageClassName = '',
}: LogoProps) {
  const [source, setSource] = useState(LOGO_SRC)
  const [failed, setFailed] = useState(false)

  function handleError() {
    if (source !== LOGO_FALLBACK_SRC) {
      setSource(LOGO_FALLBACK_SRC)
      return
    }

    setFailed(true)
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      {failed ? (
        <span
          className="flex h-full w-full items-center justify-center truncate rounded-lg border border-dashed border-ink-300 bg-ink-50 px-2 text-center text-[10px] leading-none font-semibold whitespace-nowrap text-ink-500"
          title="Add the FAJ Stockwise logo at frontend/public/assets/faj-stockwise-logo.png"
        >
          FAJ Stockwise logo
        </span>
      ) : (
        <img
          src={source}
          alt="FAJ Stockwise"
          draggable={false}
          onError={handleError}
          className={`h-full w-auto max-w-full object-contain object-left ${imageClassName}`}
        />
      )}
    </span>
  )
}
