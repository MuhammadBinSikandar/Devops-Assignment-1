import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Brain } from 'lucide-react';

function CourseOptionsSection() {
    const options = [
        {
            name: "Exam Preparation",
            icon: "📚",
            description: "AI-powered exam prep with personalized study plans and practice tests",
            color: "from-red-500 to-pink-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        },
        {
            name: "Job Interview",
            icon: "💼",
            description: "Master interview skills with AI-driven mock interviews and feedback",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            name: "Practice Sessions",
            icon: "🎯",
            description: "Hands-on practice with real-world scenarios and instant feedback",
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            name: "Coding Prep",
            icon: "💻",
            description: "Comprehensive coding bootcamp with AI-assisted debugging",
            color: "from-purple-500 to-indigo-500",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        },
        {
            name: "Custom Learning",
            icon: "🧠",
            description: "Tailored learning paths for any subject or skill you want to master",
            color: "from-orange-500 to-yellow-500",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        }
    ];

    return (
        <section className="py-20 bg-white/50 backdrop-blur-sm" id="courses">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
                        <Target className="w-4 h-4 mr-2" />
                        Course Categories
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Choose Your Learning Path
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Our AI creates personalized courses tailored to your goals, skill level, and learning style.
                        Select from our popular categories or create something completely custom.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {options.map((option, index) => (
                        <Card key={index} className={`${option.bgColor} ${option.borderColor} border-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:rotate-1 group cursor-pointer`}>
                            <CardHeader className="text-center">
                                <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <span className="text-3xl">{option.icon}</span>
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-800 mb-2">{option.name}</CardTitle>
                                <CardDescription className="text-gray-600 leading-relaxed">
                                    {option.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                        <Brain className="w-5 h-5 mr-2" />
                        Create Your Course
                    </Button>
                </div>
            </div>
        </section>
    );
}

export default CourseOptionsSection;