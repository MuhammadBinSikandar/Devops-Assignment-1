import React from 'react';

const stats = [
    { number: "50K+", label: "Active Learners", icon: "👥", color: "text-blue-600", bg: "bg-blue-100" },
    { number: "1000+", label: "AI Courses", icon: "📚", color: "text-purple-600", bg: "bg-purple-100" },
    { number: "98%", label: "Success Rate", icon: "🏆", color: "text-green-600", bg: "bg-green-100" },
    { number: "24/7", label: "AI Support", icon: "💬", color: "text-indigo-600", bg: "bg-indigo-100" }
];

export default function StatsSection() {

    return (
        <section className="py-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Trusted by Learners Worldwide
                    </h2>
                    <p className="text-lg text-gray-600">
                        Join thousands of successful learners
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className={`${stat.bg} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            <h3 className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.number}</h3>
                            <p className="text-gray-600 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}