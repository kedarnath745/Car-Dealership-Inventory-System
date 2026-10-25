#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: prepares Postgres and
# dependencies so backend/frontend tests and linters run immediately.
# Idempotent: safe to run on every session start.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

# --- PostgreSQL: start the local cluster and create the app role + databases ---
if command -v pg_lsclusters >/dev/null 2>&1; then
  if ! pg_lsclusters --no-header | awk '{print $4}' | grep -q online; then
    pg_ctlcluster 16 main start || service postgresql start
  fi
  for _ in $(seq 1 20); do
    pg_isready -q -h localhost && break
    sleep 1
  done

  run_psql() { (cd /tmp && su postgres -c "psql -tAc \"$1\""); }
  if [ "$(run_psql "SELECT 1 FROM pg_roles WHERE rolname='dealership'")" != "1" ]; then
    run_psql "CREATE ROLE dealership WITH LOGIN PASSWORD 'dealership' CREATEDB"
  fi
  for db in dealership dealership_test; do
    if [ "$(run_psql "SELECT 1 FROM pg_database WHERE datname='$db'")" != "1" ]; then
      run_psql "CREATE DATABASE $db OWNER dealership"
    fi
  done
fi

# --- Backend: deps, local .env, migrations and admin seed for the dev database ---
if [ -f "$ROOT/backend/package.json" ]; then
  cd "$ROOT/backend"
  npm install --no-audit --no-fund
  [ -f .env ] || cp .env.example .env
  npx prisma migrate deploy
  npm run db:seed
fi

# --- Frontend: deps (once it exists) ---
if [ -f "$ROOT/frontend/package.json" ]; then
  cd "$ROOT/frontend"
  npm install --no-audit --no-fund
fi
