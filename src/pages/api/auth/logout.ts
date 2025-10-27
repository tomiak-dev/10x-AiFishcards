import type { APIContext } from "astro";

import { createSupabaseServerInstance } from "@/db/supabase.client.ts";

export const prerender = false;

export async function POST(context: APIContext) {
  try {
    // Create Supabase server instance with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies: context.cookies,
      headers: context.request.headers,
    });

    // Sign out user (clears session cookies)
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas wylogowania",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas wylogowania",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
