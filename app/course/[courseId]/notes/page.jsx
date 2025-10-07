'use client'
import React, { useEffect, useState, useCallback, Suspense } from 'react'
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText, CheckCircle, BookOpen, Clock, Trophy, Sparkles, ArrowLeft } from 'lucide-react'
import { useSupabase } from '@/app/supabase-provider';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/dashboard/_components/DashboardHeader'
import PracticeTest from '../_components/PracticeTest'

function ViewNotes() {
    const { courseId } = useParams();
    const { userProfile } = useSupabase();
    const router = useRouter();
    const [notes, setNotes] = useState(null);
    const [stepCount, setStepCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completedChapters, setCompletedChapters] = useState(new Set());
    const [completedTests, setCompletedTests] = useState(new Set());
    const [marking, setMarking] = useState(false);
    const [showPracticeTest, setShowPracticeTest] = useState(false);
    const [practiceTestChapter, setPracticeTestChapter] = useState(null);
    const [contentItems, setContentItems] = useState([]); // Combined notes and practice tests

    const GetNotes = useCallback(async () => {
        // Don't make API calls if userProfile is not loaded yet
        if (!userProfile?.id || !courseId) {
            return;
        }

        try {
            setLoading(true);
            const result = await axios.post('/api/study-type', {
                courseId: courseId,
                studyType: 'notes'
            });
            const notesData = result?.data || [];
            setNotes(notesData);

            // Create combined content items (chapter note + practice test for each chapter)
            const items = [];
            notesData.forEach((note, index) => {
                // Both notes and practice tests should now use chapterId from the database (1-indexed)
                const actualChapterId = note.chapterId;
                console.log(`Creating content for chapter ${index + 1}:`, {
                    noteChapterId: note.chapterId,
                    actualChapterId,
                    index
                });

                // Add chapter note
                items.push({
                    type: 'note',
                    chapterId: actualChapterId,
                    chapterIndex: index,
                    title: `Chapter ${actualChapterId} - Notes`,
                    data: note
                });
                // Add practice test
                items.push({
                    type: 'practice_test',
                    chapterId: actualChapterId,
                    chapterIndex: index,
                    title: `Chapter ${actualChapterId} - Practice Test`,
                    data: null // Will be loaded when needed
                });
            });
            setContentItems(items);
            setStepCount(0);
            // Prefill progress state from server
            try {
                const prog = await axios.get(`/api/course-progress?userId=${userProfile.id}&courseId=${courseId}`);
                const percentage = prog?.data?.result?.progressPercentage || 0;
                if (percentage > 0 && Array.isArray(items)) {
                    const completedCount = Math.floor((percentage / 100) * items.length);
                    const initial = new Set();
                    for (let i = 0; i < completedCount; i++) initial.add(i);
                    setCompletedChapters(initial);
                    // Place user at first incomplete item
                    const firstIncomplete = Math.min(completedCount, items.length - 1);
                    setStepCount(firstIncomplete);
                }
            } catch (error) {
                console.error('Error fetching course progress:', error);
            }
        } catch (e) {
            console.error('Error fetching notes:', e);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [courseId, userProfile?.id]);

    useEffect(() => {
        // Only call GetNotes when we have both courseId and userProfile
        if (courseId && userProfile?.id) {
            GetNotes();
        }
    }, [courseId, userProfile?.id, GetNotes]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 relative overflow-hidden">
                <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
                    <DashboardHeader />
                </Suspense>
                <div className="flex items-center justify-center">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                    <div className="relative text-center z-10">
                        <div className="relative mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Loading Your Notes
                            </h3>
                            <p className="text-gray-600 text-lg">Preparing your learning experience...</p>
                            <div className="flex items-center justify-center gap-1 mt-4">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!contentItems || contentItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 relative overflow-hidden">
                <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
                    <DashboardHeader />
                </Suspense>
                <div className="flex items-center justify-center">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative backdrop-blur-sm bg-white/80 rounded-3xl border border-white/60 shadow-2xl p-12 text-center max-w-md mx-4">
                        <div className="relative mb-6">
                            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-xl"></div>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                            No Notes Available Yet
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                            Your personalized course notes will appear here once they&apos;re generated.
                            <span className="block mt-2 text-indigo-600 font-medium">Stay tuned for an amazing learning experience! ✨</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const current = contentItems[stepCount];
    const canGoPrev = stepCount > 0;
    const canGoNext = stepCount < contentItems.length - 1;
    const isCompleted = completedChapters.has(stepCount);
    const isNextUnlocked = isCompleted;
    const progressPercentage = Math.round(((stepCount + 1) / contentItems.length) * 100);
    const completedCount = completedChapters.size;

    const enhanceHtml = (html) => {
        if (!html) return '';
        let output = html;

        // Handle LaTeX-style math blocks
        try {
            const mathBlockRegex = /<code>\s*\\\[\s*((?:.|\n)*?)\s*\\\]\s*<\/code>/g;
            output = output.replace(mathBlockRegex, (match, inner) => {
                const cleanMath = String(inner)
                    .replace(/\\begin\{bmatrix\}/g, '[')
                    .replace(/\\end\{bmatrix\}/g, ']')
                    .replace(/\\cos/g, 'cos')
                    .replace(/\\sin/g, 'sin')
                    .replace(/\\theta/g, 'θ')
                    .replace(/\\\\/g, '\n')
                    .replace(/&/g, '  ')
                    .trim();

                return `<div class="my-8 p-8 rounded-2xl bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 border border-blue-200/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div class="absolute top-4 right-4 text-blue-400/30 transform rotate-12">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="font-mono text-center text-xl text-gray-800 whitespace-pre-line leading-relaxed relative z-10">${cleanMath}</div>
                </div>`;
            });
        } catch (e) {
            console.warn('Math block processing error:', e);
        }

        // Enhanced inline code
        try {
            output = output.replace(/<code>([^\\]*?)<\/code>/g, (match, code) => {
                const cleaned = String(code).trim();
                return `<code class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200/80 font-mono text-sm text-gray-800 shadow-sm">${cleaned}</code>`;
            });
        } catch (e) {
            console.warn('Inline code processing error:', e);
        }

        // Stunning chapter titles with animated elements
        output = output.replaceAll('<h3>', `<div class="mb-12 text-center relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-3xl blur-3xl transform scale-150"></div>
            <h3 class="relative text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">`)
            .replaceAll('</h3>', `</h3>
            <div class="flex items-center justify-center gap-2 mb-4">
                <div class="w-16 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent rounded-full"></div>
                <div class="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg"></div>
                <div class="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent rounded-full"></div>
            </div>
            <div class="w-24 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full mx-auto shadow-lg"></div>
        </div>`);

        // Beautiful section headings
        output = output.replaceAll('<h4>', `<div class="mt-10 mb-6 relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl transform -skew-y-1 group-hover:skew-y-0 transition-transform duration-300"></div>
            <h4 class="relative text-2xl font-bold text-gray-900 flex items-center gap-3 p-4">
                <div class="flex items-center gap-2">
                    <div class="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full shadow-lg"></div>
                    <div class="w-2 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                </div>`)
            .replaceAll('</h4>', `</h4></div>`);

        // Enhanced paragraphs with better typography
        output = output.replaceAll('<p>', '<p class="text-gray-700 leading-relaxed mb-6 text-lg font-light tracking-wide">');

        // Stunning list containers
        output = output.replaceAll('<ul>', `<div class="relative my-8 group">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 rounded-2xl shadow-inner"></div>
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/60 to-indigo-600/60 rounded-t-2xl"></div>
            <ul class="relative space-y-4 p-8">`)
            .replaceAll('</ul>', '</ul></div>')
            .replaceAll('<li>', `<li class="flex items-start gap-4 text-gray-700 text-lg group/item hover:text-gray-900 transition-colors duration-200">
                <div class="relative mt-2 shrink-0">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg group-hover/item:scale-110 transition-transform duration-200"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-full blur-sm group-hover/item:blur-md transition-all duration-200"></div>
                </div>
                <span class="leading-relaxed">`)
            .replaceAll('</li>', '</span></li>');

        // Enhanced strong text
        output = output.replaceAll('<strong>', '<strong class="text-gray-900 font-semibold bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-2 py-0.5 rounded-md">');

        // Better subscripts
        output = output.replaceAll('<sub>', '<sub class="text-sm font-medium">');

        return output;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Natural header bar - like a modern reading app */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left side - Back navigation */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/course/${courseId}`)}
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Course
                            </Button>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <BookOpen className="w-4 h-4" />
                                {current?.title || `Item ${stepCount + 1} of ${contentItems.length}`}
                            </div>
                        </div>

                        {/* Right side - Progress indicator */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">{progressPercentage}% Complete</div>
                                <div className="text-xs text-gray-500">{completedCount}/{contentItems.length} items</div>
                            </div>
                            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main reading area - clean and focused */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Content progress dots - subtle and elegant */}
                <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                    {contentItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => completedChapters.has(index) && setStepCount(index)}
                            disabled={!completedChapters.has(index) && index !== stepCount}
                            className={`transition-all duration-200 ${item.type === 'note'
                                ? 'w-2 h-2 rounded-full'
                                : 'w-2 h-2 rounded-sm'
                                } ${completedChapters.has(index)
                                    ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                                    : index === stepCount
                                        ? 'bg-blue-500 w-3 h-3'
                                        : 'bg-gray-300'
                                }`}
                            title={`${item.title}${completedChapters.has(index) ? ' (Completed)' : index === stepCount ? ' (Current)' : ''}`}
                        />
                    ))}
                </div>

                {/* Content card - clean and readable */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                    <div className="p-8 md:p-12">
                        {/* Content */}
                        {current?.type === 'note' ? (
                            <div className="prose prose-lg prose-gray max-w-none">
                                <div
                                    className="text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: enhanceHtml((current?.data?.notes || '').replace(/\n/g, '<br />'))
                                    }}
                                />
                            </div>
                        ) : current?.type === 'practice_test' ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Chapter {current.chapterId} Practice Test
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    Test your understanding of the concepts covered in this chapter with a comprehensive practice test.
                                </p>
                                <Button
                                    onClick={() => {
                                        console.log('Starting practice test for:', {
                                            currentItem: current,
                                            chapterId: current.chapterId,
                                            chapterIndex: current.chapterIndex
                                        });
                                        setPracticeTestChapter(current.chapterId);
                                        setShowPracticeTest(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                                >
                                    Start Practice Test
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Navigation and actions - clean floating footer */}
                <div className="sticky bottom-4">
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-lg p-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Previous button */}
                            <Button
                                variant="outline"
                                disabled={!canGoPrev}
                                onClick={() => canGoPrev && setStepCount(stepCount - 1)}
                                className="flex-1 max-w-[200px]"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>

                            {/* Center action */}
                            <div className="flex-1 flex justify-center">
                                {isCompleted ? (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Completed</span>
                                    </div>
                                ) : (
                                    <Button
                                        disabled={marking || !userProfile?.id}
                                        onClick={async () => {
                                            if (!userProfile?.id) {
                                                console.error('User profile not loaded');
                                                return;
                                            }

                                            const total = contentItems.length;
                                            const percent = Math.round(((stepCount + 1) / total) * 100);
                                            try {
                                                setMarking(true);
                                                await axios.post('/api/course-progress', {
                                                    userId: userProfile.id,
                                                    courseId,
                                                    chapterId: current?.chapterId ?? current?.chapterIndex + 1,
                                                    progressPercentage: percent
                                                });
                                                setCompletedChapters(prev => {
                                                    const next = new Set(prev);
                                                    next.add(stepCount);
                                                    return next;
                                                });

                                                // For practice tests, mark as completed immediately
                                                if (current?.type === 'practice_test') {
                                                    setCompletedTests(prev => {
                                                        const next = new Set(prev);
                                                        next.add(current.chapterId);
                                                        return next;
                                                    });
                                                }
                                            } catch (e) {
                                                // ignore
                                            } finally {
                                                setMarking(false);
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {marking ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Marking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Mark Complete
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* Next button */}
                            <Button
                                disabled={!canGoNext || !isCompleted}
                                onClick={() => (canGoNext && isCompleted) && setStepCount(stepCount + 1)}
                                className="flex-1 max-w-[200px] bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {canGoNext ? (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </>
                                ) : (
                                    <>🎉 Complete!</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Course completion celebration */}
                {!canGoNext && completedChapters.size === contentItems.length && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                            <p className="text-gray-600 mb-6">You&apos;ve successfully completed all chapters in this course.</p>
                            <Button
                                onClick={() => router.push(`/course/${courseId}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Back to Course
                            </Button>
                        </div>
                    </div>
                )}

                {/* Practice Test Modal */}
                {showPracticeTest && practiceTestChapter && userProfile?.id && (
                    <PracticeTest
                        courseId={courseId}
                        chapterId={practiceTestChapter}
                        userId={userProfile.id}
                        onTestComplete={() => {
                            console.log('Practice test completed for chapter:', practiceTestChapter);
                            // Mark the current practice test step as completed
                            setCompletedChapters(prev => {
                                const next = new Set(prev);
                                next.add(stepCount);
                                return next;
                            });
                            setCompletedTests(prev => {
                                const next = new Set(prev);
                                next.add(practiceTestChapter);
                                return next;
                            });
                        }}
                        onClose={() => {
                            setShowPracticeTest(false);
                            setPracticeTestChapter(null);
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default ViewNotes