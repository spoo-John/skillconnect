import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '../lib/motion'

interface RevealProps {
  children: ReactNode
  as?: ElementType
  /** Delay in ms — use for staggering siblings. */
  delay?: number
  /** Animation style: rise (default), fade, or zoom (for images). */
  variant?: 'rise' | 'fade' | 'zoom'
  className?: string
  style?: CSSProperties
}

/** Fades content in as it scrolls into view. Content is always in the DOM, so crawlers and screen readers see it. */
export function Reveal({ children, as: Tag = 'div', delay = 0, variant = 'rise', className = '', style }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${inView ? 'is-visible' : ''} ${className}`}
      style={{ ...style, transitionDelay: inView && delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  )
}
