#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "🧪 OWNER IDENTITY TEST - BASE_URL=$BASE_URL"

hr() { printf '\n%s\n' "-----------------------------------"; }

# 1) Health check - data directory
hr
echo "1) Health check - Data directory"
HEALTH_JSON=$(curl -s "$BASE_URL/health" || echo '{"error":"failed"}')
DATA_DIR=$(echo "$HEALTH_JSON" | jq -r '.learning_system.data_dir // "unknown"')
BUFFER_FILE=$(echo "$HEALTH_JSON" | jq -r '.learning_system.buffer_file // "unknown"')
echo "✅ Data directory: $DATA_DIR"
echo "✅ Buffer file: $BUFFER_FILE"

# 2) Owner recognition - ZNT
hr  
echo "2) Owner recognition test - ZNT"
ZNT_TEST=$(curl -s "$BASE_URL/admin/owner/check?who=ZNT" || echo '{"error":"failed"}')
echo "Request: ZNT"
echo "$ZNT_TEST" | jq
ZNT_OK=$(echo "$ZNT_TEST" | jq -r '.recognized // false')
echo "Result: $ZNT_OK"

# 3) Owner recognition - Zakaria Housni  
hr
echo "3) Owner recognition test - Zakaria Housni"
ZAKARIA_TEST=$(curl -s "$BASE_URL/admin/owner/check?who=Zakaria%20Housni" || echo '{"error":"failed"}')
echo "Request: Zakaria Housni"
echo "$ZAKARIA_TEST" | jq  
ZAKARIA_OK=$(echo "$ZAKARIA_TEST" | jq -r '.recognized // false')
echo "Result: $ZAKARIA_OK"

# 4) Owner recognition - Unknown person (should be false)
hr
echo "4) Owner recognition test - Unknown person"
UNKNOWN_TEST=$(curl -s "$BASE_URL/admin/owner/check?who=Random%20Person" || echo '{"error":"failed"}')
echo "Request: Random Person"
echo "$UNKNOWN_TEST" | jq
UNKNOWN_OK=$(echo "$UNKNOWN_TEST" | jq -r '.recognized // true')
echo "Result: $UNKNOWN_OK (should be false)"

# 5) Summary
hr
echo "🎯 SUMMARY - OwnerIdentity Foundation Test"
echo "• ZNT recognized: $ZNT_OK"
echo "• Zakaria Housni recognized: $ZAKARIA_OK"  
echo "• Unknown person rejected: $([ "$UNKNOWN_OK" = "false" ] && echo "true" || echo "false")"
echo "• Database path exists: $([ "$DATA_DIR" != "unknown" ] && echo "true" || echo "false")"

if [ "$ZNT_OK" = "true" ] && [ "$ZAKARIA_OK" = "true" ] && [ "$UNKNOWN_OK" = "false" ]; then
  echo "✅ FOUNDATION TEST PASSED - Ready for full migration"
  exit 0
else
  echo "❌ FOUNDATION TEST FAILED - Check logs and fix before migration"
  exit 1
fi