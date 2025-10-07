"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthCodeError() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Authentication Error</h2>
                    <p className="mt-2 text-gray-600">Something went wrong during sign-in</p>
                </div>

                {/* Error Card */}
                <Card className="p-8 shadow-xl border-0">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Unable to Complete Sign-In
                            </h3>
                            <p className="text-gray-600 mb-6">
                                There was an error processing your authentication request. This could be due to:
                            </p>
                            <ul className="text-left text-gray-600 space-y-2 mb-6">
                                <li>• Expired or invalid verification link</li>
                                <li>• Network connectivity issues</li>
                                <li>• Temporary service interruption</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <Button
                                asChild
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                            >
                                <Link href="/auth/login">
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Try Again
                                </Link>
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full py-3 border-2 hover:bg-gray-50 transition-all duration-300"
                            >
                                <Link href="/">
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Help */}
                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        Still having trouble?{" "}
                        <Link href="#" className="text-blue-600 hover:underline">
                            Contact support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
