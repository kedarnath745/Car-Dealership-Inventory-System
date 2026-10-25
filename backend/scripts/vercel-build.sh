#!/bin/sh
# Build step for the backend service on Vercel (see the root vercel.json).
# Vercel bundles the TypeScript itself; this script only prepares the database.
# Migrations and the seed use the direct (unpooled) Neon connection when available,
# because schema changes should not go through a connection pooler. The seed is
# idempotent: it creates the admin and sample cars only when they are missing.
set -e
MIGRATION_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"
DATABASE_URL="$MIGRATION_URL" npx prisma migrate deploy
DATABASE_URL="$MIGRATION_URL" npm run db:seed
