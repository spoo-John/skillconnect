import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** True once the element has scrolled into view (stays true). Visible immediately without IntersectionObserver. */
export function useInView<T extends Element>(options: IntersectionObserverInit = { rootMargin: '0px 0px -10% 0px' }) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        io.disconnect()
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return { ref, inView }
}

/** Counts from 0 to `target` with an ease-out curve once `start` is true. */
export function useCountUp(target: number | null, start = true, duration = 900): number | null {
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    if (target == null || !start) return
    if (prefersReducedMotion() || target <= 1) {
      setValue(target)
      return
    }
    let frame = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start, duration])

  return value
}

/** Cycles through `count` items every `interval` ms; pauses for reduced motion and hidden tabs. */
export function useCycle(count: number, interval = 2400): number {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (count < 2 || prefersReducedMotion()) return
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count)
    }, interval)
    return () => clearInterval(id)
  }, [count, interval])
  return index
}

/**
 * Moves the element at `speed` × the page's scroll offset relative to its section, for a gentle parallax.
 * Writes transform directly (no re-render). Off for reduced motion.
 */
export function useParallax<T extends HTMLElement>(speed = 0.2) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let frame = 0
    const update = () => {
      frame = 0
      const host = el.parentElement
      if (!host) return
      const rect = host.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      const max = host.offsetHeight * 0.1
      const y = Math.max(-max, Math.min(max, -rect.top * speed))
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [speed])
  return ref
}
