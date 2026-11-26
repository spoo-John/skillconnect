/** Brand mark: two connected nodes. Same drawing as public/favicon.svg. */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M11 21L21 11" stroke="var(--on-accent)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="10.5" cy="21.5" r="4" fill="var(--on-accent)" />
      <circle cx="21.5" cy="10.5" r="4" fill="var(--on-accent)" />
    </svg>
  )
}

export function Logo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, letterSpacing: '-0.01em' }}>
      <LogoMark />
      <span>SkillConnect</span>
    </span>
  )
}
