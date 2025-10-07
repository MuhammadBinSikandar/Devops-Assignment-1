import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock } from 'lucide-react'

function ChapterList({ course }) {
    const Chapters = course?.courseLayout?.chapters;

    if (!Chapters || Chapters.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Chapters Available</h3>
                    <p className="text-gray-500">Course content is still being generated. Please check back soon!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Course Chapters</h2>
                    <p className="text-gray-600">{Chapters.length} chapters • Comprehensive learning path</p>
                </div>
                <div className="ml-auto">
                    <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200">
                        {Chapters.length} Chapters
                    </Badge>
                </div>
            </div>

            <div className="space-y-4">
                {Chapters.map((chapter, index) => {
                    const estimatedTime = Math.floor(Math.random() * 30) + 15; // Random time between 15-45 mins

                    return (
                        <div
                            key={index}
                            className="group relative bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex items-start gap-6">
                                {/* Chapter number and emoji */}
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                        {chapter?.emoji || (index + 1)}
                                    </div>
                                </div>

                                {/* Chapter content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                Chapter {index + 1}: {chapter?.ChapterTitle}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            <span>~{estimatedTime} min</span>
                                        </div>
                                    </div>

                                    <p className="text-sm leading-relaxed mb-4 text-gray-600">
                                        {chapter?.ChapterSummary}
                                    </p>

                                    {/* Topics preview */}
                                    {chapter?.topics && chapter.topics.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-gray-500 mb-2">
                                                Key Topics ({chapter.topics.length}):
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {chapter.topics.slice(0, 3).map((topic, topicIndex) => (
                                                    <Badge
                                                        key={topicIndex}
                                                        variant="outline"
                                                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                        {topic.topic}
                                                    </Badge>
                                                ))}
                                                {chapter.topics.length > 3 && (
                                                    <Badge variant="outline" className="text-xs text-gray-500">
                                                        +{chapter.topics.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action button */}
                                    {/* <div className="flex items-center justify-between">
                                        <Button
                                            disabled={isLocked}
                                            className={`${isCompleted
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                                : isLocked
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                                } text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                                        >
                                            {isCompleted ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Review Chapter
                                                </>
                                            ) : isLocked ? (
                                                <>
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Complete Previous Chapter
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    Start Chapter
                                                </>
                                            )}
                                        </Button>

                                        {!isLocked && (
                                            <div className="text-xs text-gray-500">
                                                Chapter {index + 1} of {Chapters.length}
                                            </div>
                                        )}
                                    </div> */}
                                </div>
                            </div>

                            {/* Progress bar for current chapter */}
                            {/* {!isLocked && !isCompleted && index === 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-gray-600">Progress</span>
                                        <span className="text-xs text-gray-500">0% complete</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default ChapterList
