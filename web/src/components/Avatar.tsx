import { colorForId, getInitials } from '../utils/helpers'

interface AvatarProps {
  name: string
  id: number | string
  size?: number
}

/** Initials avatar. Announced as an image named after the person. */
export function Avatar({ name, id, size = 36 }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: colorForId(id),
        color: '#fff',
        fontSize: Math.round(size * 0.38),
        fontWeight: 600,
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
    >
      <span aria-hidden="true">{getInitials(name)}</span>
    </span>
  )
}
