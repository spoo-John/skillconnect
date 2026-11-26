# AGENTS.md

Guide for coding agents (and humans) working in this repo. Read this before editing.

## What this is

SkillConnect web: a React 18 + Vite 5 + TypeScript SPA. Clients post tech "needs"; professionals are browsed and messaged directly. All data comes from the REST API in `src/api/client.ts` (backend lives elsewhere, on Railway).

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Type-check | `npm run typecheck` |
| Production build (type-check + bundle + SEO files) | `npm run build` |
| Preview the build | `npm run preview` |

`npm run build` must pass before any change is done. There is no test runner yet.

## Layout

```
src/
  App.tsx            routes; every page except Home is lazy-loaded
  seo.ts             page titles/descriptions — shared by <Seo/> and the build plugin
  constants.ts       skill list (API values + labels), currencies, limits
  api/client.ts      the only place that calls fetch; typed per endpoint
  context/           AuthContext: session (user, token), login/register/logout
  lib/               analytics.ts (Plausible), useAsync.ts (loading/error/retry), motion.ts
  images.ts          photo registry with alt text
  components/        Navbar, Layout, Seo, Avatar, Logo, Photo, Backdrop, Reveal, RequireAuth, ErrorBoundary, States
  pages/             one file + one CSS module per route
  styles/theme.css   design tokens + primitives (.btn, .input, .card, .chip, .tag, .skeleton, .alert)
vite.config.ts       `seo` plugin: per-route HTML, 404.html, sitemap.xml, robots.txt, llms.txt
public/              images/, favicons, og.png, site.webmanifest, _redirects
```

## Conventions

- **Data views** use `useAsync` and render all four states: loading (`Skeleton`), empty (`EmptyState`), error (`ErrorState` with retry), ready.
- **Styling**: colours, radii, type sizes come from tokens in `theme.css`; never hard-code a hex in a page. Page CSS modules hold layout only. Dark mode is automatic through tokens.
- **Buttons/inputs**: use the primitives (`className="btn btn-primary"`, `className="input"`), not new button styles.
- **Skills**: always store `value` from `SKILLS`, display with `skillLabel()`. Never rename existing values — the API already holds them.
- **Users' `skills`**: read through `parseSkills()`; the API returns an array or a JSON string.
- **Photos**: add the source to `public/images` as `<name>-640` and `<name>-1280` in `.webp` and `.jpg`, register it with alt text in `src/images.ts`, and render it with `<Photo photo="…" sizes="…" />`, or full-screen behind text with `<Backdrop photo="…" scrim="left|right|bottom|even" />` (text on a backdrop is always white). Only the first photo on a page gets `priority`.
- **Motion**: use `<Reveal>` for content that scrolls into view, the `stagger` class (with `--i` on each child) for lists that load, and helpers in `src/lib/motion.ts` (`useInView`, `useCountUp`, `useCycle`). One easing curve (`--ease-out`). Everything must still work under `prefers-reduced-motion`.
- **Images**: every `<img>` needs `alt` (empty `alt=""` only when purely decorative). Avatars use `<Avatar>`, which is labelled for screen readers.
- **Private pages**: wrap the route in `<RequireAuth>` and add `noindex: true` in `seo.ts`.
- **No invented data**: no placeholder ratings, testimonials, stats or badges. Show real data or nothing.

## Adding a page

1. `src/pages/FooPage.tsx` (named + default export) and `FooPage.module.css`.
2. Add an entry to `PAGES` in `src/seo.ts` (`sitemap: true` if public).
3. Add the route in `src/App.tsx` (lazy import).
4. Render `<Seo page="foo" />` at the top of the page.
5. `npm run build`, check `dist/foo.html` has the right `<title>`.

## Environment

See `.env.example`. `VITE_SITE_URL` must be the real domain before a production build.
