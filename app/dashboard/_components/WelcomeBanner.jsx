"use client";

import { useSupabase } from "@/app/supabase-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, Users, BookOpen, Star } from "lucide-react";
import Link from "next/link";

export default function WelcomeBanner() {
    const { user, userProfile } = useSupabase();
    const isStudent = userProfile?.role === 'STUDENT' || userProfile?.role === 'student';
    const isParent = userProfile?.role === 'PARENT' || userProfile?.role === 'parent';
    const isPremium = userProfile?.isMember || false;
    const isTrial = !isPremium;

    const getWelcomeMessage = () => {
        const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";
        const userName = userProfile?.name || user?.email?.split('@')[0] || "there";

        return `Good ${timeOfDay}, ${userName}!`;
    };

    const getQuickActions = () => {
        if (isStudent()) {
            return [
                {
                    title: "Create New Course",
                    description: "Build an AI-powered course",
                    icon: Brain,
                    href: "/create",
                    primary: true
                },
                {
                    title: "Browse Courses",
                    description: "Explore available courses",
                    icon: BookOpen,
                    href: "/dashboard/courses"
                },
                {
                    title: "View Progress",
                    description: "Track your learning",
                    icon: TrendingUp,
                    href: "/dashboard/student"
                }
            ];
        } else if (isParent()) {
            return [
                {
                    title: "View Children",
                    description: "Monitor child progress",
                    icon: Users,
                    href: "/dashboard/parent",
                    primary: true
                },
                {
                    title: "Browse Courses",
                    description: "See available courses",
                    icon: BookOpen,
                    href: "/dashboard/courses"
                }
            ];
        }
        return [];
    };

    const quickActions = getQuickActions();

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <Card className="p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0">
                <div className="flex items-center justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{getWelcomeMessage()}</h1>
                                <p className="text-blue-100 text-lg">
                                    {isStudent() && "Ready to create something amazing?"}
                                    {isParent() && "Keep track of your child's learning journey"}
                                </p>
                            </div>
                        </div>

                        {/* Membership Badge */}
                        <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${isPremium() ? "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30" :
                                isTrial() ? "bg-green-500/20 text-green-100 border border-green-400/30" :
                                    "bg-white/10 text-white border border-white/20"
                                }`}>
                                <Star className="w-4 h-4" />
                                <span>
                                    {isPremium() ? "Premium Member" :
                                        isTrial() ? "Trial Member" :
                                            "Free Member"}
                                </span>
                            </div>
                            {profile?.role && (
                                <div className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20 capitalize">
                                    {profile.role}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="hidden md:block">
                        <div className="relative">
                            <div className="w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
                            <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-300 animate-bounce" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
                            <Link href={action.href} className="block">
                                <div className="space-y-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.primary
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                                        : "bg-gray-100"
                                        }`}>
                                        <action.icon className={`w-6 h-6 ${action.primary ? "text-white" : "text-gray-600"
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                                        <p className="text-gray-600 text-sm">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upgrade Banner for Free Users */}
            {!isPremium() && !isTrial() && (
                <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Unlock Premium Features</h3>
                                <p className="text-gray-600 text-sm">
                                    Get unlimited courses, advanced AI features, and priority support
                                </p>
                            </div>
                        </div>
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                            Upgrade Now
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
