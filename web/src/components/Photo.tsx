import type { CSSProperties } from 'react'
import { PHOTOS, type PhotoKey } from '../images'

interface PhotoProps {
  photo: PhotoKey
  /** Layout width hint for the browser, e.g. "(min-width: 960px) 50vw, 100vw". */
  sizes?: string
  /** Above-the-fold images load eagerly with high priority; everything else lazily. */
  priority?: boolean
  className?: string
  style?: CSSProperties
}

/** Responsive photo: WebP with JPEG fallback, two widths, intrinsic size set to avoid layout shift. */
export function Photo({ photo, sizes = '100vw', priority = false, className, style }: PhotoProps) {
  const p = PHOTOS[photo]
  const set = (ext: string) => `/images/${p.name}-640.${ext} 640w, /images/${p.name}-1280.${ext} 1280w`
  return (
    <picture>
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/images/${p.name}-1280.jpg`}
        srcSet={set('jpg')}
        sizes={sizes}
        width={p.width}
        height={p.height}
        alt={p.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // React 18 doesn't know fetchPriority yet; pass it as a lowercase DOM attribute.
        {...{ fetchpriority: priority ? 'high' : 'auto' }}
        className={className}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...style }}
      />
    </picture>
  )
}
