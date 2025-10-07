"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Brain, Clock, Shield, CheckCircle, Ban, AlertTriangle, RefreshCw } from "lucide-react";
import { useSupabase } from '@/app/supabase-provider';
import { useRouter } from 'next/navigation';

export default function WaitingApproval() {
    const { user, userProfile, loading } = useSupabase();
    const router = useRouter();
    const hasRedirectedRef = useRef(false);
    const statusIntervalRef = useRef(null);

    // Force refresh user profile
    const clearLocalCaches = () => {
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('dashboard_loaded');
                localStorage.removeItem('profile_cache_v1');
            }
        } catch (_) { }
    };

    // Removed refresh logic and any redirect-to-dashboard behavior

    const clearAllAndRedirectToLogin = async () => {
        try {
            // Clear ALL storage completely
            if (typeof window !== 'undefined') {
                // Session storage cleanup
                try { sessionStorage.removeItem('dashboard_loaded'); } catch (_) { }
                try { sessionStorage.removeItem('phantom.contentScript.providerInjectionOptions.v3'); } catch (_) { }
                try { sessionStorage.removeItem('bis_data'); } catch (_) { }
                try { sessionStorage.clear(); } catch (_) { }

                // Local storage cleanup
                try { localStorage.removeItem('profile_cache_v1'); } catch (_) { }
                try { localStorage.clear(); } catch (_) { }
            }

            // Clear any intervals
            if (statusIntervalRef.current) {
                clearInterval(statusIntervalRef.current);
                statusIntervalRef.current = null;
            }

            // Sign out to clear auth session; no other API calls
            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
            } catch (signOutError) {
                console.error('Error signing out:', signOutError);
            }

            window.location.href = '/auth/login';

        } catch (error) {
            console.error('Error clearing cache and sessions:', error);
            // Force hard refresh even if clearing fails
            window.location.href = '/auth/login';
        }
    };

    useEffect(() => {
        if (loading || hasRedirectedRef.current) return;
        if (!user) {
            router.replace('/auth/login');
            return;
        }
        // No auto-redirects to dashboard from this page
    }, [loading, user, router]);

    // Removed all polling and API fetching; this page will not auto-redirect to dashboard

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
                    <p className="text-gray-500">Please wait...</p>
                </div>
            </div>
        );
    }

    const isSuspended = userProfile?.isSuspended;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isSuspended
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : "bg-gradient-to-r from-amber-500 to-orange-600"
                            }`}>
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        {isSuspended ? "Account Suspended" : "Account Verification"}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {isSuspended
                            ? "Your account has been suspended by our administrators"
                            : "Your account is being reviewed by our team"
                        }
                    </p>
                </div>

                {/* Status Card */}
                <Card className="p-8 shadow-xl border-0">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isSuspended ? "bg-red-100" : "bg-amber-100"
                                }`}>
                                {isSuspended ? (
                                    <Ban className="w-8 h-8 text-red-600" />
                                ) : (
                                    <Clock className="w-8 h-8 text-amber-600" />
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {isSuspended ? "Account Suspended" : "Waiting for Admin Approval"}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {isSuspended ? (
                                    <>
                                        Your account has been suspended by our administrators.
                                        {userProfile?.suspensionReason && (
                                            <>
                                                <br /><br />
                                                <strong>Reason:</strong> {userProfile.suspensionReason}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    "Thank you for signing up! Your account has been created successfully and is now pending approval from our administrators."
                                )}
                            </p>
                            <div className="text-sm text-gray-500 space-y-2">
                                <p>✅ Email verified successfully</p>
                                <p>{isSuspended ? "🚫 Account suspended" : "⏳ Admin approval pending"}</p>
                                <p>🔐 Account security confirmed</p>
                            </div>
                        </div>

                        {/* Information Section */}
                        <div className={`p-4 rounded-lg border ${isSuspended ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                            }`}>
                            <div className="flex items-center justify-center mb-2">
                                {isSuspended ? (
                                    <>
                                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                                        <span className="text-sm font-medium text-red-800">Account Status</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5 text-blue-600 mr-2" />
                                        <span className="text-sm font-medium text-blue-800">Enhanced Security</span>
                                    </>
                                )}
                            </div>
                            <p className={`text-xs ${isSuspended ? "text-red-700" : "text-blue-700"
                                }`}>
                                {isSuspended
                                    ? "Your account access has been restricted. Contact support if you believe this is an error."
                                    : "We manually review all new accounts to ensure the safety and quality of our platform."
                                }
                            </p>
                        </div>

                        {/* Status Indicator */}
                        {!isSuspended && (
                            <div className="space-y-3">
                                <div className="flex justify-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Email Verified → Admin Review → Access Granted
                                </div>
                            </div>
                        )}

                        {/* What's Next */}
                        <div className="text-left bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                {isSuspended ? (
                                    <>
                                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                                        What does this mean?
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                        What happens next?
                                    </>
                                )}
                            </h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                {isSuspended ? (
                                    <>
                                        <li>• Your account has been temporarily suspended</li>
                                        <li>• You cannot access platform features at this time</li>
                                        <li>• Contact support to appeal this decision</li>
                                        <li>• Review our terms of service for more information</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Our team will review your account within 24 hours</li>
                                        <li>• You&apos;ll receive an email notification once approved</li>
                                        <li>• This page will automatically redirect when ready</li>
                                        <li>• You can safely close this page and return later</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={clearAllAndRedirectToLogin}
                                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Check Status
                            </button>
                        </div>


                    </div>
                </Card>

                {/* Contact Support */}
                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        Need help?{" "}
                        <button
                            onClick={() => window.location.href = 'mailto:support@ailms.com'}
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            Contact Support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}