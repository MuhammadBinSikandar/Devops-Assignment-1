"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/app/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
    BookOpen,
    Clock,
    Users,
    Star,
    Play,
    Plus,
    Loader2,
    GraduationCap,
    TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user, userProfile } = useSupabase();
    const isStudent = userProfile?.role === 'STUDENT' || userProfile?.role === 'student';
    const supabase = createClient();

    useEffect(() => {
        if (user) {
            fetchCourses();
        }
    }, [user]);

    const fetchCourses = async () => {
        try {
            setLoading(true);

            // For now, we'll show sample courses since the courses table might not exist yet
            // In the future, this would fetch from the database
            const sampleCourses = [
                {
                    id: 1,
                    title: "Introduction to Machine Learning",
                    description: "Learn the fundamentals of machine learning with hands-on examples and practical applications.",
                    difficulty: "beginner",
                    duration: "4 weeks",
                    lessons: 12,
                    enrolled: 156,
                    rating: 4.8,
                    thumbnail: null,
                    progress: 0,
                    created_at: new Date().toISOString(),
                    status: "available"
                },
                {
                    id: 2,
                    title: "Advanced Python Programming",
                    description: "Master advanced Python concepts including decorators, generators, and async programming.",
                    difficulty: "advanced",
                    duration: "6 weeks",
                    lessons: 18,
                    enrolled: 89,
                    rating: 4.9,
                    thumbnail: null,
                    progress: 45,
                    created_at: new Date().toISOString(),
                    status: "in_progress"
                },
                {
                    id: 3,
                    title: "Data Science Fundamentals",
                    description: "Explore data analysis, visualization, and statistical concepts using Python and R.",
                    difficulty: "intermediate",
                    duration: "8 weeks",
                    lessons: 24,
                    enrolled: 203,
                    rating: 4.7,
                    thumbnail: null,
                    progress: 100,
                    created_at: new Date().toISOString(),
                    status: "completed"
                }
            ];

            setCourses(sampleCourses);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "beginner": return "bg-green-100 text-green-800";
            case "intermediate": return "bg-yellow-100 text-yellow-800";
            case "advanced": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "in_progress": return "bg-blue-100 text-blue-800";
            case "available": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "completed": return "Completed";
            case "in_progress": return "In Progress";
            case "available": return "Available";
            default: return "Available";
        }
    };

    if (loading) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading courses...</span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-8">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <Button onClick={fetchCourses} variant="outline">
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isStudent() ? "My Courses" : "Available Courses"}
                    </h2>
                    <p className="text-gray-600">
                        {isStudent() ? "Continue your learning journey" : "Explore courses for your child"}
                    </p>
                </div>
                {isStudent() && (
                    <Link href="/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Plus className="w-5 h-5 mr-2" />
                            Create Course
                        </Button>
                    </Link>
                )}
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                            <p className="text-gray-600 mb-6">
                                {isStudent()
                                    ? "Start your learning journey by creating your first course"
                                    : "No courses available at the moment"
                                }
                            </p>
                            {isStudent() && (
                                <Link href="/create">
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create Your First Course
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-md">
                            {/* Course Thumbnail */}
                            <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 flex items-center justify-center">
                                {course.thumbnail ? (
                                    <Image
                                        src={course.thumbnail}
                                        alt={course.title}
                                        width={400}
                                        height={192}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center space-y-2">
                                        <GraduationCap className="w-12 h-12 text-blue-600 mx-auto" />
                                        <p className="text-sm text-gray-600 font-medium">{course.title}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Header */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-semibold text-gray-900 leading-tight">{course.title}</h3>
                                        <Badge className={getDifficultyColor(course.difficulty)}>
                                            {course.difficulty}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                                </div>

                                {/* Course Stats */}
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{course.lessons} lessons</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="w-4 h-4" />
                                        <span>{course.enrolled} enrolled</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span>{course.rating}</span>
                                    </div>
                                </div>

                                {/* Progress Bar (if in progress) */}
                                {course.status === "in_progress" && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-medium text-blue-600">{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2">
                                    <Badge className={getStatusColor(course.status)}>
                                        {getStatusText(course.status)}
                                    </Badge>
                                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                        {course.status === "completed" ? (
                                            <>
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                Review
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-1" />
                                                {course.status === "in_progress" ? "Continue" : "Start"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* View All Courses Link */}
            {courses.length > 0 && (
                <div className="text-center pt-6">
                    <Link href="/dashboard/courses">
                        <Button variant="outline" className="hover:bg-gray-50">
                            View All Courses
                            <BookOpen className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
