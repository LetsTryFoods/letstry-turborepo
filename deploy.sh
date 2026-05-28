#!/usr/bin/env bash
# ============================================================
#  Local deploy script — mirrors .github/workflows/ci.yml
#  exactly, step by step.
#
#  SETUP (one-time):
#    1. Copy .deploy.env.example → .deploy.env
#    2. Fill in EC2_HOST, EC2_USER, EC2_SSH_KEY_PATH
#       (env files already exist on the server — no need to set them locally)
#    3. chmod +x deploy.sh
#
#  USAGE:
#    ./deploy.sh              # full deploy (backend + frontend + admin)
#    ./deploy.sh --backend    # backend only
#    ./deploy.sh --frontend   # frontend + admin only
# ============================================================

set -euo pipefail

# ── Load local secrets ───────────────────────────────────────
DEPLOY_ENV_FILE="$(dirname "$0")/.deploy.env"
if [[ ! -f "$DEPLOY_ENV_FILE" ]]; then
  echo "❌  .deploy.env not found."
  echo "    Copy .deploy.env.example → .deploy.env and fill it in."
  exit 1
fi
# shellcheck source=/dev/null
source "$DEPLOY_ENV_FILE"

# Required variables (env files already exist on EC2 — no local env paths needed)
: "${EC2_HOST:?'EC2_HOST not set in .deploy.env'}"
: "${EC2_USER:?'EC2_USER not set in .deploy.env'}"
: "${EC2_SSH_KEY_PATH:?'EC2_SSH_KEY_PATH not set in .deploy.env'}"

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
SSH_OPTS="-i ${EC2_SSH_KEY_PATH} -o StrictHostKeyChecking=no -o ConnectTimeout=15"
REMOTE="${EC2_USER}@${EC2_HOST}"

# ── Parse flags ──────────────────────────────────────────────
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true

if [[ "${1:-}" == "--backend" ]]; then
  DEPLOY_FRONTEND=false
elif [[ "${1:-}" == "--frontend" ]]; then
  DEPLOY_BACKEND=false
fi

log() { echo -e "\n\033[1;36m▶ $*\033[0m"; }
ok()  { echo -e "\033[1;32m✔ $*\033[0m"; }
err() { echo -e "\033[1;31m✘ $*\033[0m"; }

cd "$REPO_ROOT"

# ════════════════════════════════════════════════════════════
#  STEP 1 — Install dependencies
# ════════════════════════════════════════════════════════════
log "STEP 1 — Install dependencies"
pnpm install --no-frozen-lockfile
ok "Dependencies installed"

# ════════════════════════════════════════════════════════════
#  STEPS 2-4 — Backend build & deploy
# ════════════════════════════════════════════════════════════
if [[ "$DEPLOY_BACKEND" == "true" ]]; then

  # STEP 2 — Build backend
  log "STEP 2 — Build Backend"
  rm -rf apps/backend/dist
  npx turbo run build --filter=backend --no-cache
  ok "Backend built"

  # STEP 3 — Stop backend on EC2
  log "STEP 3 — Stop Backend on EC2"
  ssh $SSH_OPTS "$REMOTE" "pm2 stop backend || true"
  ok "Backend stopped"

  # STEP 3b — Deploy backend files (mirrors easingthemes/ssh-deploy)
  log "STEP 3b — rsync apps/backend/ → EC2"
  rsync -rlgoDzvc --checksum --delete \
    -e "ssh $SSH_OPTS" \
    --exclude='node_modules/' \
    --exclude='.git/' \
    "$REPO_ROOT/apps/backend/" \
    "$REMOTE:/home/ubuntu/letstry-turborepo/apps/backend"
  ok "Backend files deployed"

  # STEP 3c — Deploy root config files
  log "STEP 3c — rsync root config → EC2"
  # NOTE: CI runs from a clean checkout; we must explicitly exclude local-only
  #       dev/junk files that wouldn't exist in a CI workspace.
  rsync -rlgoDzvc -i \
    -e "ssh $SSH_OPTS" \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='.github/' \
    --exclude='apps/' \
    --exclude='.env.production' \
    --exclude='.turbo/' \
    --exclude='.DS_Store' \
    --exclude='.deploy.env' \
    --exclude='.deploy.env.example' \
    --exclude='.expo/' \
    --exclude='.idea/' \
    --exclude='.vscode/' \
    --exclude='.gemini/' \
    --exclude='.husky/' \
    --exclude='docs/' \
    --exclude='dump.rdb' \
    --exclude='check-user.ts' \
    --exclude='test-*.ts' \
    --exclude='test-*.js' \
    --exclude='fix-*.js' \
    --exclude='update-*.js' \
    --exclude='seed-*.mjs' \
    "$REPO_ROOT/" \
    "$REMOTE:/home/ubuntu/letstry-turborepo"
  ok "Root config deployed"

  # STEP 4 — Start backend on EC2
  log "STEP 4 — Start Backend on EC2"
  # NOTE: .env.production already exists on the server — skipping env write step
  ssh $SSH_OPTS "$REMOTE" bash <<'ENDSSH'
    set -e
    cd /home/ubuntu/letstry-turborepo

    # Create logs directory
    mkdir -p logs
    chmod 755 logs

    # Install production dependencies
    if command -v pnpm &> /dev/null; then
      CI=true pnpm install --prod --no-frozen-lockfile --filter=backend
    else
      echo "pnpm not found, falling back to npm"
      npm install --production
    fi

    # Restart backend
    pm2 restart backend || pm2 start ecosystem.config.js --only backend
    sleep 5

    # Health check
    pm2 status backend | grep -q "online" || { echo "Backend failed to start!"; exit 1; }
    pm2 save
ENDSSH
  ok "Backend started and healthy"

fi

# ════════════════════════════════════════════════════════════
#  STEPS 5-8 — Frontend + Admin build & deploy
# ════════════════════════════════════════════════════════════
if [[ "$DEPLOY_FRONTEND" == "true" ]]; then

  # STEP 5 — .env files already exist on EC2 server — skipping local copy
  log "STEP 5 — Skipping .env copy (env files already exist on EC2)"

  # STEP 5b — Build Frontend, Admin, OTA
  log "STEP 5b — Build Frontend, Admin, and OTA Server"
  NEXT_TURBOPACK=0 npx turbo run build \
    --filter=frontend \
    --filter=admin \
    --filter=ota-sdui-server \
    --no-cache
  ok "Frontend, Admin, OTA built"

  # STEP 6 — Prepare standalone builds
  log "STEP 6 — Prepare Standalone Builds"

  # Frontend
  cp -r apps/frontend/public \
    apps/frontend/.next/standalone/apps/frontend/public 2>/dev/null || true
  mkdir -p apps/frontend/.next/standalone/apps/frontend/.next
  cp -r apps/frontend/.next/static \
    apps/frontend/.next/standalone/apps/frontend/.next/static

  # Admin
  cp -r apps/admin/public \
    apps/admin/.next/standalone/apps/admin/public 2>/dev/null || true
  mkdir -p apps/admin/.next/standalone/apps/admin/.next
  cp -r apps/admin/.next/static \
    apps/admin/.next/standalone/apps/admin/.next/static
  ok "Standalone builds prepared"

  # STEP 7 — Deploy Frontend + Admin to EC2
  log "STEP 7 — rsync apps/ → EC2 (excluding backend and non-production apps)"
  rsync -rlgoDzvc -i --checksum --delete \
    -e "ssh $SSH_OPTS" \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='backend/' \
    --exclude='key.pem' \
    --exclude='legacy-puncher/' \
    --exclude='let-stry-app/' \
    --exclude='letstry-mobile/' \
    --exclude='mcp-server/' \
    --exclude='proof_app/' \
    --exclude='scripts/' \
    "$REPO_ROOT/apps/" \
    "$REMOTE:/home/ubuntu/letstry-turborepo/apps"
  ok "Frontend + Admin deployed"

  # STEP 8 — Restart all services on EC2
  log "STEP 8 — Restart Frontend, Admin, OTA, QRCode on EC2"
  ssh $SSH_OPTS "$REMOTE" bash <<'ENDSSH'
    set -e
    cd /home/ubuntu/letstry-turborepo

    # Provision qrcode .env from backend's DB string
    if [ -f .env.production ]; then
      MONGO_STR=$(grep -E '^(DATABASE_URL|MONGODB_CONNECTION_STRING)=' .env.production | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'")
      if [ -n "$MONGO_STR" ]; then
        mkdir -p apps/qrcode
        echo "PORT=8000"          > apps/qrcode/.env
        echo "MONGO_URI=$MONGO_STR" >> apps/qrcode/.env
        echo "DB_NAME=letstry_dev" >> apps/qrcode/.env
      fi
    fi

    # Install OTA + QRCode prod deps
    if command -v pnpm &> /dev/null; then
      CI=true pnpm install --prod --no-frozen-lockfile --filter=ota-sdui-server --filter=qrcode
    else
      npm install --production
    fi

    pm2 restart frontend        || pm2 start ecosystem.config.js --only frontend
    pm2 restart admin           || pm2 start ecosystem.config.js --only admin
    pm2 restart ota-sdui-server || pm2 start ecosystem.config.js --only ota-sdui-server
    pm2 restart qrcode          || pm2 start ecosystem.config.js --only qrcode

    sleep 5

    pm2 status frontend        | grep -q "online" || { echo "Frontend failed!";   exit 1; }
    pm2 status admin           | grep -q "online" || { echo "Admin failed!";      exit 1; }
    pm2 status ota-sdui-server | grep -q "online" || { echo "OTA SDUI failed!";   exit 1; }
    pm2 status qrcode          | grep -q "online" || { echo "QRCode failed!";     exit 1; }

    pm2 save
ENDSSH
  ok "All services restarted and healthy"

fi

# ════════════════════════════════════════════════════════════
#  STEP 9 — Final PM2 status
# ════════════════════════════════════════════════════════════
log "STEP 9 — Final PM2 Status"
ssh $SSH_OPTS "$REMOTE" "pm2 status"

echo -e "\n\033[1;32m🚀  Deploy complete!\033[0m"
