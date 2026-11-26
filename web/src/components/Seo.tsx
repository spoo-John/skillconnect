import { useEffect } from 'react'
import { DEFAULT_SITE_URL, headTags, PAGES, type PageKey, type PageMeta } from '../seo'

const SITE_URL = import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL

type SeoProps = { page: PageKey } | Omit<PageMeta, 'sitemap'>

/**
 * Sets the title and every meta/link tag for the current page.
 * Usage: `<Seo page="browse" />`, or pass `title`, `description`, `path` for dynamic pages.
 * The build writes the same tags into static HTML, so this only updates existing tags.
 */
export function Seo(props: SeoProps) {
  const meta: Omit<PageMeta, 'sitemap'> = 'page' in props ? PAGES[props.page] : props
  const { title, description, path, noindex } = meta

  useEffect(() => {
    document.title = title
    for (const tag of headTags({ title, description, path, noindex }, SITE_URL)) {
      if (tag.kind === 'link') setLink(tag.key, tag.value)
      else setMeta(tag.kind, tag.key, tag.value)
    }
  }, [title, description, path, noindex])

  return null
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}
