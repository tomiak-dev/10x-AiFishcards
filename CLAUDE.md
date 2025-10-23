# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

10xdevsFishcards is a flashcard application that automates flashcard creation using AI. Users can paste text (2000-10,000 characters) to generate AI-powered flashcard proposals, review and edit them, and save them as decks. The app also supports manual flashcard creation and includes a spaced repetition learning module based on the SM-2 algorithm.

## Tech Stack

- **Framework**: Astro 5 (server-side rendering, output: "server")
- **UI Library**: React 19 (for interactive components only)
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Supabase (authentication, database)
- **AI Integration**: OpenRouter API for flashcard generation
- **Package Manager**: npm
- **Runtime**: Node.js (adapter: @astrojs/node, standalone mode)

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

## Project Architecture

### Directory Structure

- `src/pages/` - Astro pages (routes)
- `src/pages/api/` - API endpoints (REST-like structure)
  - `api/ai/` - AI flashcard generation endpoints
  - `api/decks/` - Deck CRUD operations
  - `api/flashcards/` - Flashcard CRUD operations
- `src/layouts/` - Astro layouts
- `src/components/` - UI components
  - `.astro` files for static content
  - `.tsx` files for interactive React components
  - `src/components/ui/` - shadcn/ui components
  - `src/components/hooks/` - Custom React hooks
- `src/middleware/index.ts` - Request/response middleware (handles Supabase client injection and auth)
- `src/db/` - Database client and types
  - `database.types.ts` - Auto-generated Supabase types
  - `supabase.client.ts` - Supabase client instance
- `src/lib/` - Business logic layer
  - `src/lib/services/` - Service layer (business logic, data access)
  - `src/lib/schemas/` - Zod validation schemas
  - `src/lib/utils.ts` - Utility functions
  - `src/lib/react-query.ts` - React Query configuration
- `src/types.ts` - Shared TypeScript types (Entities, DTOs, Commands)
- `supabase/migrations/` - Database migrations

### Key Architectural Patterns

**Three-Layer Architecture**:
1. **API Routes** (`src/pages/api/`) - Request handling, validation, response formatting
2. **Service Layer** (`src/lib/services/`) - Business logic, database operations
3. **Database Layer** - Supabase PostgreSQL

**Type-Driven Development**:
- `src/db/database.types.ts` - Generated from Supabase schema (source of truth)
- `src/types.ts` - Application-level types derived from database types
- Uses type aliases and Pick utility types to create DTOs and Commands

**Middleware Pattern**:
- `src/middleware/index.ts` injects Supabase client into `context.locals.supabase`
- Handles authentication by extracting Bearer tokens and setting `context.locals.userId`
- Falls back to `DEFAULT_USER_UUID` in development for testing without auth

**Component Architecture**:
- Astro components (.astro) for static content and layouts
- React components (.tsx) for interactive UI only
- Never use "use client" directive (Next.js-specific, not needed in Astro)
- Use `client:load`, `client:idle`, etc. directives in Astro to hydrate React components

**Validation Strategy**:
- All API endpoints use Zod schemas for input validation
- Schemas defined in `src/lib/schemas/`
- Validation happens at API route level before calling services

### Authentication Flow

1. User authentication via Supabase Auth (email/password)
2. Middleware extracts `Authorization: Bearer <token>` header
3. Token verified with `supabaseClient.auth.getUser(token)`
4. `context.locals.userId` set for valid tokens
5. Development fallback: uses `DEFAULT_USER_UUID` when no valid token (for testing)

### Database Types

```bash
# Regenerate Supabase types after schema changes
npx supabase gen types typescript --project-id <project-id> > src/db/database.types.ts
```

### AI Service Integration

- OpenRouter API used for flashcard generation
- Service located in `src/lib/services/openrouter-service.ts`
- Separate schema validation in `src/lib/services/openrouter-service.schemas.ts`
- AI-specific API routes in `src/pages/api/ai/`

## API Endpoint Conventions

- Use uppercase HTTP method names: `export async function POST(...)`, `export async function GET(...)`
- Add `export const prerender = false` to disable static prerendering
- Extract `context.locals.supabase` for database access (never import `supabaseClient` directly in routes)
- Extract `context.locals.userId` for authenticated user ID
- Validate input with Zod schemas before calling services
- Return JSON responses with appropriate HTTP status codes
- Service layer handles all business logic and database operations

Example pattern:
```typescript
export const prerender = false;

export async function POST(context: APIContext) {
  const supabase = context.locals.supabase;
  const userId = context.locals.userId;

  // Validate input
  const body = await context.request.json();
  const validated = schema.parse(body);

  // Call service layer
  const result = await someService(supabase, userId, validated);

  return new Response(JSON.stringify(result), { status: 200 });
}
```

## Styling Guidelines

- Tailwind 4 with Vite plugin integration
- Use utility classes directly in components
- Dark mode support via `dark:` variant
- Custom theme configuration in Tailwind config
- Use `cn()` utility (from `src/lib/utils.ts`) to merge class names conditionally

## React Best Practices

- Functional components with hooks only
- Extract complex logic into custom hooks (`src/components/hooks/`)
- Use React.memo() for expensive components
- Use useCallback/useMemo to prevent unnecessary re-renders
- React Query for server state management (config in `src/lib/react-query.ts`)

## Error Handling Pattern

- Handle errors and edge cases at the beginning of functions
- Use early returns for error conditions
- Avoid unnecessary else statements (if-return pattern)
- Guard clauses for preconditions and invalid states
- Custom error types or error factories for consistency
- User-friendly error messages

## Important Constraints

- Supabase RLS policies are disabled (handled at application level)
- Development mode uses `DEFAULT_USER_UUID` for testing without auth
- Text input for AI generation limited to 2000-10,000 characters
- Flashcard front: max 200 characters, back: max 500 characters

## Environment Variables

Required in `.env`:
```
SUPABASE_URL=
SUPABASE_KEY=
OPENROUTER_API_KEY=
```

## Supabase Local Development

```bash
# Start local Supabase (requires Docker)
npx supabase start

# Stop local Supabase
npx supabase stop

# View database migrations status
npx supabase migration list

# Create a new migration
npx supabase migration new <migration_name>

# Apply migrations
npx supabase db push
```
