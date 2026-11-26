import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageLoader } from './components/States'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { trackPageview } from './lib/analytics'

// Home is in the main bundle for the fastest first paint; every other page is its own chunk.
const BrowsePage = lazy(() => import('./pages/BrowsePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PostNeedPage = lazy(() => import('./pages/PostNeedPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))

export function App() {
  const location = useLocation()

  // One page view per route change; scroll to top unless the change is in-page.
  useEffect(() => {
    trackPageview()
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <AuthProvider>
      {/* Last-resort boundary; pages are also wrapped inside Layout so the navbar survives a crash. */}
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route element={<Layout footer={false} />}>
              <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
              <Route path="/post-need" element={<RequireAuth><PostNeedPage /></RequireAuth>} />
              <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  )
}
