#!/bin/sh
set -e

if [ -z "${DIRECT_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  echo "DIRECT_URL not set; falling back to DATABASE_URL for migrations."
  export DIRECT_URL="$DATABASE_URL"
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Dnews Africa API..."
exec node dist/server.js
