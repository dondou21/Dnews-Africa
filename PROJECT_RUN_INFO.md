# Dnews Africa — Project Run Info

## 1. Project Structure

Monorepo (Turborepo, pnpm workspaces):

```
dnews-africa/
├── apps/
│   ├── web/          # Public-facing Next.js site
│   ├── cms/          # Dashboard/admin Next.js app
│   └── api/          # Express REST API
├── packages/
│   ├── types/        # Shared TypeScript types (@dnews/types)
│   ├── validation/   # Zod validation schemas (@dnews/validation)
│   └── api-client/   # API fetch wrapper (@dnews/api-client)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 2. Workspace Configuration

**Package manager:** `pnpm@10.10.0` (enforced via `packageManager` field)

**Turborepo:** Yes, v2.10.5

**Workspace packages:**

| package.json name | Path |
|---|---|
| `dnews-africa` | root |
| `@dnews/web` | `apps/web` |
| `@dnews/cms` | `apps/cms` |
| `@dnews/api` | `apps/api` |
| `@dnews/types` | `packages/types` |
| `@dnews/validation` | `packages/validation` |
| `@dnews/api-client` | `packages/api-client` |

**Root scripts:**

```json
{
  "dev": "turbo dev",
  "build": "turbo build",
  "lint": "turbo lint",
  "api:dev": "turbo dev --filter=@dnews/api",
  "web:dev": "turbo dev --filter=@dnews/web",
  "cms:dev": "turbo dev --filter=@dnews/cms"
}
```

## 3. Development Commands

| Action | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Run all apps in parallel | `pnpm dev` |
| Run only the Web app | `pnpm web:dev` |
| Run only the CMS | `pnpm cms:dev` |
| Run only the API | `pnpm api:dev` |
| Build the project | `pnpm build` |
| Lint the project | `pnpm lint` |

## 4. Ports

| App | Port | URL |
|---|---|---|
| Web (public site) | 3000 | http://localhost:3000 |
| CMS (dashboard) | 3001 | http://localhost:3001 |
| API | 4000 | http://localhost:4000 |

## 5. Environment Variables

### API (`apps/api/.env`)

```text
PORT
NODE_ENV
CORS_ORIGIN
DATABASE_URL
DIRECT_URL
JWT_SECRET
JWT_EXPIRES_IN
ENABLE_API_DOCS
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
API_URL
MEDIA_BASE_URL
UPLOAD_DIR
```

### Web & CMS (`apps/web/.env.local`, `apps/cms/.env.local`)

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_MEDIA_BASE_URL
NEXT_PUBLIC_SITE_URL
```

Cloudinary vars may be left empty — the API falls back to local disk storage when they are not set.

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16.2.10 (Turbopack) |
| CMS framework | Next.js 16.2.10 (Turbopack) |
| Backend framework | Express 4.22 |
| Language | TypeScript 5 |
| Database | PostgreSQL |
| ORM | Prisma 6.19 |
| Auth | JWT (jsonwebtoken) |
| Image storage | Cloudinary (optional — falls back to local disk) |
| Styling | Tailwind CSS 4 |
| UI icons | lucide-react, react-icons |
| Dev runner | tsx + nodemon (API) |
| Package manager | pnpm 10.10.0 |
| Monorepo tool | Turborepo 2.10.5 |

## 7. Current Known Issue

The development environment was broken on Windows due to:

1. **Corrupted `@turbo/windows-64` native binary** — pnpm store had a corrupt `turbo.exe`. Fixed by clearing the pnpm store and reinstalling.
2. **`turbo.json` used `pipeline` instead of `tasks`** — renamed in Turbo 2.0. Fixed.
3. **Cloudinary module-level throw** — `cloudinary.ts` called `initializeCloudinary()` at module scope, crashing the API when Cloudinary env vars were absent. Changed to lazy `getCloudinaryInstance()` returning `null`.
4. **Routes mounted at `/api/v1/public/***` but frontend expected `/api/v1/***`** — Fixed by mounting public router directly at `/`.
5. **`getMediaPublicUrl` not exported** — `mediaService.ts` had the function as private but `formatArticle.ts` imported it. Added `export`.
6. **Missing `commentController.getById` and `commentService.getById`** — Route existed but handler was undefined. Implemented.

**Current status:** All three servers start and the API serves articles, categories, health check, and featured articles correctly. The homepage should load from the API.

## 8. Important Notes

- **Windows only fix applied.** The corrupted turbo binary was specific to this environment. On a fresh clone, `pnpm install && pnpm dev` should work.
- **Prisma client must be generated.** If the API crashes with `Cannot find module '.prisma/client/default'`, run `pnpm --filter @dnews/api prisma:generate`.
- **API auto-restarts** via nodemon + tsx on file changes.
- **Web and CMS use Turbopack** for hot reload (Next.js 16).
- **Shared packages don't need pre-building** — Turbopack resolves TS imports directly.
- **Database must be running.** The API connects to PostgreSQL at `DATABASE_URL`. Without it, article/category/cms endpoints will fail.
- **Rate limiting is active.** 1000 req/15min for dev, 100 for production.
- **Cloudinary is optional.** When env vars are unset, uploads go to `apps/api/uploads/`.
- **CMS auth** uses JWT stored in `localStorage`. Login at `http://localhost:3001/login`.
