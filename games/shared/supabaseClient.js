/*
 * Tiny wrapper around Supabase's auto-generated PostgREST API for the
 * Scores table — used both by useEmbeddedGame.js (saving a score when a
 * game finishes) and LeaderboardPage.vue (reading them back). Centralized
 * here so the URL-normalizing and auth-header logic only exists once.
 */

// VITE_SUPABASE_URL is documented as the bare project URL, but tolerate it
// already including the /rest/v1 PostgREST path too, so a copy-paste
// mistake there doesn't produce a doubled-up path.
function projectUrl() {
  const raw = import.meta.env.VITE_SUPABASE_URL ?? '';
  return raw.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
}

export function isSupabaseConfigured() {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function supabaseRestUrl(path) {
  return `${projectUrl()}/rest/v1/${path}`;
}

export function supabaseHeaders(extra = {}) {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}
