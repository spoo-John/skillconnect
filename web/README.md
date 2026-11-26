# SkillConnect web

Hire tech talent directly. Clients post what they need; developers, designers and security professionals are found by skill and messaged directly.

## Run it

```bash
npm install
cp .env.example .env   # set VITE_SITE_URL to your domain
npm run dev
```

## Build and deploy

```bash
npm run build          # outputs dist/
```

`dist/` is a static site. Deploy to Vercel (`vercel.json` included) or Netlify (`public/_redirects` included). The build writes one HTML file per route with its own title, description and Open Graph tags, plus `sitemap.xml`, `robots.txt`, `404.html` and `llms.txt`.

## Analytics

Plausible (cookieless). It reports to the host of `VITE_SITE_URL` by default — add that domain in your Plausible account. Set `VITE_PLAUSIBLE_DOMAIN=` (empty) to turn it off.

## Docs

- `AGENTS.md` — structure, conventions, how to add a page
- SRS and System Design documents — shared separately
