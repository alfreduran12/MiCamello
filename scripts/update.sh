#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  scripts/update.sh — ACTUALIZAR app en el VPS
#  Uso: bash scripts/update.sh
# ─────────────────────────────────────────────────────────────
set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo ""
echo "══════════════════════════════════════════"
echo "  Mi Notion — Actualización"
echo "══════════════════════════════════════════"

echo ""
echo "▶  1/5  Descargando cambios..."
git pull

echo ""
echo "▶  2/5  Instalando dependencias..."
npm install --omit=dev

echo ""
echo "▶  3/5  Compilando..."
npm run build

echo ""
echo "▶  4/5  Copiando assets estáticos..."
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public || true

echo ""
echo "▶  5/5  Ejecutando migraciones y reiniciando..."
npx tsx src/lib/migrate.ts
pm2 restart minotion

echo ""
echo "══════════════════════════════════════════"
echo "  ✅  Actualización completada"
echo "  📋  Logs: pm2 logs minotion"
echo "══════════════════════════════════════════"
echo ""
