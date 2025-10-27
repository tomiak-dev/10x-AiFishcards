import type { APIContext } from "astro";

import { createSupabaseServerInstance } from "@/db/supabase.client.ts";
import { LoginSchema } from "@/lib/schemas/auth.schemas.ts";

export const prerender = false;

export async function POST(context: APIContext) {
  try {
    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = validationResult.data;

    // Create Supabase server instance with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies: context.cookies,
      headers: context.request.headers,
    });

    // Attempt to sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message === "Invalid login credentials" ? "Nieprawidłowy adres e-mail lub hasło" : error.message,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return user data (session is handled via cookies automatically)
    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas logowania",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
