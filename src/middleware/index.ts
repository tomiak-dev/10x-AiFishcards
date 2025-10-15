import { defineMiddleware } from "astro:middleware";

import { supabaseClient, DEFAULT_USER_UUID } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;

  // For API routes, check authentication
  if (context.url.pathname.startsWith("/api/")) {
    const authHeader = context.request.headers.get("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.getUser(token);

        if (!error && user) {
          context.locals.userId = user.id;
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      }
    }

    // DEVELOPMENT ONLY: Fallback to default test user UUID when no valid token is provided
    // This allows testing API endpoints without authentication during development
    // TODO: Remove or disable this in production environment
    if (!context.locals.userId) {
      context.locals.userId = DEFAULT_USER_UUID;
    }
  }

  return next();
});
