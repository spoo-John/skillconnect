import type { CSSProperties, ReactNode } from 'react'

/** Inline spinner for buttons and small loading spots. */
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />
}

/** Route-level fallback while a page chunk loads. */
export function PageLoader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh', color: 'var(--text-3)' }}>
      <Spinner label="Loading page" />
    </div>
  )
}

export function Skeleton({ width = '100%', height = 14, radius }: { width?: number | string; height?: number; radius?: number }) {
  return <span className="skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius }} />
}

const stateStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  padding: '48px 16px',
  textAlign: 'center',
  color: 'var(--text-2)',
  fontSize: 14,
}

/** One line of explanation and at most one action. */
export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div style={stateStyle}>
      <p>{children}</p>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={stateStyle} role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
