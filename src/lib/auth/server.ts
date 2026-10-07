import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

async function rolesFor(userId: string): Promise<Set<AppRole>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.role));
}

/**
 * Server-only guard: throws unless the given user holds `role`.
 * Admins implicitly satisfy every lower role.
 */
export async function requireRole(userId: string, role: AppRole) {
  const roles = await rolesFor(userId);
  const allowed = role === "admin" ? roles.has("admin") : roles.has("admin") || roles.has(role);
  if (!allowed) throw new Error("Acceso denegado");
}

/** Server-only guard: throws unless the given user is an admin. */
export async function assertAdmin(userId: string) {
  await requireRole(userId, "admin");
}
