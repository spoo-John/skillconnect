import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Avatar } from '../components/Avatar'
import { ErrorState, Skeleton } from '../components/States'
import { NotFoundPage } from './NotFoundPage'
import { useAuth } from '../context/AuthContext'
import { ApiError, usersApi } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { skillLabel } from '../constants'
import { isProfessional, parseSkills, type User } from '../types'
import { firstName } from '../utils/helpers'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { user: me } = useAuth()
  const [params] = useSearchParams()
  const id = params.get('id') ?? (me ? String(me.id) : null)

  const profile = useAsync<User | null>(
    (signal) =>
      id
        ? usersApi.get(id, signal).catch((err) => {
            if (err instanceof ApiError && err.status === 404) return null
            throw err
          })
        : Promise.resolve(null),
    [id]
  )

  // `/profile` with no id means "my profile" — signed-out visitors need to log in first.
  if (!id) return <Navigate to="/login?next=%2Fprofile" replace />

  if (profile.status === 'loading') return <ProfileSkeleton />
  if (profile.status === 'error') {
    return (
      <div className="container">
        <ErrorState message={profile.error} onRetry={profile.retry} />
      </div>
    )
  }
  if (!profile.data?.name) return <NotFoundPage />

  return <ProfileView profile={profile.data} isOwn={!!me && me.id === profile.data.id} />
}

function ProfileView({ profile, isOwn }: { profile: User; isOwn: boolean }) {
  const skills = parseSkills(profile.skills)
  const headline = skills[0] ? skillLabel(skills[0]) : isProfessional(profile) ? 'Professional' : 'Client'
  const portfolio = safeUrl(profile.portfolio_link)

  return (
    <article className={`container ${styles.page} fade-in`}>
      <Seo
        title={`${profile.name} — ${headline} on SkillConnect`}
        description={(profile.bio || `${profile.name} offers ${skills.map(skillLabel).join(', ') || 'tech skills'} on SkillConnect.`).slice(0, 155)}
        path={`/profile?id=${profile.id}`}
        noindex={!isProfessional(profile)}
      />

      <header className={styles.header}>
        <Avatar name={profile.name} id={profile.id} size={72} />
        <div className={styles.identity}>
          <h1>{profile.name}</h1>
          <p className="muted">{headline}</p>
        </div>
        <div className={styles.actions}>
          {isOwn ? (
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          ) : (
            <Link to={`/messages?to=${profile.id}`} className="btn btn-primary">
              Message {firstName(profile.name)}
            </Link>
          )}
          {portfolio && (
            <a href={portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Portfolio ↗
            </a>
          )}
        </div>
      </header>

      {profile.bio && (
        <section className={styles.section}>
          <h2 className={styles.heading}>About</h2>
          <p className={styles.bio}>{profile.bio}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Skills</h2>
          <div className={styles.skills}>
            {skills.map((s) => (
              <span className="tag" key={s}>
                {skillLabel(s)}
              </span>
            ))}
          </div>
        </section>
      )}

      {isOwn && profile.email && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Email</h2>
          <p className="muted">{profile.email}</p>
        </section>
      )}
    </article>
  )
}

function ProfileSkeleton() {
  return (
    <div className={`container ${styles.page}`} aria-busy="true" aria-label="Loading profile">
      <div className={styles.header}>
        <Skeleton width={72} height={72} radius={36} />
        <div className={styles.identity} style={{ display: 'grid', gap: 8 }}>
          <Skeleton width={220} height={24} />
          <Skeleton width={120} />
        </div>
      </div>
      <div className={styles.section} style={{ display: 'grid', gap: 8 }}>
        <Skeleton width={80} height={12} />
        <Skeleton />
        <Skeleton width="70%" />
      </div>
    </div>
  )
}

/** Only allow http(s) links, so a stored `javascript:` URL can never run. */
function safeUrl(url?: string): string | null {
  if (!url) return null
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`
  try {
    const u = new URL(withScheme)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

export default ProfilePage
