import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const plans = [
    { name: "Student", price: "$-", desc: "Individual learners", features: ["5 AI courses/month", "Basic tracking", "Community support"], color: "from-blue-500 to-cyan-500" },
    { name: "Pro", price: "$-", desc: "Serious learners", features: ["Unlimited courses", "Advanced analytics", "Priority support", "Parent dashboard"], color: "from-purple-500 to-pink-500", popular: true },
    { name: "Family", price: "$-", desc: "For families", features: ["5 student accounts", "Family dashboard", "All Pro features"], color: "from-green-500 to-emerald-500" }
];

function PricingSection() {

    return (
        <section className="py-20 bg-white" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-700">
                        🏆 Pricing Plans
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Choose Your Learning Journey
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Flexible pricing for every learner
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-purple-300 scale-105' : ''} hover:shadow-lg transition-all duration-300`}>
                            {plan.popular && (
                                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs">
                                    Popular
                                </Badge>
                            )}
                            <CardHeader className="text-center pb-4">
                                <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                    <span className="text-white text-xl font-bold">{plan.name.charAt(0)}</span>
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-800">{plan.name}</CardTitle>
                                <div className="text-3xl font-bold text-gray-900">
                                    {plan.price}<span className="text-base text-gray-500">/month</span>
                                </div>
                                <CardDescription className="text-gray-600 text-sm">
                                    {plan.desc}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-sm">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className={`w-full bg-gradient-to-r ${plan.color} text-sm`}>
                                    Get Started
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PricingSection;