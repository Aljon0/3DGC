import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Missing Supabase env variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// This is the FRONTEND Supabase client.
// It uses the anon key and respects Row Level Security (RLS).
// Used for Auth (login, register, session management) AND Realtime subscriptions.
// All other data fetching goes through your Express backend API.
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession:     true,   // Saves session to localStorage automatically
    autoRefreshToken:   true,   // Refreshes JWT before it expires
    detectSessionInUrl: false,  // Not using OAuth redirects
  },
  realtime: {
    params: {
      eventsPerSecond: 10,      // Throttle — free tier safe
    },
  },
});

export default supabase;