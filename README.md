# Dnews Africa

Full-stack news platform built with Next.js and Express.

## Architecture

```
dnews-africa/
├── client/     # Next.js frontend application
├── server/     # Express backend API
└── README.md
```

### Client

Next.js frontend with React, TypeScript, and Tailwind CSS.

```bash
cd client
npm install
npm run dev
```

### Server

Express backend with TypeScript, Prisma ORM, and PostgreSQL.

---

## Quick Start (Docker)

The fastest way to get the backend running with PostgreSQL.

### Prerequisites

- Docker and Docker Compose

### 1. Start PostgreSQL

```bash
cd server
docker compose up -d db
```

### 2. Install dependencies and run migrations

```bash
npm install
npx prisma migrate dev
```

### 3. Seed the database

```bash
npx prisma db seed
```

### 4. Start the dev server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

---

## Local Setup (without Docker)

### Prerequisites

- Node.js 22+
- PostgreSQL 16+ running locally
- npm

### 1. Create the database

```bash
createdb dnews_africa
```

### 2. Install dependencies

```bash
cd server
npm install
```

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Seed the database

```bash
npx prisma db seed
```

### 5. Start development server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

---

## API Endpoints

### Documentation

- **Swagger UI**: `http://localhost:4000/api/docs` (when `ENABLE_API_DOCS=true`)
- **Health Check**: `GET http://localhost:4000/api/health`

### Authentication

All protected endpoints require a JWT Bearer token:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`.

---

## Local Development Database

### Start database

```bash
cd server
docker compose up -d
```

### Stop database

```bash
cd server
docker compose down
```

### Reset database (deletes all data)

```bash
cd server
docker compose down -v
docker compose up -d
```

### Run migrations

```bash
cd server
npx prisma migrate dev
```

### Seed database

```bash
cd server
npx prisma db seed
```

### Open Prisma Studio

```bash
cd server
npx prisma studio
```

All commands above are also available as npm scripts with `db:` prefix:

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start PostgreSQL |
| `npm run db:down` | Stop PostgreSQL |
| `npm run db:reset` | Reset database (deletes all data) |
| `npm run db:migrate` | Run development migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Database

### Commands

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run development migrations |
| `npm run prisma:migrate:deploy` | Run production migrations |
| `npm run prisma:seed` | Seed the database with initial data |
| `npm run prisma:studio` | Open Prisma Studio GUI |

### Models

- Role, User, Category, Article, Tag, ArticleTag
- Comment (with guest support and moderation)
- NewsletterSubscriber, ContactMessage, Media

---

## Build for Production

```bash
cd server
npm run build
npm start
```

---

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Express 4
- **Language**: TypeScript
- **ORM**: Prisma 6
- **Database**: PostgreSQL 16
- **Validation**: Zod
- **Auth**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting (express-rate-limit)
- **File Uploads**: Multer
- **API Docs**: Swagger UI + OpenAPI 3.0