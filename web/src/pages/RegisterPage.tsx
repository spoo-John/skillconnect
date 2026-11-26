import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Spinner } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../api/client'
import { SKILLS } from '../constants'
import type { Role } from '../types'
import { safeNext } from '../utils/helpers'
import styles from './AuthPage.module.css'

type Field = 'name' | 'email' | 'password' | 'confirm' | 'skills' | 'portfolio'
type Errors = Partial<Record<Field, string>>

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  const [role, setRole] = useState<Role>(params.get('role') === 'professional' ? 'professional' : 'client')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [portfolio, setPortfolio] = useState('')

  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) return <Navigate to={next} replace />

  const isPro = role === 'professional'

  function toggleSkill(value: string) {
    setSkills((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!name.trim()) e.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Enter a valid email address.'
    if (password.trim().length < 8) e.password = 'Use at least 8 characters.'
    if (confirm !== password) e.confirm = "Passwords don't match."
    if (isPro && skills.length === 0) e.skills = 'Pick at least one skill.'
    if (isPro && portfolio.trim() && !/^(https?:\/\/)?[^\s.]+\.[^\s]+$/i.test(portfolio.trim())) e.portfolio = 'Enter a valid link.'
    return e
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setFormError('')
    const found = validate()
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`reg-${first}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        ...(isPro ? { skills, bio: bio.trim(), portfolio_link: portfolio.trim() } : {}),
      })
      navigate(next, { replace: true })
    } catch (err) {
      setFormError(errorMessage(err))
      setSubmitting(false)
    }
  }

  const invalid = (f: Field) => (errors[f] ? { 'aria-invalid': true, 'aria-describedby': `reg-${f}-error` } : {})
  const fieldError = (f: Field) =>
    errors[f] && (
      <span id={`reg-${f}-error`} className="field-error">
        {errors[f]}
      </span>
    )

  return (
    <div className={styles.page}>
      <Seo page="register" />
      <div className={`${styles.panel} ${styles.wide} fade-in`}>
        <h1>Create your account</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.segmented} role="radiogroup" aria-label="I want to">
            <button type="button" role="radio" aria-checked={!isPro} className={styles.segment} onClick={() => setRole('client')}>
              Hire someone
            </button>
            <button type="button" role="radio" aria-checked={isPro} className={styles.segment} onClick={() => setRole('professional')}>
              Offer my skills
            </button>
          </div>

          <div className="field">
            <label htmlFor="reg-name">Full name</label>
            <input id="reg-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...invalid('name')} />
            {fieldError('name')}
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...invalid('email')}
            />
            {fieldError('email')}
          </div>

          <div className={styles.row}>
            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="input"
                autoComplete="new-password"
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                {...invalid('password')}
              />
              {fieldError('password')}
            </div>
            <div className="field">
              <label htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                className="input"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                {...invalid('confirm')}
              />
              {fieldError('confirm')}
            </div>
          </div>

          {isPro && (
            <>
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="label" style={{ marginBottom: 8, padding: 0 }}>
                  Skills
                </legend>
                <div className={styles.chips} id="reg-skills" tabIndex={-1}>
                  {SKILLS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className="chip"
                      aria-pressed={skills.includes(s.value)}
                      onClick={() => toggleSkill(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {fieldError('skills')}
              </fieldset>

              <div className="field">
                <label htmlFor="reg-bio">
                  Bio <span className="label-optional">optional</span>
                </label>
                <textarea id="reg-bio" className="input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="field">
                <label htmlFor="reg-portfolio">
                  Portfolio link <span className="label-optional">optional</span>
                </label>
                <input
                  id="reg-portfolio"
                  type="url"
                  className="input"
                  inputMode="url"
                  placeholder="https://"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  {...invalid('portfolio')}
                />
                {fieldError('portfolio')}
              </div>
            </>
          )}

          {formError && (
            <div className="alert alert-error" role="alert">
              {formError}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting && <Spinner label="Creating account" />}
            {submitting ? 'Creating account' : 'Create account'}
          </button>
        </form>

        <p className={styles.switch}>
          Have an account? <Link to={params.get('next') ? `/login?next=${encodeURIComponent(next)}` : '/login'}>Log in</Link>
        </p>
        <p className={styles.switch} style={{ marginTop: 8, fontSize: 13 }}>
          By signing up you agree to our <Link to="/privacy">privacy policy</Link>.
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
