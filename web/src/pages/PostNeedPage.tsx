import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { ErrorState, Skeleton, Spinner } from '../components/States'
import { NotFoundPage } from './NotFoundPage'
import { useAuth } from '../context/AuthContext'
import { ApiError, errorMessage, postsApi } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { track } from '../lib/analytics'
import { CURRENCIES, DESCRIPTION_MAX, SKILLS } from '../constants'
import type { Post, PostInput } from '../types'
import { PAGES } from '../seo'
import styles from './PostNeedPage.module.css'

type Field = 'title' | 'description' | 'skill'

export function PostNeedPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const editId = params.get('id')

  // In edit mode, load the post first; only its owner may edit it.
  const existing = useAsync<Post | null>(
    (signal) =>
      editId
        ? postsApi.get(editId, signal).catch((err) => {
            if (err instanceof ApiError && err.status === 404) return null
            throw err
          })
        : Promise.resolve(null),
    [editId]
  )

  if (editId) {
    if (existing.status === 'loading') return <FormSkeleton />
    if (existing.status === 'error') {
      return (
        <div className="container">
          <ErrorState message={existing.error} onRetry={existing.retry} />
        </div>
      )
    }
    if (!existing.data || existing.data.posted_by !== user?.id) return <NotFoundPage />
  }

  return <NeedForm post={existing.data ?? null} key={existing.data?.id ?? 'new'} />
}

function NeedForm({ post }: { post: Post | null }) {
  const { token } = useAuth()
  const navigate = useNavigate()
  const isEditing = Boolean(post)

  const [title, setTitle] = useState(post?.title ?? '')
  const [description, setDescription] = useState(post?.description ?? '')
  const [skill, setSkill] = useState(post?.skill_needed ?? '')
  const [deadline, setDeadline] = useState(post?.deadline ? post.deadline.split('T')[0] : '')
  const [budget, setBudget] = useState(post?.budget != null ? String(post.budget) : '')
  const [currency, setCurrency] = useState(post?.currency || 'KSh')

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const remaining = DESCRIPTION_MAX - description.length

  // Keep an unknown stored skill selectable when editing old posts.
  const skillOptions =
    skill && !SKILLS.some((s) => s.value === skill) ? [...SKILLS, { value: skill, label: skill }] : SKILLS

  useEffect(() => {
    if (Object.keys(errors).length) setErrors({})
    // Clear field errors as soon as the user edits anything.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, skill])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || !token) return
    setFormError('')

    const found: Partial<Record<Field, string>> = {}
    if (!title.trim()) found.title = 'Give your need a title.'
    if (!description.trim()) found.description = 'Describe what you need.'
    if (!skill) found.skill = 'Pick the skill you need.'
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`need-${first}`)?.focus()
      return
    }

    const payload: PostInput = {
      title: title.trim(),
      description: description.trim(),
      skill_needed: skill,
      deadline: deadline || null,
      budget: budget ? Number(budget) : null,
      currency,
    }

    setSubmitting(true)
    try {
      if (post) {
        await postsApi.update(post.id, payload, token)
      } else {
        await postsApi.create(payload, token)
        track('Need Created', { skill })
      }
      navigate('/dashboard', { state: { flash: post ? 'Need updated.' : 'Need published.' } })
    } catch (err) {
      setFormError(errorMessage(err))
      setSubmitting(false)
    }
  }

  const invalid = (f: Field) => (errors[f] ? { 'aria-invalid': true, 'aria-describedby': `need-${f}-error` } : {})
  const fieldError = (f: Field) =>
    errors[f] && (
      <span id={`need-${f}-error`} className="field-error">
        {errors[f]}
      </span>
    )

  return (
    <div className={`container ${styles.page} fade-in`}>
      {isEditing ? (
        <Seo title="Edit need — SkillConnect" description={PAGES.postNeed.description} path="/post-need" noindex />
      ) : (
        <Seo page="postNeed" />
      )}
      <h1>{isEditing ? 'Edit need' : 'Post a need'}</h1>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="need-title">Title</label>
          <input
            id="need-title"
            className="input"
            placeholder="e.g. Five-page website for my bakery"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            {...invalid('title')}
          />
          {fieldError('title')}
        </div>

        <div className="field">
          <label htmlFor="need-description">Description</label>
          <textarea
            id="need-description"
            className="input"
            rows={6}
            maxLength={DESCRIPTION_MAX}
            placeholder="What should be built or fixed, and what does done look like?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            {...invalid('description')}
          />
          {fieldError('description')}
          {remaining <= 100 && (
            <span className={styles.counter} aria-live="polite">
              {remaining} characters left
            </span>
          )}
        </div>

        <div className={styles.row}>
          <div className="field">
            <label htmlFor="need-skill">Skill</label>
            <select id="need-skill" className="input" value={skill} onChange={(e) => setSkill(e.target.value)} {...invalid('skill')}>
              <option value="">Choose…</option>
              {skillOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {fieldError('skill')}
          </div>
          <div className="field">
            <label htmlFor="need-deadline">
              Deadline <span className="label-optional">optional</span>
            </label>
            <input
              id="need-deadline"
              type="date"
              className="input"
              min={isEditing ? undefined : today}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="need-budget">
            Budget <span className="label-optional">optional</span>
          </label>
          <div className={styles.budget}>
            <select aria-label="Currency" className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              id="need-budget"
              type="number"
              inputMode="numeric"
              className="input"
              min={0}
              step="any"
              placeholder="15000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}

        <div className={styles.actions}>
          <Link to="/dashboard" className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting && <Spinner label="Saving" />}
            {isEditing ? 'Save changes' : 'Publish need'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className={`container ${styles.page}`} aria-busy="true" aria-label="Loading need">
      <Skeleton width={180} height={28} />
      <div className={styles.form}>
        {[38, 140, 38, 38].map((h, i) => (
          <div key={i} style={{ display: 'grid', gap: 6 }}>
            <Skeleton width={80} height={12} />
            <Skeleton height={h} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PostNeedPage
