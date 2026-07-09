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

## Local Setup

### Prerequisites

- Node.js 22+
- PostgreSQL running locally
- npm

### 1. Environment variables

```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed the database

```bash
npm run prisma:seed
```

### 5. Start development server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

---

## Docker Setup

### Prerequisites

- Docker and Docker Compose

### 1. Build and start

```bash
cd server
docker compose up --build
```

### 2. Run migrations (first time)

```bash
docker compose exec backend npx prisma migrate deploy
```

### 3. Seed the database

```bash
docker compose exec backend npx prisma db seed
```

### 4. Stop

```bash
docker compose down
```

To remove volumes as well (resets database):

```bash
docker compose down -v
```

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