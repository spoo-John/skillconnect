import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { absoluteUrl, DEFAULT_SITE_URL, headTags, PAGES, SITE_NAME, type PageMeta } from './src/seo'

const SEO_START = '<!-- seo:start -->'
const SEO_END = '<!-- seo:end -->'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderHead(meta: PageMeta, siteUrl: string): string {
  const tags = headTags(meta, siteUrl).map((t) =>
    t.kind === 'link'
      ? `<link rel="${t.key}" href="${escapeHtml(t.value)}" />`
      : `<meta ${t.kind}="${t.key}" content="${escapeHtml(t.value)}" />`
  )
  return [SEO_START, `<title>${escapeHtml(meta.title)}</title>`, ...tags, SEO_END].join('\n    ')
}

function withHead(html: string, meta: PageMeta, siteUrl: string): string {
  const start = html.indexOf(SEO_START)
  const end = html.indexOf(SEO_END)
  if (start === -1 || end === -1) throw new Error('index.html is missing the seo:start / seo:end markers')
  return html.slice(0, start) + renderHead(meta, siteUrl) + html.slice(end + SEO_END.length)
}

/**
 * Writes route-specific HTML (so crawlers and link previews see the right meta without JS),
 * plus 404.html, sitemap.xml, robots.txt and llms.txt. Route data lives in src/seo.ts.
 */
function seo(siteUrl: string): Plugin {
  return {
    name: 'skillconnect-seo',
    enforce: 'post',
    transformIndexHtml: (html) => withHead(html, PAGES.home, siteUrl),
    generateBundle(_, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') return
      const shell = String(index.source)

      for (const [key, meta] of Object.entries(PAGES) as [string, PageMeta][]) {
        if (key === 'home') continue
        const fileName = key === 'notFound' ? '404.html' : `${meta.path.slice(1)}.html`
        this.emitFile({ type: 'asset', fileName, source: withHead(shell, meta, siteUrl) })
      }

      const today = new Date().toISOString().slice(0, 10)
      const urls = Object.values(PAGES as Record<string, PageMeta>)
        .filter((p) => p.sitemap)
        .map(
          (p) =>
            `  <url>\n    <loc>${absoluteUrl(siteUrl, p.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`
        )
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      })

      const privatePaths = Object.values(PAGES as Record<string, PageMeta>)
        .filter((p) => p.noindex && p.path !== '/404')
        .map((p) => `Disallow: ${p.path}`)
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: ['User-agent: *', 'Allow: /', ...privatePaths, '', `Sitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}`, ''].join('\n'),
      })

      this.emitFile({
        type: 'asset',
        fileName: 'llms.txt',
        source: [
          `# ${SITE_NAME}`,
          '',
          `> ${PAGES.home.description}`,
          '',
          '## Pages',
          '',
          ...Object.values(PAGES as Record<string, PageMeta>)
            .filter((p) => p.sitemap)
            .map((p) => `- [${p.title.split(' — ')[0]}](${absoluteUrl(siteUrl, p.path)}): ${p.description}`),
          '',
        ].join('\n'),
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = env.VITE_SITE_URL || DEFAULT_SITE_URL
  return {
    plugins: [react(), seo(siteUrl)],
    build: {
      target: 'es2020',
      sourcemap: true,
    },
  }
})
