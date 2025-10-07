"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    Search,
    Settings,
    User,
    Zap,
    Trophy,
    Calendar
} from 'lucide-react';
import { useSupabase } from '@/app/supabase-provider';

function getInitials(name = '') {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[1]?.[0] || '';
    const initials = (first + last).toUpperCase();
    return initials || 'U';
}

function DashboardHeader() {
    const { userProfile, supabase } = useSupabase();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const displayName = userProfile?.name || userProfile?.email || 'User';
    const roleLabel = (userProfile?.role || '').toString().toLowerCase() === 'parent' ? 'Parent' : 'Student';
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left Section - Welcome Message */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Welcome back, {displayName.split(' ')[0]}!</h2>
                            <p className="text-sm text-gray-600">Ready to continue your learning journey?</p>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Quick Actions */}
                    {/* <div className="hidden md:flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                            <Calendar className="w-4 h-4 mr-2" />
                            Today's Schedule
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50">
                            <Trophy className="w-4 h-4 mr-2" />
                            Achievements
                        </Button>
                    </div> */}

                    {/* Notifications */}
                    {/* <div className="relative">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 relative">
                            <Bell className="w-5 h-5" />
                            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                3
                            </Badge>
                        </Button>
                    </div> */}

                    {/* Profile */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-800">{displayName}</p>
                            <p className="text-xs text-gray-500">{roleLabel}</p>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {getInitials(displayName)}
                        </div>

                        {/* Sign Out Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSigningOut}
                            onClick={async () => {
                                setIsSigningOut(true);
                                try {
                                    // Clear the dashboard loaded state and local caches before signing out
                                    if (typeof window !== 'undefined') {
                                        // Session storage cleanup (explicit keys + full clear)
                                        try { sessionStorage.removeItem('dashboard_loaded'); } catch (_) { }
                                        try { sessionStorage.removeItem('phantom.contentScript.providerInjectionOptions.v3'); } catch (_) { }
                                        try { sessionStorage.removeItem('bis_data'); } catch (_) { }
                                        try { sessionStorage.clear(); } catch (_) { }

                                        // Local storage cleanup
                                        try { localStorage.removeItem('profile_cache_v1'); } catch (_) { }
                                        try { localStorage.clear(); } catch (_) { }
                                    }
                                    await supabase.auth.signOut();
                                    // Force redirect to homepage after sign out
                                    window.location.href = '/';
                                } catch (error) {
                                    console.error('Sign out error:', error);
                                    setIsSigningOut(false);
                                }
                            }}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50 ml-2"
                        >
                            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {/* <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
                    <span className="text-sm text-blue-600 font-semibold">78%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Great progress! Keep up the momentum.</p>
            </div> */}
        </header>
    );
}

export default DashboardHeader;
