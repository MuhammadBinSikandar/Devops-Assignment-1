"use client";

import { useState, useEffect, Suspense } from "react";
import { useSupabase } from "@/app/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, GraduationCap, Users, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { user, userProfile, loading: authLoading, updateProfile, createProfile } = useSupabase();

    // Set initial role based on user's current role
    useEffect(() => {
        if (userProfile?.role) {
            setSelectedRole(userProfile.role.toLowerCase());
        }
    }, [userProfile]);
    const router = useRouter();
    const searchParams = useSearchParams();

    const nextPath = searchParams.get('next') || '/dashboard';

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        console.log('Selected role:', selectedRole); // Debug log

        try {
            let result;

            if (!userProfile) {
                // For users without profile, create profile with selected role
                console.log('Creating profile with role:', selectedRole.toUpperCase()); // Debug log
                result = await createProfile(user, { role: selectedRole.toUpperCase() });
            } else {
                // For existing users, update their role
                console.log('Updating profile with role:', selectedRole.toUpperCase()); // Debug log
                result = await updateProfile({ role: selectedRole.toUpperCase() });
            }

            console.log('Role submission result:', result); // Debug log

            if (result.error) throw new Error(result.error);

            // Wait for profile to be updated
            await new Promise(resolve => setTimeout(resolve, 500));

            // Force reload to ensure context is updated
            const roleStr = selectedRole.toLowerCase();
            const targetPath = roleStr === 'parent' ? '/dashboard/parent' : '/dashboard/student';

            // Use window.location for a clean redirect that resets all state
            window.location.href = targetPath;
        } catch (error) {
            console.error('Role selection error:', error); // Debug log
            setMessage(error.message || 'Failed to set role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If no user is logged in, redirect to login
        if (!user) {
            router.push('/auth/login');
            return;
        }

        // If user already has a role and this isn't a forced role selection, redirect them
        if (userProfile && userProfile.role && !searchParams.get('force') && !authLoading) {
            console.log('User already has role:', userProfile.role, 'redirecting...'); // Debug log
            const roleStr = userProfile.role.toLowerCase();
            if (roleStr === 'parent') {
                router.replace('/dashboard/parent');
            } else if (roleStr === 'student') {
                router.replace('/dashboard/student');
            }
            return; // Prevent further execution
        }
    }, [user, userProfile, router, searchParams, authLoading]);

    // Show loading if we're waiting for user data
    if (!user || authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading...</span>
            </div>
        );
    }

    // If user already has a role and this isn't forced, don't show the form
    if (userProfile && userProfile.role && !searchParams.get('force')) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Redirecting to your dashboard...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        {userProfile?.role ? 'Update Your Role' : 'Welcome to AI LMS!'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {userProfile?.role
                            ? `Current role: ${userProfile.role}. You can change it below.`
                            : 'Let us know how you plan to use the platform'
                        }
                    </p>
                </div>

                {/* Role Selection Form */}
                <Card className="p-8 shadow-xl border-0">
                    <form onSubmit={handleRoleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                I am a:
                            </label>
                            <div className="grid grid-cols-1 gap-4">
                                <div
                                    onClick={() => setSelectedRole("student")}
                                    className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-200 ${selectedRole === "student"
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <GraduationCap className={`w-8 h-8 ${selectedRole === "student" ? "text-blue-600" : "text-gray-400"
                                            }`} />
                                        <div className="flex-1">
                                            <span className={`font-medium text-lg ${selectedRole === "student" ? "text-blue-700" : "text-gray-700"
                                                }`}>
                                                Student
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Create and learn from AI-powered courses
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setSelectedRole("parent")}
                                    className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-200 ${selectedRole === "parent"
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <Users className={`w-8 h-8 ${selectedRole === "parent" ? "text-blue-600" : "text-gray-400"
                                            }`} />
                                        <div className="flex-1">
                                            <span className={`font-medium text-lg ${selectedRole === "parent" ? "text-blue-700" : "text-gray-700"
                                                }`}>
                                                Parent
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Monitor and support your child&apos;s learning progress
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                                {message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Setting up your account...
                                </>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Info */}
                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        You can change your role later in your profile settings
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RoleSelectionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RoleSelection />
        </Suspense>
    );
}
