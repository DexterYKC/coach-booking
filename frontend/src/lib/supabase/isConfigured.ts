export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return Boolean(url) && !url.includes("placeholder") && url.startsWith("https://");
}
