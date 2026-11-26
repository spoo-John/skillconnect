# SkillConnect

Hire tech talent directly. Clients post what they need; professionals are found by skill and messaged directly.

| Folder | What | Hosted on |
| --- | --- | --- |
| `web/` | React + Vite + TypeScript frontend | Vercel (Root Directory: `web`) |
| `backend/` | Express API (`/api/*`) backed by Supabase | Railway (Root Directory: `backend`) |

## Local development

```bash
# API
cd backend && cp .env.example .env   # fill in values
npm install && npm start             # http://localhost:5000

# Web
cd web && cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install && npm run dev
```

## Environment variables

**Railway (backend):** `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, `CORS_ORIGIN` (your Vercel URL / domain, comma-separated).

**Vercel (web):** `VITE_API_URL` (Railway URL + `/api`), `VITE_SITE_URL` (your public site URL).

Never commit `.env` files — they're gitignored.
