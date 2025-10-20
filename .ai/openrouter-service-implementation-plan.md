# Plan wdrożenia usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouterService dostarcza warstwę abstrakcji nad API OpenRouter, umożliwiając łatwe wysyłanie rozmów do modeli LLM, definiowanie komunikatów systemowych i użytkownika, konfigurowanie response_format (JSON Schema), wyboru modelu oraz parametrów.

## 2. Opis konstruktora
```ts
constructor(options: {
  apiKey: string;
  baseUrl?: string; // domyślnie https://api.openrouter.ai
  defaultModel?: string; // np. "gpt-4o"
  defaultParams?: Record<string, any>;
})
```
- `apiKey`: klucz API OpenRouter.
- `baseUrl`: opcjonalny adres bazowy API.
- `defaultModel`: domyślnie wybrany model.
- `defaultParams`: domyślne parametry zapytań (np. temperature, max_tokens).

## 3. Publiczne metody i pola
### sendMessage
```ts
async sendMessage(
  messages: Array<{ role: 'system' | 'user'; content: string }>;
  options?: {
    model?: string;
    params?: Record<string, any>;
    responseFormat?: { type: 'json_schema'; json_schema: { name: string; strict: boolean; schema: object } };
  }
): Promise<any>
```
- Buduje payload z komunikatów.
- Wysyła zapytanie do `/v1/chat/completions`.
- Waliduje odpowiedź zgodnie z responseFormat.

### setDefaultModel
Ustawia model domyślny.

### setDefaultParams
Ustawia domyślne parametry.

## 4. Prywatne metody i pola
- `_buildPayload(messages, model, params, responseFormat)`: tworzy obiekt do wysłania.
- `_request(payload)`: wykonuje fetch/axios, obsługuje nagłówki i autoryzację.
- `_validateResponse(response, schema)`: waliduje JSON przy pomocy zod/ajv.
- `_handleErrors(error)`: mapuje błędy HTTP i sieciowe na własne typy.

## 5. Obsługa błędów
1. Brak klucza API → rzuca `AuthError`.
2. Błędy sieciowe (timeout, DNS) → `NetworkError`.
3. Błędy HTTP 4xx/5xx → `ApiError` (z kodem i treścią).
4. Nieprawidłowy format odpowiedzi → `FormatError`.
5. Przekroczenie limitu → `RateLimitError`.

## 6. Kwestie bezpieczeństwa
- Przechowywanie `apiKey` poza kodem (env vars).
- Użycie HTTPS.
- Ograniczenie logowania wrażliwych danych.
- Obsługa rate limit i backoff.
- Walidacja schematu JSON, by uniknąć injection.

## 7. Plan wdrożenia krok po kroku
1. Instalacja zależności:
   ```bash
   npm install axios zod ajv
   ```
2. Utworzenie folderu `src/lib/services` i pliku `openrouter-service.ts`.
3. Zaimplementowanie konstruktora z polami `apiKey`, `baseUrl`, `defaultModel`, `defaultParams`.
4. Zaimplementowanie method `_buildPayload`:
   - Dodanie komunikatów: system + user.
   - Przykład systemowego komunikatu:
     ```ts
     { role: 'system', content: 'You are an AI assistant.' }
     ```
   - Przykład user:
     ```ts
     { role: 'user', content: 'Hello, world!' }
     ```
5. Dodanie wsparcia dla `responseFormat`:
   ```ts
   responseFormat: {
     type: 'json_schema',
     json_schema: {
       name: 'MySchema',
       strict: true,
       schema: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] }
     }
   }
   ```
6. Dodanie `_request` z axios:
   - Nagłówek `Authorization: Bearer ${apiKey}`.
   - POST na `${baseUrl}/v1/chat/completions`.
7. Walidacja odpowiedzi:
   - Użycie AJV lub Zod do walidacji.
8. Obsługa błędów w `_handleErrors` z mapowaniem do custom Error.

