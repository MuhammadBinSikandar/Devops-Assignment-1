"use client";

import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { useConnections } from '@/lib/hooks/useConnections';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, TrendingUp, Clock, BarChart3, Award, Users, Plus, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const AnalyticsPage = memo(function AnalyticsPage() {
    const { userProfile, loading: supabaseLoading } = useSupabase();
    const { getConnectedStudents, loading: connectionsLoading, error: connectionsError } = useConnections();

    // Get real connected students for parents
    const connectedStudents = getConnectedStudents();
    const isParent = userProfile?.role?.toLowerCase() === 'parent';

    // Static analytics data
    const role = (userProfile?.role || '').toString().toUpperCase();

    // Static KPI data
    const staticKpis = isParent ? {
        averageScore: '82%',
        coursesCompleted: '3',
        weeklyStudyTime: '7.5h',
        totalCourses: '7'
    } : {
        averageScore: '86%',
        coursesCompleted: '1',
        weeklyStudyTime: '4.2h',
        totalCourses: '3'
    };

    // Static courses data
    const staticChildCourses = [
        {
            title: 'Advanced Python Programming',
            progress: 45,
            status: 'In Progress',
            color: 'blue'
        },
        {
            title: 'Data Science Fundamentals',
            progress: 100,
            status: 'Completed',
            color: 'green'
        }
    ];

    const staticCourses = [
        { title: 'Intro to ML', progress: 0, status: 'Available' },
        { title: 'Advanced Python', progress: 45, status: 'In Progress' },
        { title: 'Data Science', progress: 100, status: 'Completed' }
    ];

    // Static engagement data
    const staticEngagement = {
        activeDays: '5/7',
        quizzesTaken: '8',
        averageSession: '38m',
        peers: '12'
    };

    // Use real connected students or fallback to static data
    const children = connectedStudents.length > 0 ? connectedStudents.map((student, index) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        age: 12 + index, // Fallback age
        grade: `${6 + index}th Grade` // Fallback grade
    })) : [];

    // Fallback static children for demo purposes (only when no real connections)
    const fallbackChildren = [
        { id: '1', name: 'Alex Johnson', age: 12, grade: '6th Grade', email: 'alex@example.com' },
        { id: '2', name: 'Sarah Johnson', age: 15, grade: '9th Grade', email: 'sarah@example.com' },
        { id: '3', name: 'Mike Johnson', age: 8, grade: '3rd Grade', email: 'mike@example.com' }
    ];

    // Use real children if available, otherwise use fallback for demo
    const displayChildren = children.length > 0 ? children : fallbackChildren;

    const [selectedChildId, setSelectedChildId] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const selectedChild = displayChildren.find(child => child.id === selectedChildId);

    // Reduce loading delay and optimize loading
    useEffect(() => {
        if (!supabaseLoading && userProfile) {
            // Check if we have cached data to reduce loading time
            const hasCache = sessionStorage.getItem(`connections_${userProfile.id}`);
            const loadingDelay = hasCache ? 500 : 1000; // Shorter delay if we have cached data

            const timer = setTimeout(() => {
                setPageLoading(false);
            }, loadingDelay);

            return () => clearTimeout(timer);
        }
    }, [supabaseLoading, userProfile]);

    // Update selected child when children data changes
    useEffect(() => {
        if (displayChildren.length > 0) {
            // If no child is selected or the selected child doesn't exist in the list
            if (!selectedChildId || !displayChildren.find(child => child.id === selectedChildId)) {
                setSelectedChildId(displayChildren[0].id);
            }
        }
    }, [displayChildren, selectedChildId]);

    // Show loader while page is loading
    if (pageLoading || supabaseLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Analytics Dashboard</h2>
                    <p className="text-gray-500">Preparing your personalized insights...</p>
                </div>
            </div>
        );
    }

    // Show error state for connections
    if (connectionsError && isParent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Connections</h2>
                    <p className="text-gray-500 mb-4">{connectionsError}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    // Show loading state for connections
    if (isParent && connectionsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Connections</h2>
                    <p className="text-gray-500">Fetching your connected students...</p>
                </div>
            </div>
        );
    }

    // Show no children message for parents
    if (isParent && children.length === 0 && !connectionsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No Connected Students</h2>
                    <p className="text-gray-500 mb-4">You don&apos;t have any connected student accounts yet.</p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Progress Analytics</h1>
                        <p className="text-gray-600 mt-1">
                            {isParent
                                ? `Overview of ${selectedChild?.name || 'your child'}'s learning progress`
                                : 'Insights about your learning performance'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {isParent && displayChildren.length > 0 && (
                            <>
                                {/* Child Selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Select Child:</span>
                                    <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Choose a child" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {displayChildren.map((child) => (
                                                <SelectItem key={child.id} value={child.id}>
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="w-4 h-4 text-blue-600" />
                                                        <span>{child.name}</span>
                                                        <span className="text-xs text-gray-500">({child.grade})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Create Course Button */}
                                <Link href={`/create?studentId=${selectedChild?.id}&studentEmail=${encodeURIComponent(selectedChild?.email)}&studentName=${encodeURIComponent(selectedChild?.name)}`}>
                                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Course for {selectedChild?.name}
                                    </Button>
                                </Link>
                            </>
                        )}

                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                        </Badge>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Average Score</div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <div className="text-3xl font-bold text-blue-700">{staticKpis.averageScore}</div>
                        <span className="text-xs text-green-600">+3% this week</span>
                    </div>
                    <div className="mt-4 h-2 bg-blue-100 rounded-full">
                        <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: staticKpis.averageScore }} />
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Courses Completed</div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="text-3xl font-bold text-green-700">{staticKpis.coursesCompleted}</div>
                        <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">Out of {staticKpis.totalCourses} courses</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Weekly Study Time</div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="text-3xl font-bold text-purple-700">{staticKpis.weeklyStudyTime}</div>
                        <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">Past 7 days</div>
                </Card>
            </div>

            {/* Child-Specific Information for Parents */}
            {isParent && selectedChild && (
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{selectedChild.name}</h2>
                            <p className="text-gray-600">{selectedChild.grade} • {selectedChild.age} years old</p>
                            <p className="text-sm text-gray-500">{selectedChild.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600">Learning Style</div>
                            <div className="text-lg font-semibold text-blue-700 mt-1">
                                {selectedChild.id === '1' ? 'Visual Learner' : selectedChild.id === '2' ? 'Auditory Learner' : 'Kinesthetic Learner'}
                            </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-sm text-gray-600">Favorite Subject</div>
                            <div className="text-lg font-semibold text-green-700 mt-1">
                                {selectedChild.id === '1' ? 'Mathematics' : selectedChild.id === '2' ? 'Science' : 'Art & Creativity'}
                            </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="text-sm text-gray-600">Study Time</div>
                            <div className="text-lg font-semibold text-purple-700 mt-1">
                                {selectedChild.id === '1' ? '45 min/day' : selectedChild.id === '2' ? '1.5 hours/day' : '30 min/day'}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Detail Sections */}
            {isParent && selectedChild ? (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">{selectedChild.name}&apos;s Courses</h2>
                        <Badge variant="outline" className="text-blue-700 border-blue-200">
                            {selectedChild.grade} • {selectedChild.age} years old
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {staticChildCourses.map((course, idx) => (
                            <div key={idx} className={`p-4 bg-${course.color}-50 rounded-lg border border-${course.color}-100`}>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-gray-900">{course.title}</div>
                                    <Badge className={course.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}>
                                        {course.status}
                                    </Badge>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">Progress</div>
                                <div className="mt-1 h-2 bg-white rounded-full">
                                    <div className={`h-2 rounded-full ${course.status === 'Completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                                        style={{ width: `${course.progress}%` }} />
                                </div>
                                <div className="mt-2 text-xs text-gray-500">{course.progress}% completed</div>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
                        <Button variant="outline" className="text-blue-700 border-blue-200">
                            <BookOpen className="w-4 h-4 mr-2" /> View All
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {staticCourses.map((course, idx) => (
                            <div key={idx} className="p-4 rounded-lg border bg-gradient-to-br from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-gray-900">{course.title}</div>
                                    <Badge variant="outline" className="text-gray-700 border-gray-200">
                                        {course.status}
                                    </Badge>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">Progress</div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                                    <div className={`h-2 rounded-full ${course.progress === 100 ? 'bg-green-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`} style={{ width: `${course.progress}%` }} />
                                </div>
                                <div className="mt-2 text-xs text-gray-500">{course.progress}%</div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Engagement */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600">Active Days</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{staticEngagement.activeDays}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600">Quizzes Taken</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{staticEngagement.quizzesTaken}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600">Average Session</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{staticEngagement.averageSession}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600">Peers</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-1">
                            <Users className="w-5 h-5 text-blue-600" /> {staticEngagement.peers}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
});

export default AnalyticsPage;
