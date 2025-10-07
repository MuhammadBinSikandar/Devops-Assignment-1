"use client"
import React, { useState, Suspense, useCallback, memo } from 'react'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { studyTypes } from "@/lib/study-types";
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import {
    Brain,
    BookOpen,
    Target,
    Code,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Sparkles,
    GraduationCap,
    Briefcase,
    Lightbulb,
    BarChart3,
    Loader
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';

const Create = memo(function Create() {
    const [step, setStep] = useState(0);
    const [selectedStudyType, setSelectedStudyType] = useState('');
    const [topic, setTopic] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Use optimized auth guard hook  
    const { user, userProfile, loading: supabaseLoading, isRedirecting } = useAuthGuard({
        allowedRoles: ['student', 'parent'],
        checkInterval: 30000 // Reduced from 5 seconds to 30 seconds
    });

    // Check if parent is creating course for student
    const studentId = searchParams.get('studentId');
    const studentEmail = searchParams.get('studentEmail');
    const studentName = searchParams.get('studentName');
    const isParentCreating = !!(studentId && studentEmail && studentName);

    const difficultyLevels = [
        { value: "beginner", label: "Beginner", description: "Basic concepts and fundamentals" },
        { value: "intermediate", label: "Intermediate", description: "Moderate complexity and depth" },
        { value: "advanced", label: "Advanced", description: "Complex topics and expert-level content" }
    ];

    // Optimized course generation function
    const GenerateCourseOutline = useCallback(async () => {
        if (!topic || !difficultyLevel || !selectedStudyType) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const courseId = uuidv4();
        setIsGenerating(true);

        try {
            const formData = {
                studyType: selectedStudyType,
                topic: topic.trim(),
                difficultyLevel: difficultyLevel,
                additionalDetails: additionalDetails.trim()
            };

            // Use student's email if parent is creating course for student, otherwise use current user's email
            const createdByEmail = isParentCreating ? studentEmail : user?.email;

            const result = await axios.post('/api/generate-course-outline', {
                courseId: courseId,
                ...formData,
                createdBy: createdByEmail,
                createdFor: isParentCreating ? studentId : null,
            }, {
                timeout: 60000, // Increased timeout to 60 seconds for course generation
            });

            // Check if the response indicates success
            if (result.status === 200 || result.status === 201) {
                // Additional check for success flag in response data
                if (result.data?.success !== false) {
                    router.replace('/dashboard');
                    const successMessage = isParentCreating
                        ? `Course for ${studentName} is being generated, it will appear on their dashboard within a few minutes`
                        : "Your course content is being generated, please check your dashboard in a few minutes";
                    toast.success(successMessage);
                } else {
                    throw new Error(result.data?.message || "Course generation failed");
                }
            } else {
                throw new Error(`Unexpected response status: ${result.status}`);
            }
        } catch (error) {
            console.error("Error generating course:", error);

            // Check if it's a timeout error - course might still be generating
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                router.replace('/dashboard');
                const timeoutMessage = isParentCreating
                    ? `Course creation for ${studentName} has started. It may take a few minutes to appear on their dashboard.`
                    : "Course creation has started. It may take a few minutes to appear on your dashboard.";
                toast.success(timeoutMessage);
                return;
            }

            // Handle other types of errors
            let errorMessage = "Failed to generate course. Please try again.";

            if (error.response?.status === 500) {
                // Server error - course might still be generating
                router.replace('/dashboard');
                const serverErrorMessage = isParentCreating
                    ? `Course creation for ${studentName} is in progress. Please check their dashboard in a few minutes.`
                    : "Course creation is in progress. Please check your dashboard in a few minutes.";
                toast.success(serverErrorMessage);
                return;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    }, [selectedStudyType, topic, difficultyLevel, additionalDetails, isParentCreating, studentEmail, studentName, studentId, user?.email, router]);

    // Simplified loading states using auth guard
    if (supabaseLoading || isRedirecting) {
        return (
            <LoadingSpinner
                text="Loading Course Creator"
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="flex justify-start mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI-Powered
                        </Badge>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        {isParentCreating ? (
                            <>
                                Create Course for
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"> {studentName}</span>
                            </>
                        ) : (
                            <>
                                Create Your Perfect
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"> Learning Experience</span>
                            </>
                        )}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {isParentCreating
                            ? `Generate personalized study materials for ${studentName}, tailored to their learning goals and skill level.`
                            : "Our AI will generate personalized study materials tailored to your goals, skill level, and learning style."
                        }
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center space-x-2 ${step >= 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 0 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                {step > 0 ? <CheckCircle className="w-4 h-4" /> : '1'}
                            </div>
                            <span className="font-medium">Choose Type</span>
                        </div>
                        <div className="flex-1 h-1 bg-gray-200 mx-4">
                            <div className={`h-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${step >= 1 ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                {step > 1 ? <CheckCircle className="w-4 h-4" /> : '2'}
                            </div>
                            <span className="font-medium">Add Details</span>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="max-w-4xl mx-auto">
                    {step === 0 && (
                        <div className="space-y-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    What type of learning material do you need?
                                </h2>
                                <p className="text-gray-600">Select the category that best matches your learning goals</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studyTypes.map((type, index) => (
                                    <Card
                                        key={index}
                                        className={`${type.bgColor} ${type.borderColor} border-2 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${selectedStudyType === type.name ? 'ring-4 ring-blue-200 shadow-lg' : ''
                                            }`}
                                        onClick={() => setSelectedStudyType(type.name)}
                                    >
                                        <CardContent className="p-6">
                                            <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg`}>
                                                {type.icon}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">{type.name}</h3>
                                            <p className="text-gray-600 text-sm text-center mb-4">{type.description}</p>
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-500">Examples:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {type.examples.map((example, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs border-gray-300 text-gray-600">
                                                            {example}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Tell us about your learning goals
                                </h2>
                                <p className="text-gray-600">Provide details to help our AI create the perfect study materials</p>
                            </div>

                            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                                <CardContent className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Topic or Subject
                                        </label>
                                        <Input
                                            placeholder="e.g., Advanced Calculus, JavaScript Programming, Data Science..."
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="border-blue-200 focus:border-blue-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Difficulty Level
                                        </label>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {difficultyLevels.map((level) => (
                                                <div
                                                    key={level.value}
                                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${difficultyLevel === level.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    onClick={() => setDifficultyLevel(level.value)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 ${difficultyLevel === level.value
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-gray-300'
                                                            }`}></div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{level.label}</h4>
                                                            <p className="text-sm text-gray-600">{level.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Additional Details (Optional)
                                        </label>
                                        <Textarea
                                            placeholder="Describe your specific learning objectives, preferred learning style, or any special requirements..."
                                            className="border-blue-200 focus:border-blue-400 min-h-[100px]"
                                            value={additionalDetails}
                                            onChange={(e) => setAdditionalDetails(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12">
                        {step > 0 ? (
                            <Button
                                onClick={() => setStep(step - 1)}
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>
                        ) : <div></div>}

                        {step === 0 ? (
                            <Button
                                onClick={() => setStep(step + 1)}
                                disabled={!selectedStudyType}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={GenerateCourseOutline}
                                disabled={!topic || !difficultyLevel || isGenerating}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader className="animate-spin w-4 h-4 mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Course
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Features Preview */}
                    <div className="mt-16">
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-8">
                            What you&apos;ll get with your AI-generated course
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Comprehensive Content</h4>
                                    <p className="text-sm text-gray-600">Structured lessons, examples, and practice materials</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Personalized Learning</h4>
                                    <p className="text-sm text-gray-600">Adapted to your skill level and learning style</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/80 backdrop-blur-sm border-green-100">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Progress Tracking</h4>
                                    <p className="text-sm text-gray-600">Monitor your learning progress and achievements</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const CreatePage = memo(function CreatePage() {
    return (
        <Suspense fallback={
            <LoadingSpinner
                text="Loading Course Creator"
                subtitle="Please wait..."
                variant="default"
            />
        }>
            <Create />
        </Suspense>
    );
});

export default CreatePage;
