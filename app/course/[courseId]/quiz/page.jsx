"use client"
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, XCircle, History, Plus, RefreshCw, Trophy, Calendar, ArrowLeft } from 'lucide-react'
import { useSupabase } from '@/app/supabase-provider'

function Quiz() {
    const { courseId } = useParams();
    const { user, userProfile } = useSupabase();
    const [quizData, setQuizData] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [previousResults, setPreviousResults] = useState([]);
    const [showQuizHistory, setShowQuizHistory] = useState(false);
    const [takingNewQuiz, setTakingNewQuiz] = useState(false);
    const [generatingNewQuiz, setGeneratingNewQuiz] = useState(false);



    useEffect(() => {
        if (takingNewQuiz) {
            setStartTime(Date.now());
        }
    }, [takingNewQuiz])

    useEffect(() => {
        const timer = setInterval(() => {
            if (startTime && !showResults && takingNewQuiz) {
                setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, showResults, takingNewQuiz]);

    const GetQuiz = useCallback(async () => {
        try {
            const result = await axios.post("/api/study-type", {
                courseId: courseId,
                studyType: 'quiz'
            });

            if (result.data && result.data.length > 0 && result.data[0].content) {
                setQuizData(result.data[0].content);
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
        }
    }, [courseId]);

    const checkPreviousResults = useCallback(async () => {
        if (!userProfile?.id) return;

        try {
            setLoading(true);
            // Check for previous quiz results
            const resultsResponse = await axios.get(`/api/quiz-results?courseId=${courseId}&userId=${userProfile.id}`);
            const results = resultsResponse.data;
            setPreviousResults(results);

            // If no previous results, load the quiz directly
            if (!results || results.length === 0) {
                await GetQuiz();
                setTakingNewQuiz(true);
            } else {
                // Show quiz history
                setShowQuizHistory(true);
            }
        } catch (error) {
            console.error("Error checking previous results:", error);
            // If there's an error, just load the quiz
            await GetQuiz();
            setTakingNewQuiz(true);
        } finally {
            setLoading(false);
        }
    }, [userProfile?.id, courseId, GetQuiz]);

    // Initialize quiz data when component mounts or dependencies change
    useEffect(() => {
        if (userProfile?.id && courseId) {
            checkPreviousResults();
        }
    }, [userProfile?.id, courseId, checkPreviousResults]);

    const startNewQuiz = async () => {
        setShowQuizHistory(false);
        setTakingNewQuiz(true);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
        setTimeSpent(0);
        await GetQuiz();
    }

    const generateNewQuiz = async () => {
        try {
            setGeneratingNewQuiz(true);

            // Get course data to generate new quiz
            const courseResponse = await axios.get(`/api/courses?courseId=${courseId}`);
            const course = courseResponse.data;

            let chapters = '';
            course?.courseLayout?.chapters?.forEach((chapter) => {
                chapters = chapter.ChapterTitle + ',' + chapters;
            });

            // Generate new quiz content
            await axios.post('/api/study-type-content', {
                courseId: courseId,
                chapters: chapters,
                type: 'quiz'
            });

            // Wait a moment for generation to complete, then refresh
            setTimeout(async () => {
                await GetQuiz();
                setGeneratingNewQuiz(false);
                setShowQuizHistory(false);
                setTakingNewQuiz(true);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setShowResults(false);
                setScore(0);
                setTimeSpent(0);
            }, 3000);

        } catch (error) {
            console.error("Error generating new quiz:", error);
            setGeneratingNewQuiz(false);
        }
    }

    const handleAnswerSelect = (selectedOption) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: selectedOption
        });
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    }

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    }

    const calculateScore = () => {
        let correctAnswers = 0;
        quizData.forEach((question, index) => {
            if (selectedAnswers[index] === question.answer) {
                correctAnswers++;
            }
        });
        return correctAnswers;
    }

    const submitQuiz = async () => {
        setSubmitting(true);
        const finalScore = calculateScore();
        setScore(finalScore);

        try {
            // Save quiz results to database
            await axios.post("/api/quiz-results", {
                courseId: courseId,
                chapterId: 1, // You might want to make this dynamic
                score: finalScore,
                totalQuestions: quizData.length,
                timeSpent: timeSpent,
                answers: selectedAnswers,
                userId: userProfile?.id // Add user ID from Supabase profile
            });

            // Refresh previous results
            const resultsResponse = await axios.get(`/api/quiz-results?courseId=${courseId}&userId=${userProfile.id}`);
            setPreviousResults(resultsResponse.data);
        } catch (error) {
            console.error("Error saving quiz results:", error);
        }

        setShowResults(true);
        setSubmitting(false);
    }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Show quiz history if user has previous results and not taking a new quiz
    if (showQuizHistory && !takingNewQuiz) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = `/course/${courseId}`}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Course
                    </Button>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Quiz History</h1>
                    <p className="text-gray-600">Review your previous quiz attempts and take a new quiz.</p>
                </div>

                {/* Quiz Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Take Existing Quiz</h3>
                                    <p className="text-blue-600 text-sm">Retake the same quiz questions</p>
                                </div>
                                <RefreshCw className="h-8 w-8 text-blue-600" />
                            </div>
                            <Button
                                onClick={startNewQuiz}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                            >
                                Start Quiz
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-green-700 mb-2">Generate New Quiz</h3>
                                    <p className="text-green-600 text-sm">Create fresh questions from course content</p>
                                </div>
                                <Plus className="h-8 w-8 text-green-600" />
                            </div>
                            <Button
                                onClick={generateNewQuiz}
                                disabled={generatingNewQuiz}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                            >
                                {generatingNewQuiz ? (
                                    <>
                                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate New Quiz'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Previous Results */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-6 w-6" />
                            Previous Quiz Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {previousResults.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No previous quiz attempts found.</p>
                        ) : (
                            <div className="space-y-4">
                                {previousResults.map((result, index) => {
                                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                                    const attemptDate = new Date(result.createdAt).toLocaleDateString();
                                    const attemptTime = new Date(result.createdAt).toLocaleTimeString();

                                    return (
                                        <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Trophy className={`h-5 w-5 ${percentage >= 80 ? 'text-yellow-500' : percentage >= 60 ? 'text-gray-400' : 'text-gray-300'}`} />
                                                        <span className="font-semibold">Attempt #{previousResults.length - index}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{attemptDate} at {attemptTime}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {percentage}%
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {result.score}/{result.totalQuestions} correct
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                                                <div className="text-center p-2 bg-green-50 rounded">
                                                    <div className="font-semibold text-green-600">{result.score}</div>
                                                    <div className="text-green-600">Correct</div>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 rounded">
                                                    <div className="font-semibold text-red-600">{result.totalQuestions - result.score}</div>
                                                    <div className="text-red-600">Incorrect</div>
                                                </div>
                                                <div className="text-center p-2 bg-blue-50 rounded">
                                                    <div className="font-semibold text-blue-600">{formatTime(result.timeSpent || 0)}</div>
                                                    <div className="text-blue-600">Time Spent</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (takingNewQuiz && (!quizData || quizData.length === 0)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-96">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-lg text-gray-600">No quiz data available for this course.</p>
                            <Button
                                onClick={() => {
                                    setTakingNewQuiz(false);
                                    setShowQuizHistory(true);
                                }}
                                className="mt-4"
                                variant="outline"
                            >
                                Back to Quiz History
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (showResults) {
        const percentage = Math.round((score / quizData.length) * 100);
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-green-600">Quiz Completed!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-blue-600 mb-2">
                                {percentage}%
                            </div>
                            <p className="text-xl text-gray-600">
                                You scored {score} out of {quizData.length} questions
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Correct</p>
                                <p className="text-2xl font-bold text-green-600">{score}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Incorrect</p>
                                <p className="text-2xl font-bold text-red-600">{quizData.length - score}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Time Spent</p>
                                <p className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Review Your Answers:</h3>
                            {quizData.map((question, index) => {
                                const userAnswer = selectedAnswers[index];
                                const isCorrect = userAnswer === question.answer;
                                return (
                                    <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <h4 className="font-medium mb-2">Q{index + 1}: {question.question}</h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-gray-600">Your answer: <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{userAnswer || 'Not answered'}</span></p>
                                            <p className="text-gray-600">Correct answer: <span className="text-green-600 font-medium">{question.answer}</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => {
                                    setShowResults(false);
                                    setTakingNewQuiz(false);
                                    setShowQuizHistory(true);
                                }}
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                                View Quiz History
                            </Button>
                            <Button
                                onClick={startNewQuiz}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Take Quiz Again
                            </Button>
                            <Button
                                onClick={() => window.location.href = `/course/${courseId}`}
                                className="bg-gray-600 hover:bg-gray-700"
                            >
                                Back to Course
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Only show quiz interface if taking a new quiz
    if (!takingNewQuiz) {
        return null;
    }

    const currentQuestion = quizData[currentQuestionIndex];
    const progress = Math.round(((currentQuestionIndex + 1) / quizData.length) * 100);

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Back Button */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => window.location.href = `/course/${courseId}`}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Course
                </Button>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Quiz</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{formatTime(timeSpent)}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Question {currentQuestionIndex + 1} of {quizData.length}</span>
                        <span>{progress}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        {currentQuestion?.question}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {currentQuestion?.options?.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${selectedAnswers[currentQuestionIndex] === option
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswers[currentQuestionIndex] === option
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                        }`}>
                                        {selectedAnswers[currentQuestionIndex] === option && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <span>{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between pt-6">
                        <Button
                            onClick={previousQuestion}
                            disabled={currentQuestionIndex === 0}
                            variant="outline"
                        >
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {currentQuestionIndex === quizData.length - 1 ? (
                                <Button
                                    onClick={submitQuiz}
                                    disabled={submitting || Object.keys(selectedAnswers).length !== quizData.length}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={nextQuestion}
                                    disabled={!selectedAnswers[currentQuestionIndex]}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-10 gap-2">
                        {quizData.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all ${currentQuestionIndex === index
                                    ? 'border-blue-500 bg-blue-500 text-white'
                                    : selectedAnswers[index]
                                        ? 'border-green-500 bg-green-100 text-green-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500"></div>
                            Current
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100"></div>
                            Answered
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-gray-300"></div>
                            Unanswered
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Quiz;
