#!/bin/bash

# Test script for POST /api/ai/generate endpoint
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}Testing POST /api/ai/generate endpoint${NC}\n"

# Test 1: Valid request with correct text length
echo -e "${YELLOW}Test 1: Valid request (2000+ characters)${NC}"
VALID_TEXT=$(printf 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. %.0s' {1..100})
REQUEST_BODY="{\"text\":\"$VALID_TEXT\"}"
echo -e "${BLUE}Request:${NC}"
echo "$REQUEST_BODY" | jq '.' 2>/dev/null || echo "$REQUEST_BODY"
echo -e "${CYAN}Response:${NC}"
RESPONSE=$(curl -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$REQUEST_BODY" \
  -w "\n%{http_code}" \
  -s)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo -e "${CYAN}Status: $HTTP_CODE${NC}\n"

# Test 2: Text too short (< 2000 characters)
echo -e "${YELLOW}Test 2: Text too short (400 expected)${NC}"
REQUEST_BODY='{"text":"Short text"}'
echo -e "${BLUE}Request:${NC}"
echo "$REQUEST_BODY" | jq '.'
echo -e "${CYAN}Response:${NC}"
RESPONSE=$(curl -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$REQUEST_BODY" \
  -w "\n%{http_code}" \
  -s)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo -e "${CYAN}Status: $HTTP_CODE${NC}\n"

# Test 3: Text too long (> 10000 characters)
echo -e "${YELLOW}Test 3: Text too long (400 expected)${NC}"
LONG_TEXT=$(printf 'A%.0s' {1..10001})
REQUEST_BODY="{\"text\":\"$LONG_TEXT\"}"
echo -e "${BLUE}Request:${NC}"
echo "{\"text\":\"[10001 characters - too long]\"}"
echo -e "${CYAN}Response:${NC}"
RESPONSE=$(curl -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$REQUEST_BODY" \
  -w "\n%{http_code}" \
  -s)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo -e "${CYAN}Status: $HTTP_CODE${NC}\n"

# Test 4: Missing text field
echo -e "${YELLOW}Test 4: Missing text field (400 expected)${NC}"
REQUEST_BODY='{}'
echo -e "${BLUE}Request:${NC}"
echo "$REQUEST_BODY" | jq '.'
echo -e "${CYAN}Response:${NC}"
RESPONSE=$(curl -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$REQUEST_BODY" \
  -w "\n%{http_code}" \
  -s)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo -e "${CYAN}Status: $HTTP_CODE${NC}\n"

# Test 5: Invalid JSON
echo -e "${YELLOW}Test 5: Invalid JSON (400 expected)${NC}"
REQUEST_BODY='invalid json'
echo -e "${BLUE}Request:${NC}"
echo "$REQUEST_BODY"
echo -e "${CYAN}Response:${NC}"
RESPONSE=$(curl -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$REQUEST_BODY" \
  -w "\n%{http_code}" \
  -s)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo -e "${CYAN}Status: $HTTP_CODE${NC}\n"

# Test 6: No Authorization header (should use default user in dev)
echo -e "${YELLOW}Test 6: No Authorization header (should work in dev mode)${NC}"
VALID_TEXT=$(printf 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. %.0s' {1..100})
REQUEST_BODY="{\"text\":\"$VALID_TEXT\"}"
echo -e "${BLUE}Request:${NC}"
echo "$REQUEST_BODY" | jq '.' 2>/dev/null || echo "$REQUEST_BODY"
echo -e "${CYAN}Response:${NC}"
RESPONSE=$(curl -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY" \
  -w "\n%{http_code}" \
  -s)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo -e "${CYAN}Status: $HTTP_CODE${NC}\n"

echo -e "${GREEN}Tests completed!${NC}"
