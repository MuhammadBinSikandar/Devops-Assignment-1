// app/course/[courseId]/flashcards/page.jsx

"use client"
import React, { useEffect, useCallback, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Brain, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/app/dashboard/_components/DashboardHeader'
import FlashcardItem from './_components/FlashcardItem'

function Flashcards() {
    const { courseId } = useParams();
    const router = useRouter();
    const [flashcards, setFlashcards] = React.useState([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isFlipped, setIsFlipped] = React.useState(false);

    const GetFlashcards = useCallback(async () => {
        const result = await fetch('/api/study-type', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courseId: courseId,
                studyType: 'flashcard'
            }),
        });
        const data = await result.json();
        setFlashcards(data);
        console.log(data);
    }, [courseId]);

    useEffect(() => {
        GetFlashcards();
    }, [GetFlashcards]);

    const handleClick = useCallback(() => {
        setIsFlipped(!isFlipped);
    }, [isFlipped]);

    const flashcardData = React.useMemo(() => flashcards[0]?.content || [], [flashcards]);
    const currentCard = flashcardData[currentIndex];

    const nextCard = useCallback(() => {
        setCurrentIndex((prev) => {
            const data = flashcards[0]?.content || [];
            return data.length > 0 ? (prev + 1) % data.length : prev;
        });
        setIsFlipped(false);
    }, [flashcards]);

    const prevCard = useCallback(() => {
        setCurrentIndex((prev) => {
            const data = flashcards[0]?.content || [];
            return data.length > 0 ? (prev - 1 + data.length) % data.length : prev;
        });
        setIsFlipped(false);
    }, [flashcards]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
            <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
                <DashboardHeader />
            </Suspense>

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4 py-8">
                {/* Header with back button */}
                <div className="flex items-center mb-8">
                    <Button
                        onClick={() => router.push(`/course/${courseId}`)}
                        variant="ghost"
                        className="mr-4 hover:bg-white/50 transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Course
                    </Button>
                </div>

                <div className="text-center mb-12">
                    <div className="flex justify-center items-center mb-4">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-3 rounded-2xl mr-3">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h1 className='font-bold text-4xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>Flashcards</h1>
                        <Sparkles className="w-6 h-6 text-yellow-500 ml-3 animate-pulse" />
                    </div>
                    <p className='text-lg text-gray-600 font-medium'>Master concepts through active recall and spaced repetition</p>
                </div>

                {flashcardData.length > 0 ? (
                    <FlashcardItem
                        card={currentCard}
                        courseId={courseId}
                        currentIndex={currentIndex}
                        total={flashcardData.length}
                        isFlipped={isFlipped}
                        handleClick={handleClick}
                        nextCard={nextCard}
                        prevCard={prevCard}
                    />
                ) : (
                    <div className="text-center">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-white/20 shadow-xl">
                            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl text-gray-600">No flashcards available</p>
                            <p className="text-gray-500 mt-2">Generate some flashcards to start studying!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Flashcards
