#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "${APP_DIR}"

if [[ ! -f ".env.production" ]]; then
  echo "No existe .env.production en ${APP_DIR}"
  echo "Crea ese archivo con CRM_AUTH_SECRET antes de desplegar"
  exit 1
fi

if [[ -f "data/db.json" ]]; then
  mkdir -p backups
  cp "data/db.json" "backups/db-$(date +%Y%m%d-%H%M%S).json"
fi

git pull --ff-only
npm ci
npm run build
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

echo "Deploy completado"
