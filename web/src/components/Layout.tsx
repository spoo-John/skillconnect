import { Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ErrorBoundary } from './ErrorBoundary'
import { PageLoader } from './States'

/**
 * Page frame: skip link, navbar, main content, and (on public pages) a one-line footer.
 * The navbar stays put while a page chunk loads or if a page crashes.
 */
export function Layout({ footer = true }: { footer?: boolean }) {
  const { pathname } = useLocation()
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoader />}>
            <div key={pathname} className="page-enter">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      {footer && <Footer />}
    </>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 96 }}>
      <div
        className="container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'space-between',
          paddingTop: 24,
          paddingBottom: 24,
          fontSize: 13,
          color: 'var(--text-3)',
        }}
      >
        <span>© {new Date().getFullYear()} SkillConnect</span>
        <span style={{ display: 'flex', gap: 20 }}>
          <Link to="/browse" style={{ color: 'inherit' }}>
            Browse
          </Link>
          <Link to="/privacy" style={{ color: 'inherit' }}>
            Privacy
          </Link>
        </span>
      </div>
    </footer>
  )
}
