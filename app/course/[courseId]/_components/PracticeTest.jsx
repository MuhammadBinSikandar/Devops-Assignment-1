'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, FileText, AlertCircle, ChevronRight, ChevronLeft, Save, Timer, X } from 'lucide-react';
import axios from 'axios';

// Constants
const QUESTION_TYPES = {
    MCQ: 'mcq',
    TRUE_FALSE: 'true_false',
    DESCRIPTIVE: 'descriptive'
};

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Memoized Question Components
const MCQQuestion = React.memo(({ question, userAnswer, onAnswerChange }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4" id={`question-${question.id}`}>
            {question.question}
        </h3>
        <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${question.id}`}>
            {question.options.map((option, index) => (
                <label
                    key={index}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${userAnswer === index
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={index}
                        checked={userAnswer === index}
                        onChange={() => onAnswerChange(question.id, index)}
                        className="sr-only"
                        aria-describedby={`option-${question.id}-${index}`}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${userAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                        }`}>
                        {userAnswer === index && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                    </div>
                    <span className="text-gray-700" id={`option-${question.id}-${index}`}>
                        {option}
                    </span>
                </label>
            ))}
        </div>
    </div>
));

const TrueFalseQuestion = React.memo(({ question, userAnswer, onAnswerChange }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4" id={`question-${question.id}`}>
            {question.question}
        </h3>
        <div className="flex gap-4" role="radiogroup" aria-labelledby={`question-${question.id}`}>
            {[true, false].map((option) => (
                <label
                    key={option.toString()}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 hover:shadow-sm ${userAnswer === option
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.toString()}
                        checked={userAnswer === option}
                        onChange={() => onAnswerChange(question.id, option)}
                        className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${userAnswer === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                        }`}>
                        {userAnswer === option && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                    </div>
                    <span className="text-gray-700 font-medium">
                        {option ? 'True' : 'False'}
                    </span>
                </label>
            ))}
        </div>
    </div>
));

const DescriptiveQuestion = React.memo(({ question, userAnswer, onAnswerChange }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4" id={`question-${question.id}`}>
            {question.question}
        </h3>
        <textarea
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder="Write your answer here..."
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none transition-colors"
            aria-labelledby={`question-${question.id}`}
            aria-describedby={`points-${question.id}`}
        />
        <div className="text-sm text-gray-500" id={`points-${question.id}`}>
            Points: {question.points}
        </div>
    </div>
));

// Timer Component
const TestTimer = React.memo(({ startTime }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <Timer className="w-4 h-4" />
            <span>{formatTime(elapsed)}</span>
        </div>
    );
});

// Progress Indicator Component
const ProgressIndicator = React.memo(({ current, total, answered }) => {
    const percentage = (answered / total) * 100;

    return (
        <div className="text-right">
            <div className="text-sm font-medium text-gray-900 mb-1">
                {answered}/{total} answered
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={answered}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-label={`${answered} of ${total} questions answered`}
                />
            </div>
        </div>
    );
});

// Question Navigation Component
const QuestionNavigation = React.memo(({ questions, currentIndex, userAnswers, onQuestionSelect }) => (
    <div className="flex gap-2 max-w-md overflow-x-auto py-2">
        {questions.map((question, index) => (
            <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all flex-shrink-0 ${index === currentIndex
                    ? 'bg-blue-600 text-white shadow-lg'
                    : userAnswers[question.id] !== undefined
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                aria-label={`Go to question ${index + 1}${userAnswers[question.id] !== undefined ? ' (answered)' : ''}`}
            >
                {index + 1}
            </button>
        ))}
    </div>
));

// Set display names for debugging
MCQQuestion.displayName = 'MCQQuestion';
TrueFalseQuestion.displayName = 'TrueFalseQuestion';
DescriptiveQuestion.displayName = 'DescriptiveQuestion';
TestTimer.displayName = 'TestTimer';
ProgressIndicator.displayName = 'ProgressIndicator';
QuestionNavigation.displayName = 'QuestionNavigation';

const PracticeTest = ({ courseId, chapterId, userId, onTestComplete, onClose }) => {
    const [practiceTest, setPracticeTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [startTime] = useState(Date.now());
    const [showResults, setShowResults] = useState(false);

    const autoSaveTimerRef = useRef(null);
    const modalRef = useRef(null);

    // Memoized calculations
    const testStats = useMemo(() => {
        if (!practiceTest?.questions) return { total: 0, answered: 0, percentage: 0 };

        const total = practiceTest.questions.length;
        const answered = Object.keys(userAnswers).length;
        const percentage = total > 0 ? (answered / total) * 100 : 0;

        return { total, answered, percentage };
    }, [practiceTest?.questions, userAnswers]);

    const currentQuestion = useMemo(() => {
        return practiceTest?.questions?.[currentQuestionIndex];
    }, [practiceTest?.questions, currentQuestionIndex]);

    const navigationState = useMemo(() => ({
        canGoNext: currentQuestionIndex < (practiceTest?.questions?.length || 0) - 1,
        canGoPrev: currentQuestionIndex > 0,
        isLastQuestion: currentQuestionIndex === (practiceTest?.questions?.length || 0) - 1
    }), [currentQuestionIndex, practiceTest?.questions?.length]);

    // Auto-save functionality
    const autoSaveAnswers = useCallback(async () => {
        if (Object.keys(userAnswers).length === 0) return;

        try {
            setAutoSaving(true);
            await axios.post('/api/practice-test/autosave', {
                testId: practiceTest?.id,
                userAnswers,
                courseId,
                chapterId,
                userId
            });
        } catch (error) {
            console.warn('Auto-save failed:', error);
        } finally {
            setAutoSaving(false);
        }
    }, [userAnswers, practiceTest?.id, courseId, chapterId, userId]);

    const fetchPracticeTest = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/api/practice-test', {
                courseId,
                chapterId,
                userId
            });

            setPracticeTest(response.data);

            // Load any previously saved answers
            if (response.data.savedAnswers) {
                setUserAnswers(response.data.savedAnswers);
            }
        } catch (error) {
            console.error('Error fetching practice test:', error);
            setError(error.response?.data?.message || 'Failed to load practice test');
        } finally {
            setLoading(false);
        }
    }, [courseId, chapterId, userId]);

    // Optimized answer change handler
    const handleAnswerChange = useCallback((questionId, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    }, []);

    // Navigation handlers
    const handleQuestionSelect = useCallback((index) => {
        setCurrentQuestionIndex(index);
    }, []);

    const handlePreviousQuestion = useCallback(() => {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    }, []);

    const handleNextQuestion = useCallback(() => {
        setCurrentQuestionIndex(prev => prev + 1);
    }, []);



    useEffect(() => {
        fetchPracticeTest();
    }, [fetchPracticeTest]);

    // Auto-save effect
    useEffect(() => {
        if (Object.keys(userAnswers).length > 0) {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            autoSaveTimerRef.current = setTimeout(() => {
                autoSaveAnswers();
            }, AUTO_SAVE_INTERVAL);
        }

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [userAnswers, autoSaveAnswers]);



    // Focus management
    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.focus();
        }
    }, []);

    const handleSubmitTest = useCallback(async () => {
        try {
            setSubmitting(true);
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

            await axios.post('/api/practice-test/submit', {
                testId: practiceTest.id,
                userAnswers,
                timeSpent
            });

            // Clear auto-save timer
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            setShowResults(true);
        } catch (error) {
            console.error('Error submitting test:', error);
            setError('Failed to submit test. Please try again.');
        } finally {
            setSubmitting(false);
            setShowConfirmSubmit(false);
        }
    }, [practiceTest?.id, userAnswers, startTime]);

    const handleSubmitClick = useCallback(() => {
        if (testStats.answered === 0) {
            setError('Please answer at least one question before submitting.');
            return;
        }
        setShowConfirmSubmit(true);
    }, [testStats.answered]);

    const renderQuestion = useCallback((question) => {
        const userAnswer = userAnswers[question.id];

        switch (question.type) {
            case QUESTION_TYPES.MCQ:
                return (
                    <MCQQuestion
                        question={question}
                        userAnswer={userAnswer}
                        onAnswerChange={handleAnswerChange}
                    />
                );
            case QUESTION_TYPES.TRUE_FALSE:
                return (
                    <TrueFalseQuestion
                        question={question}
                        userAnswer={userAnswer}
                        onAnswerChange={handleAnswerChange}
                    />
                );
            case QUESTION_TYPES.DESCRIPTIVE:
                return (
                    <DescriptiveQuestion
                        question={question}
                        userAnswer={userAnswer}
                        onAnswerChange={handleAnswerChange}
                    />
                );
            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>Unknown question type: {question.type}</p>
                    </div>
                );
        }
    }, [userAnswers, handleAnswerChange]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="loading-title">
                <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 id="loading-title" className="text-2xl font-bold text-gray-900 mb-2">Loading Practice Test</h3>
                    <p className="text-gray-600">Preparing your chapter quiz...</p>
                </div>
            </div>
        );
    }

    if (error || !practiceTest || !practiceTest.questions) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="error-title">
                <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 id="error-title" className="text-2xl font-bold text-gray-900 mb-2">
                        {error ? 'Error Loading Test' : 'No Practice Test Available'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {error || 'Practice test for this chapter is not ready yet.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        {error && (
                            <Button
                                onClick={fetchPracticeTest}
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                Try Again
                            </Button>
                        )}
                        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Continue Learning
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="results-title">
                <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 id="results-title" className="text-2xl font-bold text-gray-900 mb-2">Test Completed!</h3>
                    <p className="text-gray-600 mb-6">
                        Your answers have been submitted successfully. Results will be available after grading.
                    </p>
                    <Button
                        onClick={() => {
                            onTestComplete();
                            onClose();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        autoFocus
                    >
                        Continue Learning
                    </Button>
                </div>
            </div>
        );
    }

    // Confirmation Dialog
    if (showConfirmSubmit) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 id="confirm-title" className="text-2xl font-bold text-gray-900 mb-2">Submit Test?</h3>
                    <p className="text-gray-600 mb-6">
                        You have answered {testStats.answered} out of {testStats.total} questions.
                        Once submitted, you cannot make changes to your answers.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            onClick={() => setShowConfirmSubmit(false)}
                            variant="outline"
                            className="border-gray-300"
                        >
                            Review Answers
                        </Button>
                        <Button
                            onClick={handleSubmitTest}
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            autoFocus
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Test'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Use memoized values instead of recalculating

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-title"
        >
            <div
                ref={modalRef}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl focus:outline-none"
                tabIndex={-1}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 id="test-title" className="text-2xl font-bold text-gray-900">
                                    Chapter {chapterId} Practice Test
                                </h2>
                                <p className="text-gray-600">
                                    Question {currentQuestionIndex + 1} of {testStats.total}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <TestTimer startTime={startTime} />
                            <ProgressIndicator
                                current={currentQuestionIndex + 1}
                                total={testStats.total}
                                answered={testStats.answered}
                            />
                            {autoSaving && (
                                <div className="flex items-center gap-1 text-sm text-blue-600">
                                    <Save className="w-4 h-4 animate-pulse" />
                                    <span>Saving...</span>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Close practice test"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Question Content */}
                <div className="p-8" role="main">
                    <Card className="p-6">
                        <div className="mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {currentQuestion?.type === QUESTION_TYPES.MCQ && 'Multiple Choice'}
                                {currentQuestion?.type === QUESTION_TYPES.TRUE_FALSE && 'True/False'}
                                {currentQuestion?.type === QUESTION_TYPES.DESCRIPTIVE && 'Descriptive'}
                            </span>
                        </div>
                        {currentQuestion && renderQuestion(currentQuestion)}
                    </Card>
                </div>

                {/* Footer Navigation */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl">
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handlePreviousQuestion}
                            disabled={!navigationState.canGoPrev}
                            className="flex-shrink-0"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        <QuestionNavigation
                            questions={practiceTest.questions}
                            currentIndex={currentQuestionIndex}
                            userAnswers={userAnswers}
                            onQuestionSelect={handleQuestionSelect}
                        />

                        {navigationState.isLastQuestion ? (
                            <Button
                                onClick={handleSubmitClick}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                            >
                                Submit Test
                                <CheckCircle className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNextQuestion}
                                disabled={!navigationState.canGoNext}
                                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeTest;
