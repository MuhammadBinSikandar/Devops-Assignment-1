// Reusable auth guard hook to eliminate duplicate auth logic across pages
import { useEffect, useRef } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { useRouter } from 'next/navigation';

export function useAuthGuard(options = {}) {
    const {
        allowedRoles = ['student', 'parent'], // Roles that can access this page
        checkInterval = 30000, // Status check interval (30 seconds default, increased from 5)
        redirectPaths = {
            login: '/auth/login',
            waitingApproval: '/auth/waiting-approval',
            admin: '/admin',
            studentDashboard: '/dashboard/student',
            parentDashboard: '/dashboard/parent'
        }
    } = options;

    const { user, userProfile, loading: supabaseLoading, refreshUserProfile } = useSupabase();
    const router = useRouter();
    const statusCheckInterval = useRef(null);
    const redirectingRef = useRef(false);

    // Optimized cache clearing function
    const clearAllCaches = () => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.removeItem('dashboard_loaded');
                localStorage.removeItem('profile_cache_v1');
                // Clear any other session data except important caches
                const keysToRemove = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && !key.startsWith('course_') && !key.startsWith('connection_')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => sessionStorage.removeItem(key));
            } catch (error) {
                // Ignore cache clearing errors
            }
        }
    };

    // Main authentication guard
    useEffect(() => {
        if (supabaseLoading) return;

        if (!user) {
            clearAllCaches();
            redirectingRef.current = true;
            router.replace(redirectPaths.login);
            return;
        }

        if (userProfile) {
            // Check if user is suspended or not approved
            if (userProfile.isSuspended || !userProfile.isApproved) {
                clearAllCaches();
                redirectingRef.current = true;
                router.replace(redirectPaths.waitingApproval);
                return;
            }

            // Role-based redirects
            const userRole = (userProfile.role || '').toLowerCase();

            if (!allowedRoles.includes(userRole)) {
                clearAllCaches();
                redirectingRef.current = true;

                // Redirect based on actual role
                if (userRole === 'admin') {
                    router.replace(redirectPaths.admin);
                } else if (userRole === 'parent') {
                    router.replace(redirectPaths.parentDashboard);
                } else {
                    router.replace(redirectPaths.studentDashboard);
                }
                return;
            }
        }
    }, [user, userProfile, supabaseLoading, router, allowedRoles, redirectPaths]);

    // Optimized continuous status monitoring with reduced frequency
    useEffect(() => {
        if (!user || supabaseLoading || !userProfile) return;

        let isMounted = true;
        let consecutiveFailures = 0;
        const MAX_CONSECUTIVE_FAILURES = 3;

        const checkUserStatus = async () => {
            if (!isMounted || redirectingRef.current) return;

            try {
                // Use the optimized refresh method from SupabaseProvider
                const { data: currentUser, error } = await refreshUserProfile();

                if (!error && currentUser && isMounted) {
                    consecutiveFailures = 0; // Reset failure count on success

                    // Check if user status has changed
                    if (currentUser.isSuspended || !currentUser.isApproved) {
                        clearAllCaches();
                        redirectingRef.current = true;
                        router.replace(redirectPaths.waitingApproval);
                        return;
                    }

                    // Check if role changed and user no longer has access
                    const currentRole = (currentUser.role || '').toLowerCase();
                    if (!allowedRoles.includes(currentRole)) {
                        clearAllCaches();
                        redirectingRef.current = true;

                        if (currentRole === 'admin') {
                            router.replace(redirectPaths.admin);
                        } else if (currentRole === 'parent') {
                            router.replace(redirectPaths.parentDashboard);
                        } else {
                            router.replace(redirectPaths.studentDashboard);
                        }
                        return;
                    }
                } else if (!currentUser && isMounted) {
                    // User profile not found, redirect to login
                    clearAllCaches();
                    redirectingRef.current = true;
                    router.replace(redirectPaths.login);
                    return;
                }
            } catch (error) {
                consecutiveFailures++;
                // If we have too many consecutive failures, stop checking to avoid performance issues
                if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                    console.warn('Auth status check disabled due to consecutive failures:', error);
                    return;
                }
            }
        };

        // Set up interval for continuous monitoring with optimized frequency
        statusCheckInterval.current = setInterval(checkUserStatus, checkInterval);

        return () => {
            isMounted = false;
            if (statusCheckInterval.current) {
                clearInterval(statusCheckInterval.current);
                statusCheckInterval.current = null;
            }
        };
    }, [user, supabaseLoading, userProfile, router, allowedRoles, redirectPaths, checkInterval, refreshUserProfile]);

    return {
        user,
        userProfile,
        loading: supabaseLoading,
        isRedirecting: redirectingRef.current,
        isAuthenticated: !!(user && userProfile && !userProfile.isSuspended && userProfile.isApproved),
        clearAllCaches
    };
}

