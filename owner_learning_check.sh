#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-https://api.alexiq.site}"

hr(){ printf '\n%s\n' '----------------------------------------'; }

echo "🧪 OWNER + LEARNING CHECK — $BASE_URL"

hr
echo "1) /api/health (learning_telemetry)"
curl -s "$BASE_URL/api/health" | jq '.learning_telemetry // .learning_system // .'

hr
echo "2) Owner check — ZNT (expected: recognized=true)"
curl -s "$BASE_URL/admin/owner/check?who=ZNT" | jq

hr
echo "3) Owner check — Zakaria Housni (expected: recognized=true)"
curl -s "$BASE_URL/admin/owner/check?who=Zakaria%20Housni" | jq

hr
echo "4) Owner check — John Doe (expected: recognized=false)"
curl -s "$BASE_URL/admin/owner/check?who=John%20Doe" | jq

hr
echo "✅ Tests envoyés."