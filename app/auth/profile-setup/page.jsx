"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Brain, CheckCircle, Loader2 } from "lucide-react";
import { useSupabase } from '@/app/supabase-provider';
import { useRouter } from 'next/navigation';

export default function ProfileSetup() {
    const { user, userProfile, loading } = useSupabase();
    const router = useRouter();
    const [setupStage, setSetupStage] = useState('verifying');
    const [error, setError] = useState(null);

    useEffect(() => {
        let timeoutId;

        const handleProfileSetup = async () => {
            if (loading) return;

            if (!user) {
                setError('No user found. Please sign up again.');
                setTimeout(() => router.push('/auth/signup'), 3000);
                return;
            }

            setSetupStage('creating');

            // Give some time for the profile to be created/loaded
            timeoutId = setTimeout(async () => {
                try {
                    // Check if profile exists
                    const response = await fetch('/api/auth/user', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.user && data.user.role) {
                            // Check if user is suspended
                            if (data.user.isSuspended) {
                                // User is suspended, redirect to waiting page to show suspension message
                                router.push('/auth/waiting-approval');
                                return;
                            }

                            // Check if user is approved
                            if (!data.user.isApproved) {
                                // User not approved, redirect to waiting page
                                router.push('/auth/waiting-approval');
                                return;
                            }

                            setSetupStage('complete');

                            // Redirect based on role for approved users
                            setTimeout(() => {
                                if (data.user.role.toLowerCase() === 'admin') {
                                    router.push('/admin');
                                } else if (data.user.role.toLowerCase() === 'parent') {
                                    router.push('/dashboard/parent');
                                } else {
                                    router.push('/dashboard/student');
                                }
                            }, 1500);
                            return;
                        }
                    }

                    // If no profile exists, redirect to signup
                    if (response.status === 404) {
                        setError('Profile not found. Redirecting to signup...');
                        setTimeout(() => router.push('/auth/signup'), 3000);
                    } else {
                        throw new Error('Failed to verify profile');
                    }
                } catch (err) {
                    console.error('Profile setup error:', err);
                    setError('Failed to set up your profile. Redirecting to signup...');
                    setTimeout(() => router.push('/auth/signup'), 3000);
                }
            }, 2000); // Give 2 seconds for initial setup
        };

        handleProfileSetup();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user, userProfile, loading, router]);

    const getStageInfo = () => {
        switch (setupStage) {
            case 'verifying':
                return {
                    icon: <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />,
                    title: 'Verifying Account',
                    description: 'Confirming your email verification...'
                };
            case 'creating':
                return {
                    icon: <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />,
                    title: 'Setting Up Profile',
                    description: 'Creating your personalized learning profile...'
                };
            case 'complete':
                return {
                    icon: <CheckCircle className="w-8 h-8 text-green-600" />,
                    title: 'Setup Complete!',
                    description: 'Redirecting you to your dashboard...'
                };
            default:
                return {
                    icon: <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />,
                    title: 'Setting Up Profile',
                    description: 'Please wait while we prepare your account...'
                };
        }
    };

    const stageInfo = getStageInfo();

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Setup Error</h2>
                        <p className="mt-2 text-gray-600">{error}</p>
                    </div>
                </div>
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
                    <h2 className="text-3xl font-bold text-gray-900">Welcome to AI LMS</h2>
                    <p className="mt-2 text-gray-600">Getting everything ready for you</p>
                </div>

                {/* Loading Card */}
                <Card className="p-8 shadow-xl border-0">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                {stageInfo.icon}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {stageInfo.title}
                            </h3>
                            <p className="text-gray-600">
                                {stageInfo.description}
                            </p>
                        </div>

                        {/* Progress indicator */}
                        <div className="space-y-3">
                            <div className="flex justify-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${setupStage === 'verifying' ? 'bg-blue-600 animate-pulse' : setupStage === 'creating' || setupStage === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                <div className={`w-3 h-3 rounded-full ${setupStage === 'creating' ? 'bg-blue-600 animate-pulse' : setupStage === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                <div className={`w-3 h-3 rounded-full ${setupStage === 'complete' ? 'bg-green-600 animate-pulse' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className="text-xs text-gray-500">
                                This usually takes just a few seconds...
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
