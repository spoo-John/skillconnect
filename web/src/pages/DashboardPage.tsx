import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { EmptyState, ErrorState, Skeleton } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { errorMessage, postsApi } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { skillLabel } from '../constants'
import { isProfessional, parseSkills, type Post } from '../types'
import { formatBudget, formatDate } from '../utils/helpers'
import styles from './DashboardPage.module.css'

type Tab = 'open' | 'closed' | 'all' | 'matching' | 'browse' | 'mine'

export function DashboardPage() {
  const { user, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isPro = isProfessional(user)

  const posts = useAsync((signal) => postsApi.list(token, signal).then((d) => (Array.isArray(d) ? d : [])), [token])
  const [tab, setTab] = useState<Tab>(isPro ? 'matching' : 'open')
  const [flash, setFlash] = useState<string>((location.state as { flash?: string } | null)?.flash ?? '')

  // Show the "published" note once, then drop it from history so a reload doesn't repeat it.
  useEffect(() => {
    if (!flash) return
    navigate(location.pathname, { replace: true, state: null })
    const t = setTimeout(() => setFlash(''), 4000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groups = useMemo(() => {
    const all = posts.data ?? []
    const mine = all.filter((p) => p.posted_by === user?.id)
    const othersOpen = all.filter((p) => p.posted_by !== user?.id && p.status === 'open')
    const mySkills = parseSkills(user?.skills).map((s) => s.toLowerCase())
    const matches = (p: Post) => {
      const need = (p.skill_needed || '').toLowerCase()
      return mySkills.some((s) => need && (need.includes(s) || s.includes(need)))
    }
    return {
      open: mine.filter((p) => p.status === 'open'),
      closed: mine.filter((p) => p.status !== 'open'),
      all: mine,
      mine,
      matching: othersOpen.filter(matches),
      browse: othersOpen,
    } satisfies Record<Tab, Post[]>
  }, [posts.data, user])

  const tabs: { id: Tab; label: string }[] = isPro
    ? [
        { id: 'matching', label: 'For you' },
        { id: 'browse', label: 'All open' },
        ...(groups.mine.length ? [{ id: 'mine' as Tab, label: 'Yours' }] : []),
      ]
    : [
        { id: 'open', label: 'Open' },
        { id: 'closed', label: 'Closed' },
        { id: 'all', label: 'All' },
      ]

  const list = groups[tab]
  const isOwnList = tab === 'open' || tab === 'closed' || tab === 'all' || tab === 'mine'

  async function remove(id: number) {
    if (!token) return
    await postsApi.remove(id, token)
    posts.mutate((d) => d.filter((p) => p.id !== id))
  }

  if (!user) return null

  return (
    <div className={`container ${styles.page}`}>
      <Seo page="dashboard" />

      <header className={styles.header}>
        <h1>{isPro ? 'Open needs' : 'Your needs'}</h1>
        <Link to="/post-need" className="btn btn-primary">
          New need
        </Link>
      </header>

      {flash && (
        <div className="alert alert-success fade-in" role="status" style={{ marginBottom: 16 }}>
          {flash}
        </div>
      )}

      <div className={styles.tabs} role="tablist" aria-label="Filter needs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {posts.status === 'ready' && <span className={styles.tabCount}>{groups[t.id].length}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {posts.status === 'loading' && <ListSkeleton />}
        {posts.status === 'error' && <ErrorState message={posts.error} onRetry={posts.retry} />}
        {posts.status === 'ready' && list.length === 0 && <EmptyFor tab={tab} hasSkills={parseSkills(user.skills).length > 0} />}
        {posts.status === 'ready' && list.length > 0 && (
          <ul className={`${styles.list} stagger`} key={tab}>
            {list.map((p, i) =>
              isOwnList ? (
                <OwnNeedRow key={p.id} index={i} post={p} showStatus={tab === 'all' || tab === 'mine'} onDelete={remove} />
              ) : (
                <OpenNeedRow key={p.id} index={i} post={p} />
              )
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

function NeedMeta({ post }: { post: Post }) {
  const parts = [
    post.skill_needed && skillLabel(post.skill_needed),
    formatBudget(post.budget, post.currency),
    post.deadline && `Due ${formatDate(post.deadline)}`,
  ].filter(Boolean)
  return <div className={styles.meta}>{parts.join(' · ')}</div>
}

function OwnNeedRow({
  post,
  index,
  showStatus,
  onDelete,
}: {
  post: Post
  index: number
  showStatus: boolean
  onDelete: (id: number) => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function confirmDelete() {
    setDeleting(true)
    setError('')
    try {
      await onDelete(post.id)
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete. Try again."))
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <li className={styles.row} style={{ ['--i' as string]: index }}>
      <div className={styles.rowMain}>
        <div className={styles.title}>
          {post.title}
          {showStatus && <span className={`tag ${post.status === 'open' ? styles.open : ''}`}>{post.status}</span>}
        </div>
        <NeedMeta post={post} />
        {error && (
          <div className="field-error" role="alert">
            {error}
          </div>
        )}
      </div>
      <div className={styles.rowActions}>
        {confirming ? (
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)} disabled={deleting}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmDelete} disabled={deleting} autoFocus>
              {deleting ? 'Deleting' : 'Confirm delete'}
            </button>
          </>
        ) : (
          <>
            <Link to={`/post-need?id=${post.id}`} className="btn btn-ghost btn-sm">
              Edit
            </Link>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  )
}

function OpenNeedRow({ post, index }: { post: Post; index: number }) {
  return (
    <li className={styles.row} style={{ ['--i' as string]: index }}>
      <div className={styles.rowMain}>
        <div className={styles.title}>{post.title}</div>
        {post.description && <p className={styles.desc}>{post.description}</p>}
        <NeedMeta post={post} />
      </div>
      <div className={styles.rowActions}>
        <Link to={`/messages?to=${post.posted_by}`} className="btn btn-secondary btn-sm">
          Message client
        </Link>
      </div>
    </li>
  )
}

function EmptyFor({ tab, hasSkills }: { tab: Tab; hasSkills: boolean }) {
  if (tab === 'matching') {
    return (
      <EmptyState>{hasSkills ? 'No open needs match your skills right now.' : 'Add skills to your profile to see matching needs.'}</EmptyState>
    )
  }
  if (tab === 'browse') return <EmptyState>No open needs right now.</EmptyState>
  if (tab === 'closed') return <EmptyState>No closed needs.</EmptyState>
  return (
    <EmptyState
      action={
        <Link to="/post-need" className="btn btn-primary btn-sm">
          Post a need
        </Link>
      }
    >
      You haven't posted a need yet.
    </EmptyState>
  )
}

function ListSkeleton() {
  return (
    <ul className={styles.list} aria-busy="true" aria-label="Loading needs">
      {[0, 1, 2].map((i) => (
        <li key={i} className={styles.row}>
          <div className={styles.rowMain} style={{ display: 'grid', gap: 8 }}>
            <Skeleton width="45%" height={16} />
            <Skeleton width="30%" height={12} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default DashboardPage
