# API Endpoint Implementation Plan: List Decks

## Endpoint Overview

This document outlines the implementation plan for the `GET /api/decks` endpoint. Its purpose is to retrieve a paginated and sorted list of all decks belonging to the currently authenticated user, ensuring data is accessed securely and efficiently.

## Request Details

-   **Method HTTP**: `GET`
-   **URL Structure**: `/api/decks`
-   **Parameters**:
    -   **Required**: None
    -   **Optional (Query)**:
        -   `page` (number, default: 1): The page number for pagination.
        -   `limit` (number, default: 10, max: 100): The number of items per page.
        -   `sortBy` (string, default: 'created_at'): Field to sort by. Allowed values: `name`, `created_at`, `last_reviewed_at`.
        -   `order` (string, default: 'desc'): Sort order. Allowed values: `asc`, `desc`.

## Utilized Types

-   **`Deck`**: The existing entity from `src/types.ts`.
-   **`ListDecksQuerySchema`**: A new Zod schema in `src/lib/schemas/deck.schemas.ts` for validating and transforming query parameters.
-   **`ListDecksResponse`**: A new response DTO in `src/types.ts` to structure the output payload, including `data` and `pagination` fields.

## Response Details

-   **Success (200 OK)**:
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
-   **Error**:
    -   `400 Bad Request`: `{"error": "Invalid input", "details": [...]}`
    -   `401 Unauthorized`: `{"error": "Authentication required"}`
    -   `500 Internal Server Error`: `{"error": "An unexpected error occurred"}`

## Data Flow

1.  A `GET` request arrives at `/api/decks`.
2.  The Astro middleware (`src/middleware/index.ts`) verifies the JWT and populates `context.locals.supabase` and `context.locals.session`. If authentication fails, it returns a 401 response.
3.  The API route handler in `src/pages/api/decks/index.ts` is executed.
4.  The handler parses and validates the URL query parameters using the `ListDecksQuerySchema` from `zod`. If validation fails, it returns a 400 response.
5.  The handler calls the `listDecks` function in `src/lib/services/deck-service.ts`, passing the validated parameters and the `supabase` client from `context.locals`.
6.  The `listDecks` service function constructs and executes a Supabase query:
    -   It fetches a paginated list of decks for the current user, applying `sortBy` and `order`. RLS policies automatically enforce data ownership.
    -   It performs a second query to get the total count of the user's decks.
    -   It calculates pagination details (`totalPages`).
7.  The service function returns the decks and pagination data to the API handler.
8.  The handler formats the data into the `ListDecksResponse` structure and returns it with a 200 OK status.

## Security Considerations

-   **Authentication**: Handled by the existing Astro middleware, which validates the Supabase JWT. The endpoint must ensure it only proceeds if a valid session exists.
-   **Authorization**: Enforced by PostgreSQL's Row-Level Security (RLS) policies on the `decks` table. The service layer will use the user-specific `SupabaseClient` instance, ensuring queries are automatically filtered for the authenticated user.
-   **Input Validation**: All query parameters will be strictly validated using a `zod` schema to prevent invalid data types, unexpected values, and potential DoS attacks (by capping the `limit` parameter).

## Error Handling

-   **Validation Errors**: `zod` will catch any invalid query parameters. The handler will return a `400 Bad Request` with a descriptive error message.
-   **Authentication Errors**: The middleware will return a `401 Unauthorized` if the JWT is missing, invalid, or expired.
-   **Database/Server Errors**: Any exceptions thrown from the service layer (e.g., database connection issues) will be caught in the handler, logged to the server console, and a generic `500 Internal Server Error` response will be returned to the client.

## Performance Considerations

-   **Pagination**: The endpoint must always use pagination (`.range()` in Supabase) to avoid fetching large datasets and overloading the server and client.
-   **Database Indexing**: The `decks` table should have indexes on `user_id` and the `sortBy` columns (`created_at`, `name`, `last_reviewed_at`) to ensure efficient sorting and filtering. The initial schema should be checked to confirm these exist.
-   **Query Count**: The implementation will require two queries: one for the data and one for the total count. This is an acceptable trade-off for providing accurate pagination information.

## Implementation Steps

1.  **Update Types**: Add the `ListDecksResponse` interface to `src/types.ts`.
2.  **Create Zod Schema**: In `src/lib/schemas/deck.schemas.ts`, define `ListDecksQuerySchema` to validate `page`, `limit`, `sortBy`, and `order`. Include defaults and transformations.
3.  **Implement Service Logic**:
    -   In `src/lib/services/deck-service.ts`, create an async function `listDecks({ supabase, page, limit, sortBy, order })`.
    -   Implement the logic to calculate the range for pagination.
    -   Build the Supabase query to fetch decks with sorting and range.
    -   Build the query to fetch the total count of decks.
    -   Return `{ data, pagination }`.
4.  **Implement API Endpoint**:
    -   In `src/pages/api/decks/index.ts`, create the `GET` handler.
    -   Ensure `prerender` is set to `false`.
    -   Check for an authenticated session from `Astro.locals.session`.
    -   Use a `try...catch` block for error handling.
    -   Parse and validate query parameters using `ListDecksQuerySchema.safeParse()`.
    -   Call the `listDecks` service function with the validated data.
    -   Return the response with the correct status code and payload.
5.  **Testing**: Create a test script (e.g., using `curl` or a test file) to verify:
    -   Successful response with default parameters.
    -   Correct sorting and pagination with optional parameters.
    -   400 error for invalid parameters.
    -   401 error for unauthenticated requests.
