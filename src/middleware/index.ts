import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.client.ts";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  // Auth pages
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
];

// Paths that redirect authenticated users to dashboard
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  // Create Supabase instance and store in locals for reuse in endpoints
  context.locals.supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await context.locals.supabase.auth.getUser();

  // Set user in locals if authenticated
  if (user?.email) {
    context.locals.user = {
      id: user.id,
      email: user.email,
    };
  }

  const pathname = context.url.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Redirect authenticated users away from auth pages to dashboard
  if (user && isAuthPage) {
    return context.redirect("/dashboard");
  }

  // Redirect unauthenticated users from protected pages to login
  if (!user && !isPublicPath) {
    return context.redirect("/login");
  }

  return next();
});
