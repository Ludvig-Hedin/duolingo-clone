#!/usr/bin/env bash
#
# Finish the Vercel deployment in one shot:
#   1. set production environment variables
#   2. deploy to production
#   3. point NEXT_PUBLIC_APP_URL at the real deployment URL and redeploy
#   4. seed the Neon database (Spanish, Swedish -> Polish, Polish -> Swedish)
#
# The project is already created + linked (see .vercel/). The only inputs that
# cannot be automated are the credentials from your own accounts:
#   - DATABASE_URL                      (Neon -> Connect -> pooled string)
#   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (Clerk -> API Keys, pk_test_...)
#   - CLERK_SECRET_KEY                  (Clerk -> API Keys, sk_test_...)
# Optional (a placeholder is used if left blank):
#   - STRIPE_API_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLERK_ADMIN_IDS
#
# Run interactively:   bash scripts/finish-deploy.sh
# Or pre-seed via env:  DATABASE_URL=... NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
#                       CLERK_SECRET_KEY=... bash scripts/finish-deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

command -v vercel >/dev/null || { echo "ERROR: vercel CLI not found (npm i -g vercel)"; exit 1; }
command -v bun    >/dev/null || { echo "ERROR: bun not found"; exit 1; }
[ -d .vercel ] || { echo "ERROR: project not linked. Run: vercel link"; exit 1; }

# ask <var-name> <prompt> <default> <silent?>
ask() {
  local name="$1" message="$2" default="${3:-}" silent="${4:-}" val="${!1:-}"
  if [ -n "$val" ]; then printf '%s' "$val"; return; fi
  if [ -n "$silent" ]; then read -rsp "$message" val; echo >&2; else read -rp "$message" val; fi
  printf '%s' "${val:-$default}"
}

DATABASE_URL="$(ask DATABASE_URL 'Neon DATABASE_URL (postgresql://...): ' '' silent)"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$(ask NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 'Clerk publishable key (pk_test_...): ' '')"
CLERK_SECRET_KEY="$(ask CLERK_SECRET_KEY 'Clerk secret key (sk_test_...): ' '' silent)"
STRIPE_API_SECRET_KEY="$(ask STRIPE_API_SECRET_KEY 'Stripe secret key [blank = placeholder]: ' 'sk_test_placeholder' silent)"
STRIPE_WEBHOOK_SECRET="$(ask STRIPE_WEBHOOK_SECRET 'Stripe webhook secret [blank = placeholder]: ' 'whsec_placeholder' silent)"
CLERK_ADMIN_IDS="$(ask CLERK_ADMIN_IDS 'Clerk admin user id(s) [blank = placeholder]: ' 'user_placeholder')"

for v in DATABASE_URL NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY; do
  [ -n "${!v}" ] || { echo "ERROR: $v is required"; exit 1; }
done

set_env() { # KEY VALUE
  vercel env rm "$1" production --yes >/dev/null 2>&1 || true
  printf '%s' "$2" | vercel env add "$1" production >/dev/null
  echo "  set $1"
}

echo "==> Setting production environment variables"
set_env DATABASE_URL                      "$DATABASE_URL"
set_env NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
set_env CLERK_SECRET_KEY                   "$CLERK_SECRET_KEY"
set_env STRIPE_API_SECRET_KEY             "$STRIPE_API_SECRET_KEY"
set_env STRIPE_WEBHOOK_SECRET             "$STRIPE_WEBHOOK_SECRET"
set_env CLERK_ADMIN_IDS                   "$CLERK_ADMIN_IDS"

echo "==> Deploying to production"
URL="$(vercel deploy --prod | tail -1)"
echo "    deployed: $URL"

if [ -n "$URL" ]; then
  echo "==> Pointing NEXT_PUBLIC_APP_URL at $URL and redeploying"
  set_env NEXT_PUBLIC_APP_URL "$URL"
  URL="$(vercel deploy --prod | tail -1)"
fi

echo "==> Seeding database (Spanish, Swedish -> Polish, Polish -> Swedish)"
DATABASE_URL="$DATABASE_URL" bun run db:push
DATABASE_URL="$DATABASE_URL" bun run db:prod

echo ""
echo "Done. Open ${URL}/courses — you should see three courses:"
echo "  - Spanish"
echo "  - Swedish -> Polish"
echo "  - Polish -> Swedish"
