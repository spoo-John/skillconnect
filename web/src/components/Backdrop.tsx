import { Photo } from './Photo'
import { useParallax } from '../lib/motion'
import type { PhotoKey } from '../images'
import styles from './Backdrop.module.css'

interface BackdropProps {
  photo: PhotoKey
  /** Where the dark scrim is heaviest — put it under the text. */
  scrim?: 'left' | 'right' | 'bottom' | 'even'
  /** CSS object-position for the photo, to keep the subject in frame. */
  focus?: string
  priority?: boolean
  parallax?: number
}

/**
 * Full-bleed photo behind a section's text. The parent must be `position: relative` and clip overflow.
 * A dark scrim keeps white text at WCAG contrast on any part of the photo.
 */
export function Backdrop({ photo, scrim = 'left', focus = 'center', priority = false, parallax = 0.15 }: BackdropProps) {
  const ref = useParallax<HTMLDivElement>(parallax)
  return (
    <div className={styles.root}>
      <div ref={ref} className={styles.media}>
        <Photo photo={photo} priority={priority} sizes="100vw" className={styles.img} style={{ objectPosition: focus }} />
      </div>
      <div className={`${styles.scrim} ${styles[scrim]}`} />
    </div>
  )
}
