#!/bin/bash

# Test script for GET /api/decks/{deckId} endpoint
# This script tests various scenarios for the deck details endpoint

BASE_URL="http://localhost:3000"
COLORS=true

# Color codes
if [ "$COLORS" = true ]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color
else
  GREEN=''
  RED=''
  YELLOW=''
  BLUE=''
  NC=''
fi

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing GET /api/decks/{deckId}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Helper function to run a test
run_test() {
  local test_name="$1"
  local url="$2"
  local expected_status="$3"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  echo -e "${YELLOW}Test $TOTAL_TESTS: $test_name${NC}"
  echo -e "URL: $url"

  # Make request and capture response and status
  response=$(curl -s -w "\n%{http_code}" "$url")
  status=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')

  echo -e "Expected status: $expected_status"
  echo -e "Actual status: $status"

  # Check if status matches expected
  if [ "$status" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  # Pretty print JSON response
  echo -e "\nResponse body:"
  echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
  echo -e "\n---\n"
}

# Test 1: Get list of decks to find a valid deckId
echo -e "${BLUE}Fetching decks to get a valid deckId...${NC}"
decks_response=$(curl -s "$BASE_URL/api/decks?limit=1")
valid_deck_id=$(echo "$decks_response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'] if data['data'] else '')" 2>/dev/null)

if [ -z "$valid_deck_id" ]; then
  echo -e "${RED}Error: No decks found in database. Please create a deck first.${NC}"
  echo -e "${YELLOW}You can create a deck using: POST /api/decks${NC}\n"
  valid_deck_id="bade8fe8-f825-4541-a36d-f1235dbc5590"
  echo -e "${YELLOW}Using fallback UUID: $valid_deck_id${NC}\n"
else
  echo -e "${GREEN}Found valid deck ID: $valid_deck_id${NC}\n"
fi

# Test 2: Get existing deck (200 OK)
run_test \
  "Get existing deck details" \
  "$BASE_URL/api/decks/$valid_deck_id" \
  200

# Test 3: Get non-existent deck with valid UUID format (404 Not Found)
run_test \
  "Get non-existent deck" \
  "$BASE_URL/api/decks/00000000-0000-0000-0000-000000000000" \
  404

# Test 4: Get deck with invalid UUID format (400 Bad Request)
run_test \
  "Get deck with invalid UUID" \
  "$BASE_URL/api/decks/invalid-uuid-123" \
  400

# Test 5: Get deck with empty ID (400 Bad Request)
run_test \
  "Get deck with short invalid ID" \
  "$BASE_URL/api/decks/123" \
  400

# Test 6: Get deck with malformed UUID (400 Bad Request)
run_test \
  "Get deck with malformed UUID" \
  "$BASE_URL/api/decks/not-a-uuid-at-all" \
  400

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED_TESTS${NC}"
else
  echo -e "Failed: $FAILED_TESTS"
fi
echo -e "${BLUE}========================================${NC}\n"

# Exit with error code if any test failed
if [ $FAILED_TESTS -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}All tests passed! ✓${NC}\n"
  exit 0
fi
