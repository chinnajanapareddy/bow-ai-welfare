export type DbMode = "sqlite" | "supabase";

export const DB_MODE: DbMode = (process.env["DB_MODE"] ?? "sqlite") as DbMode;

export const supabaseConfig = {
  url: process.env["VITE_SUPABASE_URL"] ?? "",
  anonKey: process.env["VITE_SUPABASE_ANON_KEY"] ?? "",
  serviceRoleKey: process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "",
};

export function hasSupabaseConfig() {
  return Boolean(
    supabaseConfig.url &&
      supabaseConfig.anonKey &&
      supabaseConfig.serviceRoleKey &&
      DB_MODE === "supabase",
  );
}
