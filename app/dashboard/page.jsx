"use client";

import React, { useEffect, memo } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'

const Dashboard = memo(function Dashboard() {
    const { user, userProfile, loading } = useSupabase();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if we have user and profile data and we're on the base dashboard route
        if (!loading && userProfile && userProfile.role && window.location.pathname === '/dashboard') {
            const role = userProfile.role.toLowerCase();
            if (role === 'parent') {
                router.replace('/dashboard/parent');
            } else if (role === 'student') {
                router.replace('/dashboard/student');
            } else {
                router.replace('/auth/role-selection');
            }
        }
    }, [loading, userProfile, router]);

    // Show content area loading only - layout handles sidebar/header
    if (loading || !userProfile) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    // Fallback content (should rarely be seen due to redirect)
    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Setting up your dashboard...</p>
            </div>
        </div>
    );
});

export default Dashboard;
