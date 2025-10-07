import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';

function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
                <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Ready to Transform Your Learning?
                </h2>
                <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                    Join thousands of learners who are already experiencing the future of education.
                    Start your AI-powered learning journey today.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Start Free Trial
                    </Button>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-8 text-blue-100">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span>No credit card required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span>14-day free trial</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span>Cancel anytime</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CTASection;