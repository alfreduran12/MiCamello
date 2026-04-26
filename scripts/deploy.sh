#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  scripts/deploy.sh — PRIMER DEPLOY en el VPS
#  Uso: bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────
set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo ""
echo "══════════════════════════════════════════"
echo "  Mi Notion — Primer deploy"
echo "══════════════════════════════════════════"

# 1. Verificar .env
if [ ! -f ".env" ]; then
  echo ""
  echo "❌  Falta el archivo .env"
  echo "    Copia la plantilla y edítala:"
  echo "    cp .env.example .env && nano .env"
  exit 1
fi

# 2. Verificar variables críticas
source .env
if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "CAMBIA_ESTO" ]; then
  echo ""
  echo "❌  NEXTAUTH_SECRET no está configurado en .env"
  echo "    Genera uno con: openssl rand -base64 32"
  exit 1
fi
if [ -z "$NEXTAUTH_URL" ] || [[ "$NEXTAUTH_URL" == *"tudominio"* ]]; then
  echo ""
  echo "❌  NEXTAUTH_URL no está configurado en .env"
  echo "    Ej: NEXTAUTH_URL=https://mi-dominio.com"
  exit 1
fi

echo ""
echo "▶  1/6  Instalando dependencias..."
npm install --omit=dev

echo ""
echo "▶  2/6  Compilando la app..."
npm run build

echo ""
echo "▶  3/6  Copiando assets estáticos al bundle standalone..."
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public || true

echo ""
echo "▶  4/6  Creando directorio de datos..."
DB_PATH=$(echo "$DATABASE_URL" | sed 's|file:||')
DB_DIR=$(dirname "$DB_PATH")
mkdir -p "$DB_DIR"
echo "    DB → $DB_PATH"

echo ""
echo "▶  5/6  Ejecutando migraciones..."
npx tsx src/lib/migrate.ts

echo ""
echo "▶  6/6  Creando directorio de logs e iniciando con PM2..."
mkdir -p logs
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "══════════════════════════════════════════"
echo "  ✅  Deploy completado"
echo "  🌐  App corriendo en $NEXTAUTH_URL"
echo "  🔑  Login: admin / admin123  ← cámbialo ya"
echo "  📋  Logs: pm2 logs minotion"
echo "══════════════════════════════════════════"
echo ""
