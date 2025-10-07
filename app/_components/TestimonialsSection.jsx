import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardDescription } from "@/components/ui/card";

function TestimonialsSection() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "High School Student",
            image: "👩‍🎓",
            content: "The AI-powered exam prep helped me improve my SAT scores by 200 points! The personalized study plan was exactly what I needed.",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Software Developer",
            image: "👨‍💻",
            content: "The coding prep courses are incredibly thorough. The AI feedback on my code helped me land my dream job at a tech company.",
            rating: 5
        },
        {
            name: "Lisa Rodriguez",
            role: "Parent",
            image: "👩‍👧",
            content: "The parent dashboard gives me perfect insight into my daughter's progress. I love how engaged she is with the interactive content!",
            rating: 5
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700">
                        ⭐ Success Stories
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        What Our Learners Say
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        See how our platform transforms learning journeys
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-white border hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-lg mr-3">
                                        {testimonial.image}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{testimonial.name}</h4>
                                        <p className="text-xs text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex mb-3">
                                    {"⭐".repeat(testimonial.rating)}
                                </div>
                                <CardDescription className="text-gray-700 text-sm italic">
                                    &quot;{testimonial.content}&quot;
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default TestimonialsSection;