# REST API Plan

This document outlines the REST API for the 10xdevsFishcards application, designed based on the provided database schema, product requirements (PRD), and technology stack.

## 1. Resources

The API is designed around the following core resources:

-   **Decks**: Represents a collection of flashcards. Corresponds to the `decks` table.
-   **Flashcards**: Represents a single flashcard within a deck. Corresponds to the `flashcards` table.
-   **AI**: A functional resource for interacting with the AI flashcard generator. It does not map directly to a single table but orchestrates the creation of flashcards.
-   **Reviews**: A functional resource for handling user reviews of flashcards during a study session. It updates the `flashcard_srs_data` table.

## 2. Endpoints

All endpoints are protected and require user authentication.

### 2.1. Decks

#### List Decks

-   **Method**: `GET`
-   **Path**: `/api/decks`
-   **Description**: Retrieves a list of all decks belonging to the authenticated user.
-   **Query Parameters**:
    -   `page` (optional, number, default: 1): The page number for pagination.
    -   `limit` (optional, number, default: 10): The number of items per page.
    -   `sortBy` (optional, string, default: 'created_at'): Field to sort by (e.g., `name`, `created_at`, `last_reviewed_at`).
    -   `order` (optional, string, default: 'desc'): Sort order (`asc` or `desc`).
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**:
        ```json
        {
          "data": [
            {
              "id": "uuid-string",
              "name": "Deck Name",
              "created_at": "iso-8601-timestamp",
              "last_reviewed_at": "iso-8601-timestamp"
            }
          ],
          "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalItems": 50
          }
        }
        ```
-   **Error Response**:
    -   **Code**: `401 Unauthorized`
    -   **Message**: `{"error": "Authentication required"}`

#### Get Deck Details

-   **Method**: `GET`
-   **Path**: `/api/decks/{deckId}`
-   **Description**: Retrieves details for a specific deck, including its flashcards.
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**:
        ```json
        {
          "id": "uuid-string",
          "name": "Deck Name",
          "created_at": "iso-8601-timestamp",
          "last_reviewed_at": "iso-8601-timestamp",
          "flashcards": [
            {
              "id": "uuid-string",
              "front": "Front of the card",
              "back": "Back of the card",
              "created_at": "iso-8601-timestamp"
            }
          ]
        }
        ```
-   **Error Responses**:
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`
    -   **Message**: `{"error": "Deck not found"}`

#### Create Deck

-   **Method**: `POST`
-   **Path**: `/api/decks`
-   **Description**: Creates a new deck with an initial set of flashcards (for manual creation).
-   **Request Payload**:
    ```json
    {
      "name": "New Deck Name",
      "flashcards": [
        {
          "front": "Question 1",
          "back": "Answer 1"
        },
        {
          "front": "Question 2",
          "back": "Answer 2"
        }
      ]
    }
    ```
-   **Success Response**:
    -   **Code**: `201 Created`
    -   **Payload**:
        ```json
        {
          "id": "new-deck-uuid",
          "name": "New Deck Name",
          "created_at": "iso-8601-timestamp"
        }
        ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request` (Validation error)
    -   **Message**: `{"error": "Validation failed", "details": [...]}`
    -   **Code**: `401 Unauthorized`

#### Update Deck

-   **Method**: `PATCH`
-   **Path**: `/api/decks/{deckId}`
-   **Description**: Updates the name of an existing deck.
-   **Request Payload**:
    ```json
    {
      "name": "Updated Deck Name"
    }
    ```
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**:
        ```json
        {
          "id": "uuid-string",
          "name": "Updated Deck Name",
          "updated_at": "iso-8601-timestamp"
        }
        ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request` (Validation error)
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`

#### Delete Deck

-   **Method**: `DELETE`
-   **Path**: `/api/decks/{deckId}`
-   **Description**: Deletes a deck and all its associated flashcards.
-   **Success Response**:
    -   **Code**: `204 No Content`
-   **Error Responses**:
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`

### 2.2. Flashcards

Flashcards are managed through the `Decks` resource. Direct manipulation is limited to simplify the API.

#### Add Flashcard to Deck

-   **Method**: `POST`
-   **Path**: `/api/decks/{deckId}/flashcards`
-   **Description**: Adds a new flashcard to an existing deck.
-   **Request Payload**:
    ```json
    {
      "front": "New Question",
      "back": "New Answer"
    }
    ```
-   **Success Response**:
    -   **Code**: `201 Created`
    -   **Payload**:
        ```json
        {
          "id": "new-flashcard-uuid",
          "deck_id": "uuid-string",
          "front": "New Question",
          "back": "New Answer",
          "created_at": "iso-8601-timestamp"
        }
        ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request`
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found` (Deck not found)

#### Update Flashcard

-   **Method**: `PATCH`
-   **Path**: `/api/flashcards/{flashcardId}`
-   **Description**: Updates the content of a single flashcard.
-   **Request Payload**:
    ```json
    {
      "front": "Updated Question",
      "back": "Updated Answer"
    }
    ```
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**:
        ```json
        {
          "id": "flashcard-uuid",
          "front": "Updated Question",
          "back": "Updated Answer",
          "changed_at": "iso-8601-timestamp"
        }
        ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request`
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`

#### Delete Flashcard

-   **Method**: `DELETE`
-   **Path**: `/api/flashcards/{flashcardId}`
-   **Description**: Deletes a single flashcard.
-   **Success Response**:
    -   **Code**: `204 No Content`
-   **Error Responses**:
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`

### 2.3. AI Generation

#### Generate Flashcard Proposals

-   **Method**: `POST`
-   **Path**: `/api/ai/generate`
-   **Description**: Takes a block of text and returns AI-generated flashcard proposals.
-   **Request Payload**:
    ```json
    {
      "text": "A long block of text between 2,000 and 10,000 characters..."
    }
    ```
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**:
        ```json
        {
          "proposals": [
            {
              "id": "temp-client-id-1",
              "front": "AI Generated Question 1",
              "back": "AI Generated Answer 1"
            },
            {
              "id": "temp-client-id-2",
              "front": "AI Generated Question 2",
              "back": "AI Generated Answer 2"
            }
          ]
        }
        ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request` (e.g., text length validation)
    -   **Message**: `{"error": "Text must be between 2000 and 10000 characters."}`
    -   **Code**: `401 Unauthorized`
    -   **Code**: `503 Service Unavailable` (AI service error)
    -   **Message**: `{"error": "AI service is currently unavailable. Please try again later."}`

#### Save AI-Generated Flashcards

-   **Method**: `POST`
-   **Path**: `/api/ai/save`
-   **Description**: Creates a new deck from a list of user-accepted (and possibly edited) flashcard proposals.
-   **Request Payload**:
    ```json
    {
      "flashcards": [
        {
          "front": "Accepted or Edited Question 1",
          "back": "Accepted or Edited Answer 1"
        },
        {
          "front": "Accepted or Edited Question 2",
          "back": "Accepted or Edited Answer 2"
        }
      ],
      "metrics": {
         "proposed_flashcards_count": 15,
         "accepted_flashcards_count": 12,
         "edited_flashcards_count": 3
      }
    }
    ```
-   **Success Response**:
    -   **Code**: `201 Created`
    -   **Payload**:
        ```json
        {
          "id": "new-deck-uuid",
          "name": "2025-10-13_15-30",
          "created_at": "iso-8601-timestamp"
        }
        ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request` (Validation error)
    -   **Code**: `401 Unauthorized`

### 2.4. Study Session (Reviews)

#### Get Flashcards for Review

-   **Method**: `GET`
-   **Path**: `/api/decks/{deckId}/review`
-   **Description**: Fetches all flashcards from a deck that are due for review (`due_date <= CURRENT_DATE`).
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**:
        ```json
        {
          "flashcards": [
            {
              "id": "uuid-string-1",
              "front": "Card front",
              "back": "Card back"
            },
            {
              "id": "uuid-string-2",
              "front": "Another card front",
              "back": "Another card back"
            }
          ]
        }
        ```
-   **Error Responses**:
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`

#### Submit a Review

-   **Method**: `POST`
-   **Path**: `/api/reviews`
-   **Description**: Submits a user's quality assessment for a flashcard, triggering the SRS algorithm update.
-   **Request Payload**:
    ```json
    {
      "flashcard_id": "uuid-string",
      "quality": "good"
    }
    ```
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**:
        ```json
        {
          "flashcard_id": "uuid-string",
          "next_due_date": "yyyy-mm-dd",
          "new_interval": 6
        }
        ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request` (Invalid quality value)
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found` (Flashcard not found)

## 3. Authentication and Authorization

-   **Authentication**: The API will use JSON Web Tokens (JWT) provided by Supabase Auth. The client is responsible for acquiring the token upon login/signup and sending it in the `Authorization` header of each request (e.g., `Authorization: Bearer <SUPABASE_JWT>`).
-   **Authorization**: All data access is governed by PostgreSQL's Row-Level Security (RLS) policies, as defined in the database schema. The API endpoints run under the authenticated user's role, ensuring that users can only access or modify their own data (`decks`, `flashcards`, etc.). This is automatically enforced by Supabase's PostgREST layer.

## 4. Validation and Business Logic

-   **Input Validation**: All incoming request payloads and parameters will be validated using `zod`. This aligns with the Astro backend environment best practices. Validation rules are derived from the database schema and PRD.
    -   `decks.name`: Required, string.
    -   `flashcards.front`: Required, string, max 200 characters.
    -   `flashcards.back`: Required, string, max 500 characters.
    -   `ai.generate.text`: Required, string, 2000-10000 characters.
    -   `reviews.quality`: Required, string, must be one of `again`, `good`, `easy`.
-   **Business Logic**:
    -   **AI Flashcard Saving**: The `/api/ai/save` endpoint will create a new `deck` with an auto-generated name (`YYYY-MM-DD_HH-MM`) and then insert all provided `flashcards` with `creation_source` set to `'ai_generated'` or `'ai_generated_edited'`. It will also create an entry in `ai_generation_metrics`. These operations should be performed within a single database transaction.
    -   **SRS Algorithm**: The `/api/reviews` endpoint will call the `update_srs_data_on_review` PostgreSQL function, which encapsulates the entire SM-2 algorithm logic. This keeps the business logic within the database layer for consistency and performance.
    -   **Automatic SRS Data Creation**: The `on_flashcard_insert` trigger automatically creates a corresponding `flashcard_srs_data` record for every new flashcard, ensuring data integrity. The API does not need to handle this explicitly.
    -   **Cascade Deletes**: Deleting a `deck` automatically deletes all its `flashcards` and their `flashcard_srs_data` thanks to `ON DELETE CASCADE` constraints, simplifying the `DELETE /api/decks/{deckId}` endpoint.

