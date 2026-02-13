#!/usr/bin/env bash
set -euo pipefail
API_URL=${API_URL:-http://localhost:4000}
TOKEN=$(curl -s -X POST "$API_URL/auth/login" -H 'Content-Type: application/json' -d '{"email":"founder@ocs.local","password":"founder123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).access_token||''));")
[ -n "$TOKEN" ]
curl -s "$API_URL/dashboard/portfolio" -H "Authorization: Bearer $TOKEN" >/dev/null
echo "smoke ok"
