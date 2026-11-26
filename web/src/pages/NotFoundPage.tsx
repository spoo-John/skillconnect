import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

/** 404 for unknown routes and missing records; `variant="error"` for crashes caught by ErrorBoundary. */
export function NotFoundPage({ variant = 'not-found' }: { variant?: 'not-found' | 'error' }) {
  const isError = variant === 'error'
  return (
    <section
      className="container fade-in"
      style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '64px var(--gutter)' }}
    >
      <Seo page="notFound" />
      <div style={{ maxWidth: 420, display: 'grid', gap: 16, justifyItems: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
          {isError ? 'Error' : '404'}
        </p>
        <h1>{isError ? 'Something went wrong' : 'Page not found'}</h1>
        <p className="muted">
          {isError
            ? 'This page hit an unexpected error. Reloading usually fixes it.'
            : "The link may be broken, or the page may have been removed."}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {isError ? (
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          ) : (
            <Link to="/" className="btn btn-primary">
              Go home
            </Link>
          )}
          <Link to="/browse" className="btn btn-secondary">
            Browse professionals
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
