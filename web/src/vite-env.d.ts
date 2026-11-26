/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL. Defaults to the production Railway API. */
  readonly VITE_API_URL?: string
  /** Public URL of this site, e.g. https://skillconnect.app — used for canonical URLs, sitemap and OG tags. */
  readonly VITE_SITE_URL?: string
  /** Plausible domain. Defaults to the host of VITE_SITE_URL; set to "" to disable analytics. */
  readonly VITE_PLAUSIBLE_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
