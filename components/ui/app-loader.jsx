"use client";

import { useEffect, useState, useMemo } from "react";

export default function AppLoader({ isLoading }) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const loadingSteps = useMemo(() => [
        { text: "Initializing application...", duration: 2000 },
        { text: "Loading authentication...", duration: 1300 },
        { text: "Setting up user session...", duration: 1200 },
        { text: "Preparing dashboard...", duration: 1000 },
    ], []);

    useEffect(() => {
        if (!isLoading) return;

        let progressInterval;
        let stepTimeout;

        const startLoading = () => {
            // Progress bar animation
            progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 5;
                });
            }, 150);

            // Step progression
            let stepIndex = 0;
            const nextStep = () => {
                if (stepIndex < loadingSteps.length - 1) {
                    stepIndex++;
                    setCurrentStep(stepIndex);
                    stepTimeout = setTimeout(nextStep, loadingSteps[stepIndex].duration);
                }
            };

            stepTimeout = setTimeout(nextStep, loadingSteps[0].duration);
        };

        startLoading();

        return () => {
            if (progressInterval) clearInterval(progressInterval);
            if (stepTimeout) clearTimeout(stepTimeout);
        };
    }, [isLoading, loadingSteps]);

    useEffect(() => {
        if (!isLoading) {
            setProgress(100);
        }
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-50 flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative flex flex-col items-center space-y-8 max-w-md mx-auto px-6">
                {/* Logo and Brand */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        {/* Animated Logo Container */}
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                            <svg
                                className="w-10 h-10 text-white animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ animationDuration: '3s' }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>

                        {/* Floating Particles */}
                        <div className="absolute -inset-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animationDelay: `${i * 0.5}s`,
                                        animationDuration: '2s',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            AI LMS
                        </h1>
                        <p className="text-gray-600 mt-1 font-medium">Learning Management System</p>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="w-full space-y-6">
                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>
                        <div className="text-right mt-2">
                            <span className="text-sm font-medium text-gray-600">{Math.floor(progress)}%</span>
                        </div>
                    </div>

                    {/* Loading Steps */}
                    <div className="space-y-3">
                        {loadingSteps.map((step, index) => (
                            <div
                                key={index}
                                className={`flex items-center space-x-3 transition-all duration-500 ${index <= currentStep ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${index < currentStep
                                    ? 'bg-green-500'
                                    : index === currentStep
                                        ? 'bg-blue-500 animate-pulse'
                                        : 'bg-gray-300'
                                    }`}>
                                    {index < currentStep ? (
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : index === currentStep ? (
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    ) : null}
                                </div>
                                <span className={`text-sm font-medium transition-colors duration-300 ${index <= currentStep ? 'text-gray-800' : 'text-gray-500'
                                    }`}>
                                    {step.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="text-center space-y-2 mt-8">
                    <p className="text-xs text-gray-500 font-medium">
                        💡 Did you know?
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Our AI-powered system adapts to your learning style for a personalized experience
                    </p>
                </div>
            </div>

            {/* Custom CSS for shimmer animation */}
            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
}
