import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Spinner } from '../components/States'
import { Backdrop } from '../components/Backdrop'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../api/client'
import { safeNext } from '../utils/helpers'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (user && !submitting) return <Navigate to={next} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      // Passwords are trimmed to match how accounts were created at sign-up.
      await login(email.trim(), password.trim())
      navigate(next, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  const registerHref = params.get('next') ? `/register?next=${encodeURIComponent(next)}` : '/register'

  return (
    <div className={styles.split}>
      <Backdrop photo="dashboardLaptop" scrim="even" parallax={0} priority />
      <Seo page="login" />
      <div className={`${styles.panel} ${styles.card} fade-in`}>
        <h1>Log in</h1>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting && <Spinner label="Logging in" />}
            {submitting ? 'Logging in' : 'Log in'}
          </button>
        </form>
        <p className={styles.switch}>
          New to SkillConnect? <Link to={registerHref}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
