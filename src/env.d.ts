/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
    }
  }

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
