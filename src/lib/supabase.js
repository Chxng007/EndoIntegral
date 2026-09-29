import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase =
  url && key ? createClient(url, key, { auth: { flowType: "pkce" } }) : null;
export const formsEnabled = Boolean(
  supabase && import.meta.env.VITE_FORMS_ENABLED === "true",
);
export const unavailableMessage =
  "El servicio todavía no está habilitado. Puedes contactar al equipo en Instagram: @endo_integral.";
export function assertService() {
  if (!supabase) throw new Error(unavailableMessage);
  return supabase;
}
export async function result(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
