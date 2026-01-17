#!/bin/bash

# Security Test Script for HackathonProxy
# Run this to verify security measures are working

BASE_URL="${1:-http://localhost:3000}"

echo "=================================="
echo "Security Test Suite"
echo "Base URL: $BASE_URL"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✓ PASS${NC}: $1"; }
fail() { echo -e "${RED}✗ FAIL${NC}: $1"; }

# Test 1: Rate limiting on login
echo "Test 1: Rate limiting on login..."
for i in {1..7}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"test-key"}')
  if [ "$STATUS" = "429" ]; then
    pass "Rate limit triggered after $i requests"
    break
  fi
done

# Test 2: Tunnel endpoint requires auth
echo ""
echo "Test 2: Tunnel endpoint requires auth..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tunnel")
if [ "$STATUS" = "401" ]; then
  pass "Tunnel GET requires auth (401)"
else
  fail "Tunnel GET returned $STATUS (expected 401)"
fi

# Test 3: Presence endpoint requires auth
echo ""
echo "Test 3: Presence endpoint requires auth..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/presence")
if [ "$STATUS" = "401" ]; then
  pass "Presence GET requires auth (401)"
else
  fail "Presence GET returned $STATUS (expected 401)"
fi

# Test 4: Security headers
echo ""
echo "Test 4: Security headers..."
HEADERS=$(curl -s -I "$BASE_URL" 2>&1)

if echo "$HEADERS" | grep -qi "X-Frame-Options: DENY"; then
  pass "X-Frame-Options header present"
else
  fail "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -qi "X-Content-Type-Options: nosniff"; then
  pass "X-Content-Type-Options header present"
else
  fail "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "Content-Security-Policy"; then
  pass "Content-Security-Policy header present"
else
  fail "Content-Security-Policy header missing"
fi

# Test 5: Invalid input validation
echo ""
echo "Test 5: Input validation..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"<script>alert(1)</script>"}')
if [ "$STATUS" = "400" ]; then
  pass "XSS in API key rejected (400)"
else
  fail "XSS input returned $STATUS (expected 400)"
fi

echo ""
echo "=================================="
echo "Security tests complete"
echo "=================================="
