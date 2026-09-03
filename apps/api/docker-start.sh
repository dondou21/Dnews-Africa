#!/bin/sh
set -e

normalize_database_url() {
  value="$1"
  name="$2"
  case "$value" in
    postgres://*) value="postgresql://${value#postgres://}" ;;
    postgresql://*) ;;
    *) echo "$name must use the postgresql:// scheme (check the Railway variable; do not include a psql command)." >&2; exit 1 ;;
  esac
  printf '%s' "$value"
}

if [ -n "${DATABASE_URL:-}" ]; then
  DATABASE_URL="$(normalize_database_url "$DATABASE_URL" DATABASE_URL)"
  export DATABASE_URL
else
  echo "DATABASE_URL is required before running migrations." >&2
  exit 1
fi

if [ -z "${DIRECT_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  echo "DIRECT_URL not set; falling back to DATABASE_URL for migrations."
  export DIRECT_URL="$DATABASE_URL"
elif [ -n "${DIRECT_URL:-}" ]; then
  DIRECT_URL="$(normalize_database_url "$DIRECT_URL" DIRECT_URL)"
  export DIRECT_URL
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Dnews Africa API..."
exec node dist/server.js
