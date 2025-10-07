import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables. Please check your .env.local file.');
    throw new Error('Missing Supabase configuration');
  }
  
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Handle token refresh errors gracefully
      detectSessionInUrl: false, // Prevent automatic session parsing from URL
      persistSession: true,
      autoRefreshToken: true,
      onAuthStateChange: (event, session) => {
        // This gets called for auth state changes
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed, clear any stored tokens
          if (typeof window !== 'undefined') {
            try {
              // Clear Supabase auth storage
              for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                  localStorage.removeItem(key);
                }
              }
            } catch (e) {
              // Ignore errors during cleanup
            }
          }
        }
      }
    }
  });
  
  return client;
}
