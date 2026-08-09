#!/bin/sh
set -e

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "WARNING: prisma migrate deploy failed; starting API without applying migrations."
fi

echo "Starting Dnews Africa API..."
exec node dist/server.js
