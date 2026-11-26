/** Muted avatar palette; readable with white initials in light and dark mode. */
export const AVATAR_COLORS = ['#1B5E45', '#2F6F91', '#8B5E34', '#6B5B95', '#4A7856', '#7A5230']

/** Stable colour per user id, so a person keeps the same colour on every screen. */
export function colorForId(id: number | string): string {
  const n = typeof id === 'number' ? id : [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[Math.abs(n) % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  )
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatBudget(budget?: number | null, currency?: string): string {
  if (budget == null || Number.isNaN(Number(budget))) return ''
  return `${currency || 'KSh'} ${Number(budget).toLocaleString()}`
}

/** Deterministic conversation id shared by both participants, regardless of who opens it first. */
export function conversationId(a: number, b: number): string {
  return `conv_${Math.min(a, b)}_${Math.max(a, b)}`
}

/** Only follow `?next=` when it is a path on this site — never an external URL. */
export function safeNext(next: string | null, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
