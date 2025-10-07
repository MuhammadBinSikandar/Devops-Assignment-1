'use client'
import React, { useEffect, useCallback, useState, memo, Suspense, lazy } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { LoadingSpinner } from '@/components/ui/loading';

// Lazy load heavy components
const DashboardHeader = lazy(() => import('@/app/dashboard/_components/DashboardHeader'));
const CourseIntroCard = lazy(() => import('./_components/CourseIntroCard'));
const StudyMaterialSection = lazy(() => import('./_components/StudyMaterialSection'));
const ChapterList = lazy(() => import('./_components/ChapterList'));

const Course = memo(function Course() {
    const { courseId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use optimized auth guard hook
    const { user, userProfile, loading: supabaseLoading, isRedirecting } = useAuthGuard({
        allowedRoles: ['student', 'parent'],
        checkInterval: 30000 // Reduced from 5 seconds to 30 seconds
    });

    // Optimized course fetching with improved caching
    const getCourse = useCallback(async () => {
        if (!courseId) return;

        try {
            setLoading(true);

            // Enhanced caching with longer TTL for better performance
            const cacheKey = `course_${courseId}`;
            const cachedCourse = sessionStorage.getItem(cacheKey);
            const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
            const cacheExpiry = 10 * 60 * 1000; // 10 minutes (increased from 5)

            if (cachedCourse && cacheTimestamp) {
                const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
                if (!isExpired) {
                    setCourse(JSON.parse(cachedCourse));
                    setLoading(false);
                    return;
                }
            }

            // Fetch from API if not cached or expired
            const result = await axios.get(`/api/courses?courseId=${courseId}`, {
                timeout: 10000, // Add timeout for better UX
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            const courseData = result.data.result;
            setCourse(courseData);

            // Cache the result with error handling
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(courseData));
                sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
            } catch (cacheError) {
                // Ignore cache errors, don't break the flow
                console.warn('Failed to cache course data:', cacheError);
            }

        } catch (error) {
            console.error('Error fetching course:', error);
            // Could implement error state here
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (user && userProfile) {
            getCourse();
        }
    }, [getCourse, user, userProfile]);

    const handleBack = useCallback(() => {
        router.push('/dashboard');
    }, [router]);

    // Simplified loading states using auth guard
    if (supabaseLoading || isRedirecting) {
        return (
            <LoadingSpinner
                text="Loading Course"
                subtitle="Verifying your access..."
                variant="default"
            />
        );
    }

    if (!user || !userProfile) {
        return (
            <LoadingSpinner
                text="Verifying Access"
                subtitle="Checking your account status..."
                variant="default"
            />
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
                    <DashboardHeader />
                </Suspense>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">Loading Course...</h2>
                        <p className="text-gray-500">Please wait while we fetch your course content</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
                <DashboardHeader />
            </Suspense>
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                    <div className="space-y-8">
                        <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded" />}>
                            <CourseIntroCard course={course} />
                        </Suspense>
                        <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded" />}>
                            <StudyMaterialSection courseId={courseId} course={course} />
                        </Suspense>
                        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded" />}>
                            <ChapterList course={course} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Course;
