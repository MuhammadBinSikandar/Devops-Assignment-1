"use client";

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    GraduationCap,
    BookOpen,
    Plus,
    TrendingUp,
    Users,
    Mail,
    UserPlus,
    User,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import axios from 'axios';

const StudentDashboard = memo(function StudentDashboard() {
    // Use Supabase directly since layout handles auth
    const { user, userProfile } = useSupabase();

    const [connections, setConnections] = useState({ pendingRequests: [], acceptedConnections: [] });
    const [parentEmail, setParentEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingConnections, setFetchingConnections] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const isFetchingRef = useRef(false);
    const hasInitializedRef = useRef(false);

    // Optimized cache duration: 10 minutes for better performance
    const CACHE_DURATION = 10 * 60 * 1000;

    // Helper functions and callbacks
    const fetchConnections = useCallback(async (force = false) => {
        // Don't fetch if cache is still valid (unless forced)
        if (isFetchingRef.current) return;
        if (!force && Date.now() - lastFetchTime < CACHE_DURATION) {
            return;
        }

        try {
            isFetchingRef.current = true;
            setFetchingConnections(true);
            const response = await axios.get('/api/connections');
            setConnections(response.data);
            setLastFetchTime(Date.now());
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setFetchingConnections(false);
            isFetchingRef.current = false;
        }
    }, [lastFetchTime, CACHE_DURATION]);

    const sendConnectionRequest = useCallback(async (e) => {
        e.preventDefault();
        if (!parentEmail.trim()) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/connections', {
                targetEmail: parentEmail.trim()
            });

            toast.success(response.data.message);
            setParentEmail('');
            fetchConnections(true); // Force refresh after sending request
        } catch (error) {
            console.error('Error sending connection request:', error);
            const errorMessage = error.response?.data?.error || 'Failed to send connection request';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [parentEmail, fetchConnections]);

    const handleConnectionResponse = useCallback(async (connectionId, action) => {
        try {
            const response = await axios.patch(`/api/connections/${connectionId}`, {
                action
            });

            toast.success(response.data.message);
            fetchConnections(true); // Force refresh after action
        } catch (error) {
            console.error(`Error ${action}ing connection:`, error);
            const errorMessage = error.response?.data?.error || `Failed to ${action} connection request`;
            toast.error(errorMessage);
        }
    }, [fetchConnections]);

    // useEffect hooks
    // Fetch connections with caching
    useEffect(() => {
        if (!user) return;
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;
        fetchConnections(true);
        setIsInitialized(true);
    }, [user, fetchConnections]);

    // Only refetch if cache is expired and user is active
    useEffect(() => {
        if (!user || !isInitialized) return;

        const checkAndRefetch = () => {
            const now = Date.now();
            if (now - lastFetchTime > CACHE_DURATION) {
                fetchConnections();
            }
        };

        // Check every 5 minutes if we need to refetch for better performance
        const interval = setInterval(checkAndRefetch, 5 * 60 * 1000);

        // Refetch when user becomes active (tab focus, visibility change)
        const handleVisibilityChange = () => {
            if (!document.hidden && Date.now() - lastFetchTime > CACHE_DURATION) {
                fetchConnections();
            }
        };

        const handleFocus = () => {
            if (Date.now() - lastFetchTime > CACHE_DURATION) {
                fetchConnections();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user, isInitialized, lastFetchTime, CACHE_DURATION, fetchConnections]);

    // Check if student has a connected parent - memoized for performance
    const hasConnectedParent = useMemo(() => connections.acceptedConnections.length > 0, [connections.acceptedConnections]);

    // Layout handles auth loading, only show content-specific loading here
    if (!user || !userProfile) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {userProfile?.name || 'Student'}!
                        </h1>
                        <p className="text-gray-600">Ready to continue your learning journey?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Courses Created</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Progress</p>
                                <p className="text-2xl font-bold text-gray-900">0%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Membership</p>
                                <p className="text-2xl font-bold text-gray-900 capitalize">{userProfile?.membership_status || 'Free'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Connection Requests */}
            {connections.pendingRequests.length > 0 && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Connection Requests</h2>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchConnections(true)}
                            disabled={fetchingConnections}
                            className="flex items-center space-x-2"
                        >
                            <Clock className="w-4 h-4" />
                            {fetchingConnections ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {connections.pendingRequests.map((request) => {
                            const isRequestSender = request.requestedBy === 'student';
                            return (
                                <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {request.parentName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {isRequestSender ? `Request sent to ${request.parentName}` : `Request from ${request.parentName}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {isRequestSender ? 'Sent' : 'Received'} on {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {isRequestSender ? (
                                            // Student sent the request - show status only
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-orange-600">Pending</p>
                                                <p className="text-xs text-gray-500">Waiting for response</p>
                                            </div>
                                        ) : (
                                            // Parent sent the request - show accept/decline buttons
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleConnectionResponse(request.id, 'accept')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleConnectionResponse(request.id, 'reject')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Decline
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <div id="connect-parent" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Course Section */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Course</h2>
                    <p className="text-gray-600 mb-6">
                        Use AI to generate personalized courses tailored to your learning goals.
                    </p>
                    <Link href="/create">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Plus className="w-5 h-5 mr-2" />
                            Start Creating
                        </Button>
                    </Link>
                </Card>

                {/* Connect Parent Section or Connected Parent */}
                <Card className="p-6">
                    {hasConnectedParent ? (
                        // Show connected parent
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Connected Parent</h2>
                            {connections.acceptedConnections.map((connection) => (
                                <div key={connection.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{connection.parentName}</p>
                                            <p className="text-sm text-gray-600">{connection.parentEmail}</p>
                                            <p className="text-xs text-gray-500">
                                                Connected since {new Date(connection.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">Parent Connected</p>
                                        <p className="text-xs text-gray-500">Monitoring progress</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        // Show connection form
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Connect Parent Account</h2>
                            <p className="text-gray-600 mb-4">
                                Allow your parent to monitor your learning progress.
                            </p>

                            <form onSubmit={sendConnectionRequest} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="Parent's email address"
                                        className="pl-10"
                                        value={parentEmail}
                                        onChange={(e) => setParentEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    variant="outline"
                                    disabled={loading}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {loading ? 'Sending...' : 'Send Connection Request'}
                                </Button>
                            </form>
                        </>
                    )}
                </Card>
            </div>

            {/* Progress Analytics */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className="text-2xl font-bold text-blue-700">86%</p>
                        <p className="text-xs text-gray-500 mt-1">Across 3 active courses</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Courses Completed</p>
                        <p className="text-2xl font-bold text-green-700">1</p>
                        <p className="text-xs text-gray-500 mt-1">Out of 3 courses</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Weekly Study Time</p>
                        <p className="text-2xl font-bold text-purple-700">4.2h</p>
                        <p className="text-xs text-gray-500 mt-1">Past 7 days</p>
                    </div>
                </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity. Start creating your first course!</p>
                </div>
            </Card>
        </div>
    );
});

export default StudentDashboard;