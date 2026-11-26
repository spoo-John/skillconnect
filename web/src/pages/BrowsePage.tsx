import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorState, Skeleton } from '../components/States'
import { usersApi } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { SKILLS, skillLabel } from '../constants'
import { parseSkills, type User } from '../types'
import { plural } from '../utils/helpers'
import styles from './BrowsePage.module.css'

const PER_PAGE = 12
type Sort = 'newest' | 'name'

export function BrowsePage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const skill = params.get('skill') ?? ''
  const sort: Sort = params.get('sort') === 'name' ? 'name' : 'newest'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const pros = useAsync(
    (signal) => usersApi.list(signal).then((list) => (Array.isArray(list) ? list.filter((u) => u.role !== 'client') : [])),
    []
  )

  /** Updates one or more URL params; any filter change resets to page 1. */
  function update(next: Record<string, string>) {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    if (!('page' in next)) p.delete('page')
    setParams(p, { replace: true })
  }

  const filtered = useMemo(() => {
    const list = pros.data ?? []
    const query = q.trim().toLowerCase()
    const result = list.filter((p) => {
      const skills = parseSkills(p.skills)
      if (skill && !skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) return false
      if (query) {
        const haystack = `${p.name} ${p.bio ?? ''} ${skills.join(' ')} ${skills.map(skillLabel).join(' ')}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
    return sort === 'name' ? result.sort((a, b) => a.name.localeCompare(b.name)) : result.sort((a, b) => b.id - a.id)
  }, [pros.data, q, skill, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, totalPages)
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const hasFilters = Boolean(q || skill)

  function goTo(p: number) {
    update({ page: p > 1 ? String(p) : '' })
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="container">
      <Seo page="browse" />

      <header className={styles.header}>
        <h1>Professionals</h1>
        {pros.status === 'ready' && <span className={styles.count}>{plural(filtered.length, 'result')}</span>}
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className="visually-hidden">Search professionals</span>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="input"
            placeholder="Search by name or skill"
            value={q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </label>
        <label>
          <span className="visually-hidden">Sort</span>
          <select className={`input ${styles.sort}`} value={sort} onChange={(e) => update({ sort: e.target.value === 'name' ? 'name' : '' })}>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      <div className={styles.chips} role="group" aria-label="Filter by skill">
        <button type="button" className="chip" aria-pressed={!skill} onClick={() => update({ skill: '' })}>
          All
        </button>
        {SKILLS.map((s) => (
          <button
            key={s.value}
            type="button"
            className="chip"
            aria-pressed={skill === s.value}
            onClick={() => update({ skill: skill === s.value ? '' : s.value })}
          >
            {s.label}
          </button>
        ))}
      </div>

      {pros.status === 'loading' && (
        <ul className={styles.grid} aria-busy="true" aria-label="Loading professionals">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className={`card ${styles.card}`}>
              <div className={styles.cardTop}>
                <Skeleton width={40} height={40} radius={20} />
                <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                  <Skeleton width="60%" />
                  <Skeleton width="40%" height={12} />
                </div>
              </div>
              <Skeleton height={12} />
              <Skeleton width="80%" height={12} />
            </li>
          ))}
        </ul>
      )}

      {pros.status === 'error' && <ErrorState message={pros.error} onRetry={pros.retry} />}

      {pros.status === 'ready' && filtered.length === 0 && (
        <EmptyState
          action={
            hasFilters && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            )
          }
        >
          {hasFilters ? 'No professionals match these filters.' : 'No professionals have joined yet.'}
        </EmptyState>
      )}

      {pros.status === 'ready' && visible.length > 0 && (
        <ul className={`${styles.grid} stagger`} key={`${current}-${skill}-${sort}`}>
          {visible.map((p, i) => (
            <li key={p.id} style={{ ['--i' as string]: i }}>
              <ProCard pro={p} />
            </li>
          ))}
        </ul>
      )}

      {pros.status === 'ready' && totalPages > 1 && (
        <nav className={styles.pager} aria-label="Pagination">
          <button type="button" className="btn btn-secondary btn-sm" disabled={current === 1} onClick={() => goTo(current - 1)}>
            Previous
          </button>
          <span className="muted">
            Page {current} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={current === totalPages}
            onClick={() => goTo(current + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}

function ProCard({ pro }: { pro: User }) {
  const skills = parseSkills(pro.skills)
  const extra = skills.length - 3
  return (
    <Link to={`/profile?id=${pro.id}`} className={`card ${styles.card} ${styles.link}`}>
      <div className={styles.cardTop}>
        <Avatar name={pro.name} id={pro.id} size={40} />
        <div style={{ minWidth: 0 }}>
          <div className={styles.name}>{pro.name}</div>
          <div className={styles.role}>{skills[0] ? skillLabel(skills[0]) : 'Professional'}</div>
        </div>
      </div>
      {pro.bio && <p className={styles.bio}>{pro.bio}</p>}
      {skills.length > 0 && (
        <div className={styles.tags}>
          {skills.slice(0, 3).map((s) => (
            <span className="tag" key={s}>
              {skillLabel(s)}
            </span>
          ))}
          {extra > 0 && <span className="tag">+{extra}</span>}
        </div>
      )}
    </Link>
  )
}

export default BrowsePage
