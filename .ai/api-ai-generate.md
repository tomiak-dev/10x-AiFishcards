# API Documentation: POST /api/ai/generate

## Overview
Generates flashcard proposals from provided text using AI. The endpoint accepts a large block of text (2000-10000 characters) and returns a list of temporary flashcard proposals.

## Endpoint
```
POST /api/ai/generate
```

## Authentication
Requires JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Development Mode**: If no token is provided, the endpoint will use a default test user UUID for development purposes.

## Request

### Headers
- `Content-Type: application/json`
- `Authorization: Bearer <JWT>` (optional in dev mode)

### Body
```json
{
  "text": "string (2000-10000 characters)"
}
```

### Validation Rules
- `text` field is required
- `text` must be between 2000 and 10000 characters
- Request body must be valid JSON

## Response

### Success Response (200 OK)
```json
{
  "proposals": [
    {
      "id": "V1StGXR8_Z5jdHi6B",
      "front": "What is the main topic discussed in the text?",
      "back": "The text discusses various aspects of the subject matter provided."
    },
    {
      "id": "Cz5jdHi6B_V1StGXR8",
      "front": "Key concept from the text",
      "back": "Important information extracted from the provided content."
    }
  ]
}
```

**Response Fields:**
- `proposals`: Array of flashcard proposals
  - `id`: Temporary client-side ID (generated with nanoid)
  - `front`: Question/prompt for the flashcard
  - `back`: Answer/explanation for the flashcard

### Error Responses

#### 400 Bad Request
Invalid input data or validation errors.

**Example 1: Text too short**
```json
{
  "error": "Text must be at least 2000 characters long."
}
```

**Example 2: Text too long**
```json
{
  "error": "Text must be at most 10000 characters long."
}
```

**Example 3: Invalid JSON**
```json
{
  "error": "Invalid JSON in request body."
}
```

#### 401 Unauthorized
Missing or invalid JWT token (only in production mode).

```json
{
  "error": "Unauthorized"
}
```

#### 503 Service Unavailable
AI service is currently unavailable.

```json
{
  "error": "AI service is currently unavailable. Please try again later."
}
```

#### 500 Internal Server Error
Unexpected server error.

```json
{
  "error": "Internal server error."
}
```

## Usage Examples

### Example 1: Basic Usage (with Authentication)

**Request:**
```bash
curl -X POST http://localhost:4321/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit... (2000+ characters)"
  }'
```

**Response:**
```json
{
  "proposals": [
    {
      "id": "V1StGXR8_Z5jdHi6B",
      "front": "What is Lorem Ipsum?",
      "back": "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    }
  ]
}
```

### Example 2: Development Mode (without Authentication)

**Request:**
```bash
curl -X POST http://localhost:4321/api/ai/generate \
  -H "Content-Type: application/json" \
  -d @request.json
```

**request.json:**
```json
{
  "text": "Your long text content here (minimum 2000 characters)..."
}
```

### Example 3: JavaScript/TypeScript Fetch

```typescript
const response = await fetch('http://localhost:4321/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    text: longTextContent // 2000-10000 characters
  })
});

if (!response.ok) {
  const error = await response.json();
  console.error('Error:', error.error);
  throw new Error(error.error);
}

const data = await response.json();
console.log('Generated proposals:', data.proposals);
```

### Example 4: React Component Usage

```tsx
import { useState } from 'react';
import type { FlashcardProposalDTO } from '@/types';

function FlashcardGenerator() {
  const [text, setText] = useState('');
  const [proposals, setProposals] = useState<FlashcardProposalDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setProposals(data.proposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        minLength={2000}
        maxLength={10000}
      />
      <button onClick={generateFlashcards} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Flashcards'}
      </button>
      {error && <p className="error">{error}</p>}
      {proposals.map(proposal => (
        <div key={proposal.id}>
          <p><strong>Q:</strong> {proposal.front}</p>
          <p><strong>A:</strong> {proposal.back}</p>
        </div>
      ))}
    </div>
  );
}
```

## Testing

Run the provided test script to validate all endpoint scenarios:

```bash
./.ai/test-ai-generate.sh
```

This script tests:
- ✅ Valid requests with correct text length
- ✅ Text too short (< 2000 characters)
- ✅ Text too long (> 10000 characters)
- ✅ Missing text field
- ✅ Invalid JSON
- ✅ Requests without authentication (dev mode)

## Implementation Notes

1. **Temporary IDs**: The `id` field in proposals is a temporary client-side identifier generated with nanoid. These IDs should not be persisted in the database.

2. **AI Service**: Currently uses a mock implementation. The actual AI integration will be implemented later.

3. **Development Mode**: The endpoint uses `DEFAULT_USER_UUID` when no JWT token is provided, allowing for easier development and testing.

4. **Rate Limiting**: Not yet implemented. Consider adding rate limiting in production to prevent abuse.

5. **Character Limits**: The 2000-10000 character limit prevents:
   - Too short texts that won't generate meaningful flashcards
   - Excessive API costs and processing time
   - Potential timeout issues

## Related Endpoints

- `POST /api/ai/save` - Save AI-generated flashcards to a deck (to be implemented)
- `POST /api/decks` - Create a deck manually with flashcards

## Changelog

- **2025-10-14**: Initial implementation with mock AI service

