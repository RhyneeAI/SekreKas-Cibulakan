import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SECRET_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return adminClient;
}

export function getStorageBucket(kind: "logbook" | "finance"): string {
  if (kind === "logbook") {
    return process.env.SUPABASE_STORAGE_BUCKET_LOGBOOK || "logbook";
  }
  return process.env.SUPABASE_STORAGE_BUCKET_FINANCE || "finance";
}
