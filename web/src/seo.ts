/**
 * Single source of truth for page metadata.
 * Used at runtime by <Seo /> and at build time by the `seo` plugin in vite.config.ts,
 * which writes one static HTML file per route plus sitemap.xml and robots.txt.
 * Keep this file free of browser APIs and `import.meta.env` so Node can import it.
 */

export const SITE_NAME = 'SkillConnect'
export const DEFAULT_SITE_URL = 'https://skillconnect.app'
export const OG_IMAGE_PATH = '/og.png'
export const OG_IMAGE_ALT = 'SkillConnect — hire tech talent directly'
export const CONTACT_EMAIL = 'privacy@skillconnect.app'

export interface PageMeta {
  path: string
  title: string
  description: string
  /** Keep out of search results (private or utility pages). */
  noindex?: boolean
  /** Include in sitemap.xml. */
  sitemap?: boolean
}

export const PAGES = {
  home: {
    path: '/',
    title: 'SkillConnect — Hire tech talent directly',
    description:
      'Post what you need and message developers, designers and security professionals directly. No agency in between, and posting is free.',
    sitemap: true,
  },
  browse: {
    path: '/browse',
    title: 'Browse professionals — SkillConnect',
    description:
      'Search developers, designers, data and security professionals by skill, see their work, and message them directly.',
    sitemap: true,
  },
  register: {
    path: '/register',
    title: 'Create an account — SkillConnect',
    description: 'Join SkillConnect free, as a client who needs tech help or a professional who offers it.',
    sitemap: true,
  },
  login: {
    path: '/login',
    title: 'Log in — SkillConnect',
    description: 'Log in to SkillConnect to manage your needs and messages.',
    sitemap: true,
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy policy — SkillConnect',
    description: 'What SkillConnect collects, why, how long it is kept, and how to have your data deleted.',
    sitemap: true,
  },
  profile: {
    path: '/profile',
    title: 'Profile — SkillConnect',
    description: 'A SkillConnect professional: skills, background and portfolio.',
  },
  dashboard: {
    path: '/dashboard',
    title: 'Dashboard — SkillConnect',
    description: 'Your needs and the open needs that match your skills.',
    noindex: true,
  },
  postNeed: {
    path: '/post-need',
    title: 'Post a need — SkillConnect',
    description: 'Describe what you need built or fixed, and hear from professionals who can do it.',
    noindex: true,
  },
  messages: {
    path: '/messages',
    title: 'Messages — SkillConnect',
    description: 'Your conversations on SkillConnect.',
    noindex: true,
  },
  notFound: {
    path: '/404',
    title: 'Page not found — SkillConnect',
    description: 'This page does not exist. Browse professionals or go back to the SkillConnect home page.',
    noindex: true,
  },
} satisfies Record<string, PageMeta>

export type PageKey = keyof typeof PAGES

export interface HeadTag {
  /** `name` → <meta name>, `property` → <meta property>, `link` → <link rel>. */
  kind: 'name' | 'property' | 'link'
  key: string
  value: string
}

export function absoluteUrl(siteUrl: string, path: string): string {
  return siteUrl.replace(/\/+$/, '') + (path.startsWith('/') ? path : `/${path}`)
}

/** Every head tag a page needs, in one list both the build plugin and <Seo /> render. */
export function headTags(meta: Omit<PageMeta, 'sitemap'>, siteUrl: string): HeadTag[] {
  const url = absoluteUrl(siteUrl, meta.path)
  const image = absoluteUrl(siteUrl, OG_IMAGE_PATH)
  return [
    { kind: 'name', key: 'description', value: meta.description },
    { kind: 'name', key: 'robots', value: meta.noindex ? 'noindex, nofollow' : 'index, follow' },
    { kind: 'link', key: 'canonical', value: url },
    { kind: 'property', key: 'og:type', value: 'website' },
    { kind: 'property', key: 'og:site_name', value: SITE_NAME },
    { kind: 'property', key: 'og:title', value: meta.title },
    { kind: 'property', key: 'og:description', value: meta.description },
    { kind: 'property', key: 'og:url', value: url },
    { kind: 'property', key: 'og:image', value: image },
    { kind: 'property', key: 'og:image:width', value: '1200' },
    { kind: 'property', key: 'og:image:height', value: '630' },
    { kind: 'property', key: 'og:image:alt', value: OG_IMAGE_ALT },
    { kind: 'name', key: 'twitter:card', value: 'summary_large_image' },
    { kind: 'name', key: 'twitter:title', value: meta.title },
    { kind: 'name', key: 'twitter:description', value: meta.description },
    { kind: 'name', key: 'twitter:image', value: image },
    { kind: 'name', key: 'twitter:image:alt', value: OG_IMAGE_ALT },
  ]
}
