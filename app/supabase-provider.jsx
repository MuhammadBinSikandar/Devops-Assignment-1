//app/supabase-provider.js
"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';

// Simple in-flight request coalescing so multiple callers share the same GET
let inflightProfilePromise = null;

const PROFILE_CACHE_KEY = 'profile_cache_v1';
const PROFILE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes (increased from 10)
const FRESH_CACHE_THRESHOLD = 2 * 60 * 1000; // 2 minutes for super fresh data (increased from 30 seconds)

function readCachedEntry(userId) {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.userId !== userId) return null;
    if (Date.now() - (parsed.updatedAt || 0) > PROFILE_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedProfile(userId, profile, etag) {
  try {
    if (typeof window === 'undefined') return;
    const payload = { userId, profile, etag: etag || null, updatedAt: Date.now() };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(payload));
    // Broadcast to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('profile-cache');
      bc.postMessage({ type: 'profile-updated', payload });
      bc.close();
    }
  } catch { }
}
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const SupabaseContext = createContext({});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

const SupabaseProvider = memo(function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const router = useRouter();
  // Create a stable Supabase client instance to avoid re-subscribing & re-fetching on each render
  const supabase = useMemo(() => createClient(), []);

  // Internal guards to prevent duplicate /api/auth/user calls
  const hasFetchedProfileRef = useRef(false);
  const fetchingProfileRef = useRef(false);

  const fetchProfileOnce = useCallback(async (userId, force = false) => {
    // Enhanced guards to prevent unnecessary fetches
    if (!userId || fetchingProfileRef.current) return;

    // If we have a fresh profile and not forcing, return early
    if (!force && userProfile?.id === userId) return;

    // Check cache first - use longer threshold for better performance
    const cached = readCachedEntry(userId);
    if (!force && cached?.profile && Date.now() - (cached.updatedAt || 0) < FRESH_CACHE_THRESHOLD) {
      if (!userProfile || userProfile.id !== cached.profile.id) {
        setUserProfile(cached.profile);
      }
      return;
    }

    fetchingProfileRef.current = true;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (cached?.etag && !force) {
        headers['If-None-Match'] = cached.etag;
      }

      // Use singleton pattern for in-flight requests
      if (!inflightProfilePromise || force) {
        inflightProfilePromise = fetch('/api/auth/user', { method: 'GET', headers });
        inflightProfilePromise.finally(() => {
          setTimeout(() => { inflightProfilePromise = null; }, 200);
        });
      }

      const response = await inflightProfilePromise;

      if (response.status === 304 && cached?.profile) {
        // Update cache timestamp but don't update state if profile is same
        if (!userProfile || userProfile.id !== cached.profile.id) {
          setUserProfile(cached.profile);
        }
        writeCachedProfile(userId, cached.profile, cached.etag);
      } else if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        const etag = response.headers.get('etag');
        writeCachedProfile(userId, data.user, etag);
      } else if (response.status === 404) {
        setUserProfile(null);
      } else if (response.status === 401) {
        // Auth error - clear everything and don't retry
        setUser(null);
        setUserProfile(null);
        hasFetchedProfileRef.current = false;
      } else if (response.status === 429) {
        // Rate limited - use cached data if available, don't retry immediately
        if (cached?.profile && (!userProfile || userProfile.id !== cached.profile.id)) {
          setUserProfile(cached.profile);
        }
      }
    } catch (error) {
      // Handle profile fetch errors gracefully - use cached data if available
      if (cached?.profile && (!userProfile || userProfile.id !== cached.profile.id)) {
        setUserProfile(cached.profile);
      } else {
        setUserProfile(null);
      }

      // If it's an auth error, clear the user state to prevent infinite retries
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setUser(null);
        hasFetchedProfileRef.current = false;
      }
    } finally {
      fetchingProfileRef.current = false;
    }
  }, [userProfile]); // Add userProfile dependency as required by ESLint

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Check cache first before making any network calls
        const cachedSession = typeof window !== 'undefined' ?
          localStorage.getItem('sb-' + (process.env.NEXT_PUBLIC_SUPABASE_URL || '').split('//')[1]?.split('.')[0] + '-auth-token') : null;

        const { data: { user }, error } = await supabase.auth.getUser();
        if (!isMounted) return;

        // Handle auth errors gracefully
        if (error) {
          // If there's an invalid token or refresh token error, clear the session entirely
          if (error.message?.includes('does not exist') ||
            error.message?.includes('invalid') ||
            error.message?.includes('Invalid Refresh Token') ||
            error.message?.includes('Refresh Token Not Found')) {
            try {
              await supabase.auth.signOut({ scope: 'local' }); // Clear local session only
            } catch (signOutError) {
              // If sign out fails, just continue - we'll clear state anyway
            }
          }

          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        // Set user immediately to prevent loading flicker
        setUser(user);

        // Only fetch profile if user exists and we don't have valid cached data
        if (user && !hasFetchedProfileRef.current) {
          // Try cache first to avoid a network call
          const cached = readCachedEntry(user.id);
          if (cached?.profile && Date.now() - (cached.updatedAt || 0) < PROFILE_CACHE_TTL_MS) {
            setUserProfile(cached.profile);
            hasFetchedProfileRef.current = true;
          } else {
            hasFetchedProfileRef.current = true;
            // Don't await - let it load in background
            fetchProfileOnce(user.id);
          }
        } else if (!user) {
          // No user, clear profile and set not loading
          setUserProfile(null);
          hasFetchedProfileRef.current = false; // Reset flag when no user
        }

        // Set loading to false immediately after setting user to reduce loading time
        setLoading(false);
      } catch (initError) {
        console.warn('Supabase initialization error:', initError);

        // Clear any invalid tokens if this is a token-related error
        if (initError.message?.includes('Invalid Refresh Token') ||
          initError.message?.includes('Refresh Token Not Found')) {
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (signOutError) {
            // Ignore sign out errors during error cleanup
          }
        }

        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          const newUser = session?.user ?? null;

          // Only update user state if it's actually different
          if (newUser?.id !== user?.id) {
            setUser(newUser);

            if (newUser) {
              // New user logged in, check cache first
              const cached = readCachedEntry(newUser.id);
              if (cached?.profile && Date.now() - (cached.updatedAt || 0) < PROFILE_CACHE_TTL_MS) {
                setUserProfile(cached.profile);
                setProfileLoaded(true);
                hasFetchedProfileRef.current = true;
              } else if (!profileLoaded && !userProfile?.id) {
                // Only fetch if we don't have profile data at all - don't await to improve performance
                hasFetchedProfileRef.current = true;
                fetchProfileOnce(newUser.id); // Remove await for faster loading
                setProfileLoaded(true);
              }
            } else {
              // User signed out, clear profile
              setUserProfile(null);
              setProfileLoaded(false);
              hasFetchedProfileRef.current = false;
            }
          }

          // Only set loading to false if it's currently true to prevent unnecessary re-renders
          if (loading) setLoading(false);
        } catch (authChangeError) {
          console.warn('Auth state change error:', authChangeError);

          // Clear invalid tokens if this is a token-related error
          if (authChangeError.message?.includes('Invalid Refresh Token') ||
            authChangeError.message?.includes('Refresh Token Not Found')) {
            try {
              await supabase.auth.signOut({ scope: 'local' });
            } catch (signOutError) {
              // Ignore sign out errors during error cleanup
            }
            setUser(null);
            setUserProfile(null);
            setProfileLoaded(false);
            hasFetchedProfileRef.current = false;
          }

          if (loading) setLoading(false);
        }
      }
    );

    // Cross-tab sync for cache updates
    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('profile-cache');
      bc.onmessage = (event) => {
        if (event?.data?.type === 'profile-updated') {
          const payload = event.data.payload;
          if (payload?.userId && payload.userId === user?.id) {
            setUserProfile(payload.profile || null);
          }
        }
      };
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (bc) bc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // Optimized realtime subscription for critical status updates only
  useEffect(() => {
    if (!user?.id) return;

    let debounceTimeout;
    const channel = supabase
      .channel(`user-status-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `supabase_id=eq.${user.id}` },
        (payload) => {
          // Debounce rapid updates to prevent performance issues
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            const nextProfile = payload?.new || null;
            if (!nextProfile) return;

            // Only update if profile actually changed
            const hasChanged = !userProfile ||
              userProfile.isSuspended !== nextProfile.isSuspended ||
              userProfile.isApproved !== nextProfile.isApproved ||
              userProfile.role !== nextProfile.role;

            if (hasChanged) {
              setUserProfile(nextProfile);
              try {
                writeCachedProfile(user.id, nextProfile, null);
              } catch (_) { }

              // If role changed, route to appropriate destination
              if (nextProfile.role) {
                const role = (nextProfile.role || '').toLowerCase();
                const currentPath = window.location.pathname;
                const targetPath = role === 'admin' ? '/admin' : role === 'parent' ? '/dashboard/parent' : '/dashboard/student';

                // Only redirect if not already on correct path
                if (!currentPath.startsWith(targetPath)) {
                  router.replace(targetPath);
                }
              }
            }
          }, 100); // 100ms debounce
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimeout);
      try { supabase.removeChannel(channel); } catch (_) { }
    };
  }, [supabase, user?.id, router, userProfile]);

  // Sanitize allowed profile fields client-side to match server whitelist
  const sanitizeProfileInput = (payload) => {
    const allowed = [
      'role', 'name', 'bio', 'location', 'website', 'linkedin_url', 'github_url',
      'phone', 'country', 'city', 'timezone', 'language', 'twitter_url',
      // Student fields
      'grade', 'school_name', 'date_of_birth', 'learning_goals', 'subjects_of_interest',
      'learning_style', 'difficulty_preference',
      // Parent fields
      'occupation', 'number_of_children', 'education_level', 'parenting_experience', 'children_age_range'
    ];
    const result = {};
    for (const key of allowed) {
      if (payload[key] == null) continue;
      let value = payload[key];
      if (typeof value === 'string') value = value.trim();
      // Minimal length limits for strings
      if (typeof value === 'string' && value.length > 1000) value = value.slice(0, 1000);
      result[key] = value;
    }
    if (typeof result.role === 'string') result.role = result.role.toLowerCase();
    return result;
  };

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { data: null, error: 'No user logged in' };

    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizeProfileInput(updates)),
      });

      const responseData = await response.json();

      if (response.ok || response.status === 202) {
        const updatedProfile = responseData.user || null;
        // Ensure we preserve the existing role if it's not being updated
        if (updatedProfile && userProfile && !updatedProfile.role && userProfile.role) {
          updatedProfile.role = userProfile.role;
        }
        setUserProfile(updatedProfile);
        // Update cache with new profile data
        if (user?.id && updatedProfile) {
          writeCachedProfile(user.id, updatedProfile, null);
        }
        return { data: updatedProfile, error: null };
      } else {
        return { data: null, error: responseData.error };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  }, [user, userProfile]);

  const createProfile = useCallback(async (user, additionalData = {}) => {
    try {
      const profileData = {
        role: additionalData.role || 'student',
        ...additionalData
      };

      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizeProfileInput(profileData)),
      });

      const responseData = await response.json();

      if (response.ok || response.status === 202) {
        // Use optimistic user from 202 response when background processing is used
        const updatedProfile = responseData.user || null;
        setUserProfile(updatedProfile);
        // Update cache with new profile data
        if (user?.id && updatedProfile) {
          writeCachedProfile(user.id, updatedProfile, null);
        }
        return { data: updatedProfile, error: null };
      }
      return { data: null, error: responseData.error };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
  }, []);

  // Optimized method to refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return { data: null, error: 'No user logged in' };

    try {
      // Use the optimized fetchProfileOnce with force flag
      await fetchProfileOnce(user.id, true);
      return { data: userProfile, error: null };
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return { data: null, error };
    }
  }, [user?.id, fetchProfileOnce, userProfile]);

  const signOut = useCallback(async () => {
    // Best-effort: revoke all refresh tokens (global sign out)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (_) {
      // Fallback: clear only local session if global fails
      try { await supabase.auth.signOut({ scope: 'local' }); } catch (_) { }
    }

    // Clear client-side caches and storage
    if (typeof window !== 'undefined') {
      try {
        // App-specific session flag
        sessionStorage.removeItem('dashboard_loaded');

        // Remove cached profile
        localStorage.removeItem(PROFILE_CACHE_KEY);

        // Remove any Supabase auth entries from localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        }

        // Best-effort cookie clearing for auth tokens (in case cookies are used)
        const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'supabase.auth.token'];
        cookiesToClear.forEach((name) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        });
      } catch (_) { }
    }

    // Reset in-memory state
    setUser(null);
    setUserProfile(null);
    setProfileLoaded(false);
    hasFetchedProfileRef.current = false;

    // Redirect to homepage (replace to avoid back button returning to authed views)
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, [supabase]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    supabase,
    refreshUserProfile,
    signOut,
    updateProfile,
    createProfile,
  }), [user, userProfile, loading, supabase, refreshUserProfile, signOut, updateProfile, createProfile]);

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
});

export { SupabaseProvider };