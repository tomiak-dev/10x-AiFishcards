#!/bin/bash

# Test script for GET /api/decks endpoint
# Tests various pagination, sorting, and error scenarios

API_URL="http://localhost:3000/api/decks"
BEARER_TOKEN="test-token"  # Adjust if using real authentication

echo "=================================="
echo "Testing GET /api/decks endpoint"
echo "=================================="
echo ""

# Test 1: Default parameters (no query params)
echo "Test 1: Default parameters"
echo "Request: GET $API_URL"
curl -s -X GET "$API_URL" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 2: Custom pagination (page 2, limit 5)
echo "Test 2: Custom pagination (page=2, limit=5)"
echo "Request: GET $API_URL?page=2&limit=5"
curl -s -X GET "$API_URL?page=2&limit=5" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 3: Sort by name ascending
echo "Test 3: Sort by name ascending"
echo "Request: GET $API_URL?sortBy=name&order=asc"
curl -s -X GET "$API_URL?sortBy=name&order=asc" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 4: Sort by last_reviewed_at descending
echo "Test 4: Sort by last_reviewed_at descending"
echo "Request: GET $API_URL?sortBy=last_reviewed_at&order=desc"
curl -s -X GET "$API_URL?sortBy=last_reviewed_at&order=desc" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 5: Large limit (max 100)
echo "Test 5: Maximum limit (100)"
echo "Request: GET $API_URL?limit=100"
curl -s -X GET "$API_URL?limit=100" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 6: Invalid page (should return 400)
echo "Test 6: Invalid page (page=0) - Expected: 400 error"
echo "Request: GET $API_URL?page=0"
curl -s -X GET "$API_URL?page=0" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 7: Invalid limit (should return 400)
echo "Test 7: Invalid limit (limit=150) - Expected: 400 error"
echo "Request: GET $API_URL?limit=150"
curl -s -X GET "$API_URL?limit=150" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 8: Invalid sortBy (should return 400)
echo "Test 8: Invalid sortBy - Expected: 400 error"
echo "Request: GET $API_URL?sortBy=invalid_field"
curl -s -X GET "$API_URL?sortBy=invalid_field" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 9: Invalid order (should return 400)
echo "Test 9: Invalid order - Expected: 400 error"
echo "Request: GET $API_URL?order=invalid"
curl -s -X GET "$API_URL?order=invalid" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

# Test 10: Complex query with all parameters
echo "Test 10: All parameters combined"
echo "Request: GET $API_URL?page=1&limit=20&sortBy=created_at&order=desc"
curl -s -X GET "$API_URL?page=1&limit=20&sortBy=created_at&order=desc" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  | jq .
echo ""
echo "---"
echo ""

echo "=================================="
echo "All tests completed!"
echo "=================================="

