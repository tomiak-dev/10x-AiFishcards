#!/bin/bash

# Test script for POST /api/ai/save endpoint
# This script tests saving AI-generated flashcards with metrics

set -e

echo "🧪 Testing POST /api/ai/save endpoint..."
echo "=========================================="
echo ""

# Base URL
BASE_URL="http://localhost:3000"

# Test data - AI-generated flashcards with metrics
TEST_DATA='{
  "flashcards": [
    {
      "front": "What is TypeScript?",
      "back": "TypeScript is a strongly typed programming language that builds on JavaScript."
    },
    {
      "front": "What is Astro?",
      "back": "Astro is a modern web framework for building fast, content-focused websites."
    },
    {
      "front": "What is Supabase?",
      "back": "Supabase is an open source Firebase alternative with PostgreSQL database."
    }
  ],
  "metrics": {
    "proposed_flashcards_count": 5,
    "accepted_flashcards_count": 3,
    "edited_flashcards_count": 1
  }
}'

echo "📤 Sending request to $BASE_URL/api/ai/save"
echo "Request body:"
echo "$TEST_DATA" | jq '.'
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  "$BASE_URL/api/ai/save")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

# Extract response body (all lines except last)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📥 Response:"
echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Success! Deck created."
  echo "Response body:"
  echo "$BODY" | jq '.'

  # Extract deck ID for verification
  DECK_ID=$(echo "$BODY" | jq -r '.id')
  DECK_NAME=$(echo "$BODY" | jq -r '.name')

  echo ""
  echo "📊 Verification:"
  echo "  Deck ID: $DECK_ID"
  echo "  Deck Name: $DECK_NAME"
  echo "  Created At: $(echo "$BODY" | jq -r '.created_at')"

  echo ""
  echo "🎉 Test PASSED - Deck successfully created!"
  exit 0
else
  echo "❌ Test FAILED!"
  echo "Expected HTTP 201, got $HTTP_CODE"
  echo "Response body:"
  echo "$BODY" | jq '.' || echo "$BODY"
  exit 1
fi

