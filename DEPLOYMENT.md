# Deployment Guide — Dnews Africa

## Architecture

| App | Stack | Platform |
|---|---|---|
| `apps/api` | Express + Prisma (PostgreSQL) | Railway (Docker) |
| `apps/web` | Next.js 16 (public site) | Vercel |
| `apps/cms` | Next.js 16 (admin) | Vercel |
| Database | PostgreSQL — Neon (serverless) | Neon |

Media uploads use **Cloudinary** automatically when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are set; otherwise they fall back to local `uploads/` (not suitable for production).

---

## 1. Database (Neon)

1. Create a Neon project.
2. Copy the **pooled** connection string → `DATABASE_URL` (append `?sslmode=require`).
3. Copy the **unpooled** connection string → `DIRECT_URL` (used for migrations/DDL).

## 2. API — Railway

Railway builds `apps/api/Dockerfile` (pnpm monorepo aware). The container runs `docker-start.sh`: `prisma migrate deploy` then `node dist/server.js`.

Set the following variables on the Railway service (do **not** commit the real `.env`):

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<pooled neon url>
DIRECT_URL=<unpooled neon url>
JWT_SECRET=<random string, min 32 chars>          # required; app refuses to start without it
CORS_ORIGIN=https://dnewsafrica.com,https://cms.dnewsafrica.com
CLIENT_URL=https://dnewsafrica.com
SITE_URL=https://dnewsafrica.com
API_URL=https://api.dnewsafrica.com
MEDIA_BASE_URL=https://res.cloudinary.com
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
RESEND_API_KEY=<resend key>
EMAIL_ENABLED=true
EMAIL_FROM=noreply@dnewsafrica.com       # must be a domain verified in Resend
ENABLE_API_DOCS=false
```

Notes:
- `JWT_SECRET` must be ≥ 32 chars; the app throws at startup if it's the default in production.
- Keep **one replica** — the in-process scheduler (30s poll) must not run twice.
- `trust proxy` is enabled in production for correct client IPs behind the Railway proxy.
- Set `SEED_ADMIN_PASSWORD`, `SEED_EDITOR_PASSWORD`, etc. **before** first `pnpm prisma db seed`.
- The seed script refuses to run when `NODE_ENV=production`. It only creates development data (roles, categories, demo users, demo sponsors) — never run it against the staging/production database.

### Railway config
`apps/api/railway.json` already sets the Dockerfile builder, healthcheck path (`/api/v1/public/health`), and single replica. Create the service via dashboard or:

```bash
railway up --ci
railway variables set NODE_ENV=production ...
```

## 3. Web & CMS — Vercel

Each app is a separate Vercel project rooted at `apps/web` and `apps/cms`. The `vercel.json` files pin the pnpm build/install commands. Set project env vars:

```
NEXT_PUBLIC_API_URL=https://api.dnewsafrica.com/api/v1
NEXT_PUBLIC_MEDIA_BASE_URL=https://res.cloudinary.com
NEXT_PUBLIC_SITE_URL=https://dnewsafrica.com
NEXT_PUBLIC_CONTACT_EMAIL=contact@dnewsafrica.com
NEXT_PUBLIC_SOCIAL_YOUTUBE=https://youtube.com/@dnewsafrica
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/dnewsafrica
NEXT_PUBLIC_SOCIAL_TWITTER=https://x.com/dnewsafrica
NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/dnewsafrica
```

Social links and the contact email only render when the corresponding env var is set.

Then deploy with the Vercel CLI:

```bash
vercel --prod            # from apps/web
vercel --prod            # from apps/cms
```

### Next.js image domains
`next.config.ts` image `remotePatterns` include `localhost:4000` for local dev. For production, add the API domain (e.g. `api.dnewsafrica.com`) to `images.remotePatterns` in both `apps/web/next.config.ts` and `apps/cms/next.config.ts`, or point `NEXT_PUBLIC_MEDIA_BASE_URL` at a Cloudinary base so images load from `res.cloudinary.com` (already allowed).

## 4. CI/CD

`.github/workflows/ci.yml` runs on every push/PR: lint, typecheck, API build, then API tests against a throwaway PostgreSQL 16 service. It needs no secrets.

## 5. Email

- With a `RESEND_API_KEY`, emails send via Resend; `EMAIL_FROM` must be a domain verified in Resend.
- Without a key (or `EMAIL_ENABLED=false`), emails render to `.email-captures/` and are not sent — use for local testing.
- Verify a real deliverable address from the CMS: `POST /api/v1/cms/newsletter/test-send` (Admin).

## 6. Post-deploy checks

1. `GET /api/v1/public/health` → `200 {"status":"ok","timestamp":"..."}` (liveness check)
2. Login via CMS, create an article, publish → notification email arrives.
3. Subscribe a real address on the public site → welcome email arrives (verify in Resend dashboard).
4. Upload an image in the CMS → URL is served from Cloudinary.
5. Open the public site; confirm images, SEO, and search work.
