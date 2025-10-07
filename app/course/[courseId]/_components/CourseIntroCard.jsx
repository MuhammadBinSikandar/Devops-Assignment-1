import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'
import { BookOpen, Clock, Target, Users, Star, Calendar, Layers } from 'lucide-react'

const difficultyColors = {
    beginner: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    advanced: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
};

function CourseIntroCard({ course }) {
    const difficultyStyle = difficultyColors[course?.difficultyLevel] || difficultyColors.intermediate;
    const chapterCount = course?.courseLayout?.chapters?.length || 0;
    const progressValue = 0; // This can be calculated based on user progress later

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                    <div className="relative">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Image src={'/knowledge.png'} alt='course' width={50} height={50} className="filter brightness-0 invert" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Badge className={`${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border} border`}>
                                {course?.difficultyLevel || 'Intermediate'}
                            </Badge>
                            <Badge className="bg-white/20 text-white border-white/30 border">
                                {course?.courseType || 'Course'}
                            </Badge>
                            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                                {course?.status || 'Ready'}
                            </Badge>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                            {course?.courseLayout?.course_title || course?.topic || 'Course Title'}
                        </h1>

                        <p className="text-white/90 text-lg leading-relaxed mb-6 max-w-4xl">
                            {course?.courseLayout?.CourseSummary || 'Course summary will appear here once the course is fully generated.'}
                        </p>

                        {/* Course Stats */}
                        <div className="flex flex-wrap gap-6 text-white/80">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5" />
                                <span className="font-medium">{chapterCount} Chapters</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span className="font-medium">~{chapterCount * 30} min read</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">Created {formatDate(course?.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progress Section */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
                                <span className="text-sm font-medium text-gray-600">{progressValue}% Complete</span>
                            </div>
                            <Progress value={progressValue} className="h-3 bg-gray-100" />
                            <p className="text-sm text-gray-500 mt-2">
                                {progressValue === 0 ? 'Ready to start your learning journey!' : `You've completed ${progressValue}% of this course`}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                <BookOpen className="w-5 h-5 mr-2" />
                                {progressValue === 0 ? 'Start Learning' : 'Continue Learning'}
                            </Button>
                        </div>
                    </div>

                    {/* Course Info Cards */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Star className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Difficulty Level</h4>
                                    <p className="text-sm text-gray-600 capitalize">{course?.difficultyLevel || 'Intermediate'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Course Type</h4>
                                    <p className="text-sm text-gray-600">{course?.courseType || 'Learning Course'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Total Content</h4>
                                    <p className="text-sm text-gray-600">{chapterCount} chapters to explore</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseIntroCard
