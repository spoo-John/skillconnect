/**
 * Plausible Analytics — cookieless, no personal data, so no consent banner is needed.
 * On by default for the site's own domain; set VITE_PLAUSIBLE_DOMAIN="" to turn it off,
 * or to another domain to report there. Page views are sent manually on each route change.
 */
import { DEFAULT_SITE_URL } from '../seo'

export type AnalyticsEvent = 'Signup' | 'Login' | 'Need Created' | 'Message Sent'

type PlausibleFn = ((event: string, options?: { props?: Record<string, string | number> }) => void) & {
  q?: unknown[][]
}

declare global {
  interface Window {
    plausible?: PlausibleFn
  }
}

function resolveDomain(): string {
  const configured = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  if (configured !== undefined) return configured.trim()
  try {
    return new URL(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).hostname
  } catch {
    return ''
  }
}

const DOMAIN = resolveDomain()
let started = false

export function initAnalytics() {
  if (started || !DOMAIN || typeof window === 'undefined') return
  started = true

  // Queue calls made before the script finishes loading.
  const queue: PlausibleFn = (...args) => {
    ;(queue.q = queue.q || []).push(args)
  }
  window.plausible = window.plausible || queue

  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = DOMAIN
  script.src = 'https://plausible.io/js/script.manual.js'
  document.head.appendChild(script)
}

export function trackPageview() {
  window.plausible?.('pageview')
}

export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  window.plausible?.(event, props ? { props } : undefined)
}
