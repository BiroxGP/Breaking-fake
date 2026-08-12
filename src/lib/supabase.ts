import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** `null` until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set (see .env.example) — callers
 * treat a missing client as "feedback submission unavailable" rather than throwing. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
