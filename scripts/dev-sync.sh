#!/usr/bin/env bash
# Local dev only: copy PHP admin/api sources into out/ (served by 'pnpm admin' on :8080) and restore dev configs.
# Safe to re-run; also use it after 'pnpm build' wipes out/.
set -e
cd "$(dirname "$0")/.."
mkdir -p out/admin out/api out/data
cp -r public/admin/. out/admin/
cp -r public/api/. out/api/
cp -r public/data/. out/data/ 2>/dev/null || true
cp "C:/Users/mohit/AppData/Local/Temp/claude/D--Client-DataBase-alok-alok-plastics-website/02e23b57-774c-499a-a628-879d5d620847/scratchpad/devcfg/admin-config.php" out/admin/config.php
cp "C:/Users/mohit/AppData/Local/Temp/claude/D--Client-DataBase-alok-alok-plastics-website/02e23b57-774c-499a-a628-879d5d620847/scratchpad/devcfg/api-config.php" out/api/config.php
node scripts/generate-catalogue.mjs
echo "dev-sync done"
