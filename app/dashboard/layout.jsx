"use client";

import React, { useEffect, useRef, memo, useMemo } from 'react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useRouter } from 'next/navigation'
import Sidebar from './_components/Sidebar'
import DashboardHeader from './_components/DashboardHeader'
import { LoadingSpinner } from '@/components/ui/loading'

const DashboardLayout = memo(function DashboardLayout({ children }) {
    // Use optimized auth guard hook for dashboard
    const { user, userProfile, loading: authLoading, isRedirecting } = useAuthGuard({
        allowedRoles: ['student', 'parent'],
        checkInterval: 30000, // Reduced from 5 seconds to 30 seconds
        redirectPaths: {
            login: '/',
            waitingApproval: '/auth/waiting-approval',
            admin: '/admin',
            studentDashboard: '/dashboard/student',
            parentDashboard: '/dashboard/parent'
        }
    });

    // Simplified session handling - no artificial delays
    const sessionChecked = useRef(false);

    useEffect(() => {
        if (sessionChecked.current) return;

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('dashboard_loaded', 'true');
        }
        sessionChecked.current = true;
    }, []);

    // Show full-screen loader only for critical auth states
    if (authLoading && !user) {
        return (
            <LoadingSpinner
                text="Loading Dashboard"
                subtitle="Setting up your workspace..."
                variant="default"
            />
        );
    }

    if (isRedirecting) {
        return (
            <LoadingSpinner
                text="Redirecting..."
                subtitle="Taking you to the right place..."
                variant="default"
            />
        );
    }

    // Always render layout and content immediately when auth is ready
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
            <div className='md:w-72 hidden md:block fixed h-full z-10'>
                <Sidebar />
            </div>
            <div className='md:ml-72'>
                <DashboardHeader />
                <div className='p-6 lg:p-10'>
                    {children}
                </div>
            </div>
        </div>
    );
});

export default DashboardLayout