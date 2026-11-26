import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorState, Skeleton, Spinner } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { errorMessage, messagesApi, usersApi } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { track } from '../lib/analytics'
import { MESSAGE_POLL_MS, skillLabel } from '../constants'
import { parseSkills, type Message, type User } from '../types'
import { conversationId, formatTime } from '../utils/helpers'
import styles from './MessagesPage.module.css'

interface Person {
  id: number
  name: string
  subtitle: string
}

function toPerson(u: User): Person {
  const skills = parseSkills(u.skills)
  return {
    id: u.id,
    name: u.name,
    subtitle: skills[0] ? skillLabel(skills[0]) : u.role === 'client' ? 'Client' : 'Professional',
  }
}

export function MessagesPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const toParam = params.get('to')
  const activeId = toParam && /^\d+$/.test(toParam) ? Number(toParam) : null
  const [filter, setFilter] = useState('')

  const people = useAsync(
    async (signal) => {
      const list = (await usersApi.list(signal)) ?? []
      return list.filter((u) => u.id !== user?.id).map(toPerson)
    },
    [user?.id]
  )

  // A deep link (?to=42) may point at someone not in the public list, e.g. a client. Fetch them on demand.
  const [extra, setExtra] = useState<Person | null>(null)
  useEffect(() => {
    if (people.status !== 'ready' || activeId == null || activeId === user?.id) return
    if (people.data.some((p) => p.id === activeId) || extra?.id === activeId) return
    const ctrl = new AbortController()
    usersApi
      .get(activeId, ctrl.signal)
      .then((u) => u?.name && setExtra(toPerson(u)))
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [people.status, people.data, activeId, extra?.id, user?.id])

  const allPeople = useMemo(() => {
    const list = people.data ?? []
    return extra && !list.some((p) => p.id === extra.id) ? [extra, ...list] : list
  }, [people.data, extra])

  const visiblePeople = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return q ? allPeople.filter((p) => `${p.name} ${p.subtitle}`.toLowerCase().includes(q)) : allPeople
  }, [allPeople, filter])

  const active = allPeople.find((p) => p.id === activeId) ?? null

  function open(id: number | null) {
    setParams(id == null ? {} : { to: String(id) })
  }

  if (!user) return null

  return (
    <div className={styles.layout} data-thread-open={activeId != null}>
      <Seo page="messages" />

      <aside className={styles.sidebar} aria-label="Conversations">
        <div className={styles.sidebarHead}>
          <h1 className={styles.h1}>Messages</h1>
          <label>
            <span className="visually-hidden">Search people</span>
            <input
              type="search"
              className="input"
              placeholder="Search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.people}>
          {people.status === 'loading' &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.person} aria-hidden="true">
                <Skeleton width={36} height={36} radius={18} />
                <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                  <Skeleton width="55%" height={12} />
                  <Skeleton width="35%" height={10} />
                </div>
              </div>
            ))}
          {people.status === 'error' && <ErrorState message={people.error} onRetry={people.retry} />}
          {people.status === 'ready' && allPeople.length === 0 && (
            <EmptyState
              action={
                <Link to="/browse" className="btn btn-secondary btn-sm">
                  Browse professionals
                </Link>
              }
            >
              No one to message yet.
            </EmptyState>
          )}
          {people.status === 'ready' && allPeople.length > 0 && visiblePeople.length === 0 && (
            <EmptyState>No matches.</EmptyState>
          )}
          {visiblePeople.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.person}
              aria-current={p.id === activeId ? 'true' : undefined}
              onClick={() => open(p.id)}
            >
              <Avatar name={p.name} id={p.id} size={36} />
              <span className={styles.personText}>
                <span className={styles.personName}>{p.name}</span>
                <span className={styles.personSub}>{p.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.thread} aria-label={active ? `Conversation with ${active.name}` : 'Conversation'}>
        {activeId == null && <EmptyState>Pick someone to start a conversation.</EmptyState>}
        {activeId != null && activeId === user.id && <EmptyState>You can't message yourself.</EmptyState>}
        {activeId != null && activeId !== user.id && (
          <Thread key={activeId} me={user} otherId={activeId} other={active} onBack={() => open(null)} />
        )}
      </section>
    </div>
  )
}

interface Pending {
  tempId: string
  text: string
}

function Thread({ me, otherId, other, onBack }: { me: User; otherId: number; other: Person | null; onBack: () => void }) {
  const { token } = useAuth()
  const convId = conversationId(me.id, otherId)

  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [pending, setPending] = useState<Pending[]>([])
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const stickToBottom = useRef(true)

  const loadedOnce = useRef(false)
  const load = useCallback(async () => {
    if (!token) return
    try {
      const list = await messagesApi.listForConversation(convId, token)
      loadedOnce.current = true
      setMessages(Array.isArray(list) ? list : [])
      setStatus('ready')
    } catch (err) {
      // Keep showing what we have on a failed poll; only show an error if nothing loaded yet.
      if (!loadedOnce.current) {
        setLoadError(errorMessage(err))
        setStatus('error')
      }
    }
  }, [convId, token])

  // Load now, then poll while the tab is visible.
  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (!document.hidden) load()
    }, MESSAGE_POLL_MS)
    const onVisible = () => !document.hidden && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  // Follow new messages only when the reader is already at the bottom.
  useEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [messages.length, pending.length, status])

  function onScroll() {
    const el = scrollRef.current
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  useEffect(() => {
    if (window.matchMedia('(min-width: 721px)').matches) inputRef.current?.focus()
  }, [])

  function autosize() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  async function send(e?: FormEvent) {
    e?.preventDefault()
    const text = draft.trim()
    if (!text || !token) return

    const tempId = `tmp-${Date.now()}`
    setPending((p) => [...p, { tempId, text }])
    setDraft('')
    setSendError('')
    stickToBottom.current = true
    requestAnimationFrame(autosize)

    try {
      await messagesApi.send({ receiver_id: otherId, text, conversation_id: convId }, token)
      track('Message Sent')
      await load()
    } catch (err) {
      setDraft((d) => d || text)
      setSendError(`${errorMessage(err, 'Message not sent.')} Your text is back in the box.`)
      requestAnimationFrame(autosize)
    } finally {
      setPending((p) => p.filter((m) => m.tempId !== tempId))
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  const name = other?.name ?? 'Conversation'

  return (
    <>
      <header className={styles.threadHead}>
        <button type="button" className={`btn btn-ghost btn-sm ${styles.back}`} onClick={onBack} aria-label="Back to conversations">
          ←
        </button>
        {other ? <Avatar name={other.name} id={other.id} size={32} /> : <Skeleton width={32} height={32} radius={16} />}
        <div className={styles.threadWho}>
          <div className={styles.personName}>{name}</div>
          {other && <div className={styles.personSub}>{other.subtitle}</div>}
        </div>
        <Link to={`/profile?id=${otherId}`} className="btn btn-ghost btn-sm">
          Profile
        </Link>
      </header>

      <div className={styles.scroll} ref={scrollRef} onScroll={onScroll} aria-live="polite">
        {status === 'loading' && (
          <div className={styles.center}>
            <Spinner label="Loading messages" />
          </div>
        )}
        {status === 'error' && <ErrorState message={loadError} onRetry={() => { setStatus('loading'); load() }} />}
        {status === 'ready' && messages.length === 0 && pending.length === 0 && (
          <EmptyState>No messages yet. Say hello to {name.split(' ')[0]}.</EmptyState>
        )}
        {status === 'ready' && (
          <ol className={styles.messages}>
            {messages.map((m, i) => {
              const mine = m.sender_id === me.id
              const nextMsg = messages[i + 1]
              const showTime =
                !nextMsg ||
                nextMsg.sender_id !== m.sender_id ||
                new Date(nextMsg.timestamp).getTime() - new Date(m.timestamp).getTime() > 5 * 60_000
              return (
                <li key={m.id ?? `${m.timestamp}-${i}`} className={mine ? styles.mine : styles.theirs}>
                  <div className={styles.bubble}>{m.text}</div>
                  {showTime && <time className={styles.time} dateTime={m.timestamp}>{formatTime(m.timestamp)}</time>}
                </li>
              )
            })}
            {pending.map((m) => (
              <li key={m.tempId} className={styles.mine}>
                <div className={`${styles.bubble} ${styles.sending}`}>{m.text}</div>
                <span className={styles.time}>Sending…</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <form className={styles.composer} onSubmit={send}>
        {sendError && (
          <div className="field-error" role="alert" style={{ gridColumn: '1 / -1' }}>
            {sendError}
          </div>
        )}
        <label className="visually-hidden" htmlFor="composer">
          Message
        </label>
        <textarea
          id="composer"
          ref={inputRef}
          className={`input ${styles.input}`}
          rows={1}
          placeholder={`Message ${name.split(' ')[0]}`}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            autosize()
          }}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="btn btn-primary" disabled={!draft.trim()} aria-label="Send">
          Send
        </button>
      </form>
    </>
  )
}

export default MessagesPage
