// app/course/[courseId]/flashcard/_components/FlashcardItem.jsx
import React from 'react'
import ReactCardFlip from 'react-card-flip';
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

function FlashcardItem({ card, currentIndex, total, isFlipped, handleClick, nextCard, prevCard }) {
    if (!card) return null;

    const isFirstCard = currentIndex === 0;
    const isLastCard = currentIndex === total - 1;
    const progressPercentage = ((currentIndex + 1) / total) * 100;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Enhanced Progress indicator */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-gray-700">Card {currentIndex + 1} of {total}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{Math.round(progressPercentage)}% Complete</span>
                    </div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Enhanced Flashcard */}
            <div className="perspective-1000 mb-8">
                <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                    {/* Front */}
                    <div
                        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-10 min-h-[400px] flex flex-col justify-center cursor-pointer hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group"
                        onClick={handleClick}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <Lightbulb className="w-8 h-8 text-white" />
                            </div>
                            <div className="mb-4">
                                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">Question</span>
                            </div>
                            <p className="text-xl text-gray-800 leading-relaxed font-medium mb-8">{card.front}</p>
                            <div className="flex items-center justify-center text-gray-500 group-hover:text-purple-600 transition-colors">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Click to reveal answer</span>
                            </div>
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="bg-gradient-to-br from-emerald-50/80 to-teal-100/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-10 min-h-[400px] flex flex-col justify-center cursor-pointer hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group"
                        onClick={handleClick}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <div className="mb-4">
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">Answer</span>
                            </div>
                            <p className="text-xl text-gray-800 leading-relaxed font-medium mb-8">{card.back}</p>
                            <div className="flex items-center justify-center text-gray-500 group-hover:text-emerald-600 transition-colors">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Click to see question</span>
                            </div>
                        </div>
                    </div>
                </ReactCardFlip>
            </div>

            {/* Enhanced Navigation */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex justify-between items-center">
                    <Button
                        onClick={prevCard}
                        variant="outline"
                        disabled={isFirstCard}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isFirstCard
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-purple-50 hover:border-purple-300 hover:shadow-md hover:scale-105'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Previous
                    </Button>

                    <Button
                        onClick={handleClick}
                        className="mx-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Flip Card
                    </Button>

                    <Button
                        onClick={nextCard}
                        disabled={isLastCard}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLastCard
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            }`}
                    >
                        Next
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>

                {/* Card indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: total }, (_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-gradient-to-r from-purple-500 to-blue-600 w-8'
                                : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FlashcardItem
