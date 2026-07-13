#!/bin/bash
# Compare raw pre-JS (SSR) HTML between two pages
# Usage: bash compare-ssr.sh

VERCEL_URL="https://home-organic-pr-45-production.vercel.stage.nerdwallet.biz/mortgages/best/mortgage-lenders"
PROD_URL="https://www.nerdwallet.com/mortgages/best/mortgage-lenders"

echo "Fetching pages..."
curl -s -A "Mozilla/5.0 (compatible; SSR-diff/1.0)" "$VERCEL_URL" > /tmp/vercel_raw.html
curl -s -A "Mozilla/5.0 (compatible; SSR-diff/1.0)" "$PROD_URL"   > /tmp/prod_raw.html

echo "Vercel: $(wc -c < /tmp/vercel_raw.html) bytes"
echo "Prod:   $(wc -c < /tmp/prod_raw.html) bytes"

normalize() {
  sed \
    -e 's|nonce="[^"]*"|nonce="NONCE"|g' \
    -e 's|integrity="[^"]*"|integrity="HASH"|g' \
    -e 's|"buildId":"[^"]*"|"buildId":"BUILD_ID"|g' \
    -e 's|/_next/static/[^"]*|/_next/static/HASH|g' \
    -e 's|home-organic-pr-45-production\.vercel\.stage\.nerdwallet\.biz|www.nerdwallet.com|g' \
    -e 's|stage\.nerdwallet\.biz|www.nerdwallet.com|g' \
    "$1"
}

normalize /tmp/vercel_raw.html > /tmp/vercel_norm.html
normalize /tmp/prod_raw.html   > /tmp/prod_norm.html

echo ""
echo "=== DIFF (normalized) ==="
diff /tmp/vercel_norm.html /tmp/prod_norm.html

if [ $? -eq 0 ]; then
  echo "✅ No differences found in raw SSR HTML."
else
  echo ""
  echo "=== SUMMARY ==="
  diff /tmp/vercel_norm.html /tmp/prod_norm.html | grep -c '^<' | xargs -I{} echo "Lines only in Vercel: {}"
  diff /tmp/vercel_norm.html /tmp/prod_norm.html | grep -c '^>' | xargs -I{} echo "Lines only in Prod:   {}"
fi