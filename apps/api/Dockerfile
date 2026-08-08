FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/validation/package.json ./packages/validation/

RUN pnpm install --frozen-lockfile --filter api...

COPY packages/types ./packages/types
COPY packages/validation ./packages/validation
COPY apps/api ./apps/api

RUN pnpm --filter api exec prisma generate

RUN mkdir -p /prisma && cp -r /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client /prisma/client

RUN pnpm --filter api... build

FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 express

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/validation/package.json ./packages/validation/

RUN pnpm install --frozen-lockfile --filter api... --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /prisma/client /prisma/client
RUN PRISMA_DIR=$(dirname "$(dirname "$(readlink -f /app/apps/api/node_modules/@prisma/client)")") && \
    mkdir -p "$PRISMA_DIR/.prisma" && \
    cp -r /prisma/client/. "$PRISMA_DIR/.prisma/client"
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/docker-start.sh ./apps/api/docker-start.sh
RUN chmod +x /app/apps/api/docker-start.sh

RUN mkdir -p /app/apps/api/uploads && chown -R express:nodejs /app

USER express

EXPOSE 4000

WORKDIR /app/apps/api

CMD ["./docker-start.sh"]
