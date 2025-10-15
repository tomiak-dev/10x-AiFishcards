#!/bin/bash

# Test script for POST /api/decks endpoint

API_URL="http://localhost:3000/api/decks"

echo "Testing POST /api/decks endpoint..."
echo ""

# Test 1: Valid request
echo "Test 1: Creating a deck with valid data"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Deck",
    "flashcards": [
      {
        "front": "What is TypeScript?",
        "back": "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript."
      },
      {
        "front": "What is Astro?",
        "back": "Astro is a modern static site builder that allows you to use any framework."
      }
    ]
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 2: Missing name
echo "Test 2: Missing deck name (should fail validation)"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "Question",
        "back": "Answer"
      }
    ]
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 3: Empty flashcards array
echo "Test 3: Empty flashcards array (should fail validation)"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empty Deck",
    "flashcards": []
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 4: Flashcard front text too long
echo "Test 4: Flashcard front text exceeds 200 characters (should fail validation)"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Deck\",
    \"flashcards\": [
      {
        \"front\": \"$(python3 -c 'print("a" * 201)')\",
        \"back\": \"Answer\"
      }
    ]
  }" | jq '.'

echo ""
echo "Done!"

