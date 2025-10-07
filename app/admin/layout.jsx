"use client";

import React, { useEffect, useRef, useMemo, memo } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'
import { Shield, Users, BarChart3, Settings, LogOut, Brain } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'

const AdminLayout = memo(function AdminLayout({ children }) {
    const { userProfile, loading: supabaseLoading, user, supabase, refreshUserProfile } = useSupabase();
    const router = useRouter();
    const statusCheckInterval = useRef(null);
    const redirectingRef = useRef(false);

    // Clear all caches when user is suspended or not approved
    const clearAllCaches = () => {
        if (typeof window !== 'undefined') {
            // Clear dashboard session
            sessionStorage.removeItem('dashboard_loaded');
            // Clear profile cache
            localStorage.removeItem('profile_cache_v1');
            // Clear any other potential caches
            sessionStorage.clear();
        }
    };

    // Authentication and authorization guard
    useEffect(() => {
        if (!supabaseLoading) {
            if (!user) {
                // No user logged in, redirect to login
                clearAllCaches();
                redirectingRef.current = true;
                router.replace('/auth/login');
                return;
            }

            if (!userProfile) {
                // Still loading profile; do nothing here to avoid redirect flicker
                return;
            }

            if (userProfile.role !== 'admin') {
                // User is not admin, redirect to appropriate dashboard
                clearAllCaches();
                redirectingRef.current = true;
                if (userProfile.role === 'parent') {
                    router.replace('/dashboard/parent');
                } else {
                    router.replace('/dashboard/student');
                }
                return;
            }

            // Check if admin is suspended
            if (userProfile.isSuspended) {
                clearAllCaches();
                redirectingRef.current = true;
                router.replace('/auth/waiting-approval');
                return;
            }

            // Admins can access admin panel if approved and not suspended
        }
    }, [user, userProfile, supabaseLoading, router]);

    // Optimized status monitoring with reduced frequency for better performance
    useEffect(() => {
        if (!user || supabaseLoading) return;

        let isMounted = true;
        let consecutiveFailures = 0;
        const MAX_CONSECUTIVE_FAILURES = 3;

        const checkUserStatus = async () => {
            if (!isMounted) return;

            try {
                // Use centralized refresh method instead of direct API call
                const { data: currentUser, error } = await refreshUserProfile();

                if (!error && currentUser && isMounted) {
                    consecutiveFailures = 0; // Reset failure count on success

                    // Check if user status has changed
                    // If admin is now suspended, redirect immediately and CLEAR CACHES
                    if (currentUser.isSuspended) {
                        clearAllCaches();
                        redirectingRef.current = true;
                        router.replace('/auth/waiting-approval');
                        return;
                    }

                    // If user is no longer admin, redirect to appropriate dashboard and CLEAR CACHES
                    if (currentUser.role !== 'admin') {
                        clearAllCaches();
                        redirectingRef.current = true;
                        if (currentUser.role === 'parent') {
                            router.replace('/dashboard/parent');
                        } else {
                            router.replace('/dashboard/student');
                        }
                        return;
                    }
                } else if (!currentUser && isMounted) {
                    // User profile not found, redirect to login and CLEAR CACHES
                    clearAllCaches();
                    redirectingRef.current = true;
                    router.replace('/auth/login');
                    return;
                }
            } catch (error) {
                consecutiveFailures++;
                // If we have too many consecutive failures, stop checking to avoid performance issues
                if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                    console.warn('Admin status check disabled due to consecutive failures:', error);
                    return;
                }
                console.warn('Admin status check failed:', error);
            }
        };

        // Skip initial check since it's already handled by the auth guard useEffect

        // Set up interval for continuous monitoring (every 30 seconds for better performance)
        statusCheckInterval.current = setInterval(checkUserStatus, 30000);

        return () => {
            isMounted = false;
            if (statusCheckInterval.current) {
                clearInterval(statusCheckInterval.current);
                statusCheckInterval.current = null;
            }
        };
    }, [user, supabaseLoading, router, refreshUserProfile]);

    const handleSignOut = useMemo(() => async () => {
        try {
            await supabase.auth.signOut();
            // Force redirect to homepage using window.location for complete navigation
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
            // Even if signOut fails, redirect to homepage
            window.location.href = '/';
        }
    }, [supabase]);

    // Show loading states for various scenarios
    if (supabaseLoading) {
        return (
            <LoadingSpinner
                text="Loading Admin Panel"
                subtitle="Verifying admin access..."
                variant="admin"
            />
        );
    }

    // Show loading while redirecting
    if (redirectingRef.current) {
        return (
            <LoadingSpinner
                text="Redirecting..."
                subtitle="Taking you to the right place"
                variant="admin"
            />
        );
    }

    // Show loading while checking authentication or profile
    if (!user || !userProfile) {
        return (
            <LoadingSpinner
                text="Verifying Access"
                subtitle="Checking your account status..."
                variant="admin"
            />
        );
    }

    // Show loading if user is not admin
    if (userProfile.role !== 'admin') {
        return (
            <LoadingSpinner
                text="Access Denied"
                subtitle="Redirecting to your dashboard..."
                variant="admin"
            />
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
            {/* Admin Sidebar */}
            <div className='md:w-72 hidden md:block fixed h-full z-10 bg-white shadow-xl border-r border-gray-200'>
                <div className='p-6 border-b border-gray-200'>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                            <p className="text-sm text-gray-500">AI LMS Platform</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className='p-6 space-y-2'>
                    <Link
                        href='/admin'
                        className='flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors duration-200'
                    >
                        <Users className='w-5 h-5' />
                        <span className='font-medium'>User Management</span>
                    </Link>
                </nav>

                {/* Admin Info & Sign Out */}
                <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200'>
                    <div className='bg-indigo-50 p-4 rounded-lg mb-4'>
                        <div className='flex items-center space-x-3'>
                            <Shield className='w-5 h-5 text-indigo-600' />
                            <div>
                                <p className='text-sm font-medium text-indigo-800'>{userProfile.name}</p>
                                <p className='text-xs text-indigo-600'>Administrator</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full flex items-center justify-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className='md:ml-72'>
                {/* Top Header */}
                <div className='bg-white shadow-sm border-b border-gray-200 p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                            <p className="text-gray-600">Manage users and monitor platform activity</p>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className='p-6'>
                    {children}
                </div>
            </div>
        </div>
    );
});

export default AdminLayout;
