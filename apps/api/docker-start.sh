#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Dnews Africa API..."
exec node dist/server.js
