"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Home,
    BookOpen,
    Target,
    Trophy,
    BarChart3,
    Settings,
    Users,
    Brain,
    Zap,
    Star,
    Calendar,
    Award,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabase } from '@/app/supabase-provider';

function Sidebar() {
    const { userProfile, supabase } = useSupabase();
    const pathname = usePathname();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const isStudent = (userProfile?.role || '').toString().toUpperCase() === 'STUDENT';
    const isParent = (userProfile?.role || '').toString().toUpperCase() === 'PARENT';

    const studentMenu = [
        { href: '/dashboard/student', icon: <Home className="w-5 h-5" />, label: "Dashboard" },
        { href: '/dashboard/courses', icon: <BookOpen className="w-5 h-5" />, label: "My Courses" },
        { href: '/dashboard/profile', icon: <Settings className="w-5 h-5" />, label: "Profile" },
        { href: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" />, label: "Progress Analytics" },
    ];
    const parentMenu = [
        { href: '/dashboard/parent', icon: <Home className="w-5 h-5" />, label: "Dashboard" },
        { href: '/dashboard/profile', icon: <Settings className="w-5 h-5" />, label: "Profile" },
        { href: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" />, label: "Progress Analytics" },
    ];
    const menuItems = isParent ? parentMenu : studentMenu;

    return (
        <div className="h-full bg-white/80 backdrop-blur-sm border-r border-blue-100 shadow-lg">
            {/* Logo Section */}
            <div className="p-6 border-b border-blue-100">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            AI LMS
                        </h1>
                        <p className="text-xs text-gray-500">{isParent ? 'Parent Portal' : 'Student Portal'}</p>
                    </div>
                </div>
            </div>

            {/* Student Info */}
            <div className="p-6 border-b border-blue-100">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                        👨‍🎓
                    </div>
                    <h3 className="font-semibold text-gray-800">{userProfile?.name || userProfile?.email || 'User'}</h3>
                    <p className="text-sm text-gray-600">{isParent ? 'Parent' : 'Student'}</p>
                    <Badge className="mt-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700">
                        <Star className="w-3 h-3 mr-1" />
                        Active Learner
                    </Badge>
                </div>
            </div>

            {/* Connect Parent Account / Create Course Quick Actions */}
            {isStudent && (
                <div className="p-6 border-b border-blue-100 space-y-3">
                    <Link href="/create">
                        <Button className="w-full mt-2  bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Create Course
                        </Button>
                    </Link>
                </div>
            )}

            {/* Navigation Menu */}
            <div className="flex-1 p-4">
                <nav className="space-y-2">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard/profile' && pathname?.startsWith(item.href + '/'));
                        return (
                            <Link key={index} href={item.href}>
                                <div
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 group cursor-pointer ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <Badge className={`${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                            {item.badge}
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sign Out Section */}
            <div className="p-6 border-t border-blue-100">
                <Button
                    disabled={isSigningOut}
                    onClick={async () => {
                        setIsSigningOut(true);
                        try {
                            // Clear the dashboard loaded state before signing out
                            sessionStorage.removeItem('dashboard_loaded');
                            await supabase.auth.signOut();
                            // Force redirect to homepage after sign out
                            window.location.href = '/';
                        } catch (error) {
                            console.error('Sign out error:', error);
                            setIsSigningOut(false);
                        }
                    }}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
            </div>
        </div>
    );
}

export default Sidebar;
