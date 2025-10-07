"use client";

import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  RefreshCw,
  Filter,
  Plus,
  Clock,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const difficultyColors = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  advanced: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
};

const courseTypeIcons = {
  'Exam Preparation': { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Job Interview': { icon: Target, color: 'text-purple-600', bg: 'bg-purple-100' },
  'Practice Sessions': { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  'Coding Prep': { icon: Brain, color: 'text-orange-600', bg: 'bg-orange-100' },
  'Custom Learning': { icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-100' }
};

function CourseCard({ course }) {
  const IconComponent = courseTypeIcons[course.courseType]?.icon || BookOpen;
  const iconColor = courseTypeIcons[course.courseType]?.color || 'text-blue-600';
  const iconBg = courseTypeIcons[course.courseType]?.bg || 'bg-blue-100';
  const difficultyStyle = difficultyColors[course.difficultyLevel] || difficultyColors.intermediate;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getChapterCount = () => {
    return course.courseLayout?.chapters?.length || 0;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 ${iconBg} rounded-xl`}>
              <IconComponent className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border} border`}>
                {course.difficultyLevel}
              </Badge>
              <Badge variant={course.status === 'Ready' ? 'default' : 'secondary'} className="text-xs">
                {course.status || 'Generating'}
              </Badge>
            </div>
          </div>

          <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.courseLayout?.course_title || course.topic}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.courseLayout?.CourseSummary || `Comprehensive ${course.courseType.toLowerCase()} course on ${course.topic}`}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Layers className="w-4 h-4 mr-1" />
              {getChapterCount()} chapters
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(course.createdAt)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                {course.courseType}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              ID: {course.courseId?.slice(0, 8)}...
            </div>
          </div>

          {course.status === 'Ready' ? (
            <Link href={`/course/${course.courseId}`}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white group-hover:shadow-lg transition-all duration-300">
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full bg-gray-100 text-gray-500 cursor-not-allowed">
              <Clock className="w-4 h-4 mr-2 animate-pulse" />
              {course.status || 'Generating Content...'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const CourseManagement = memo(function CourseManagement() {
  const { userProfile } = useSupabase();
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper functions and callbacks
  const GetCourseList = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Check cache first
      const cacheKey = `courses_${userProfile?.email}`;
      const cachedCourses = sessionStorage.getItem(cacheKey);
      const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
      const cacheExpiry = 2 * 60 * 1000; // 2 minutes for courses (shorter since they update more frequently)

      if (!forceRefresh && cachedCourses && cacheTimestamp) {
        const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
        if (!isExpired) {
          setCourseList(JSON.parse(cachedCourses));
          setLoading(false);
          return;
        }
      }

      // Fetch from API if not cached, expired, or force refresh
      const result = await axios.post('/api/courses', {
        createdBy: userProfile?.email
      });
      console.log('Courses fetched:', result.data.result);
      const coursesData = result.data.result || [];
      setCourseList(coursesData);

      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify(coursesData));
      sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourseList([]);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.email]);

  // useEffect hooks
  useEffect(() => {
    if (userProfile?.email) {
      GetCourseList();
    }
  }, [userProfile, GetCourseList]);

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Study Materials</h1>
              <p className="text-gray-600 text-lg">
                {courseList.length > 0
                  ? `${courseList.length} course${courseList.length === 1 ? '' : 's'} in your library`
                  : 'Build your personalized learning journey'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 transition-all duration-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter & Sort
            </Button>
            <Button
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              onClick={() => GetCourseList(true)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          // Enhanced Loading Skeletons
          [...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                      <div className="w-16 h-5 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-6 bg-gray-300 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="p-6 space-y-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="w-24 h-6 bg-gray-200 rounded"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : courseList.length > 0 ? (
          // Course Cards
          courseList.map((course, index) => (
            <CourseCard course={course} key={course.id || index} />
          ))
        ) : (
          // Enhanced Empty State
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Start Learning?</h3>
            <p className="text-gray-600 mb-8 max-w-md text-lg">
              Create your first AI-powered course and begin your personalized learning journey.
              Our intelligent system will craft materials tailored just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/create">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
              <Button variant="outline" className="px-8 py-3 text-lg border-gray-200 text-gray-600 hover:bg-gray-50">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Examples
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section (when courses exist) */}
      {courseList.length > 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">{courseList.length}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {courseList.filter(c => c.status === 'Ready').length}
              </div>
              <div className="text-sm text-gray-600">Ready to Study</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {courseList.filter(c => c.status !== 'Ready').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {courseList.reduce((acc, course) => acc + (course.courseLayout?.chapters?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Chapters</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default CourseManagement;
