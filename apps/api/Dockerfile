FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 express

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY docker-start.sh ./
RUN chmod +x docker-start.sh

RUN mkdir -p /app/uploads && chown -R express:nodejs /app

USER express

EXPOSE 4000

ENV NODE_ENV=production

CMD ["./docker-start.sh"]
