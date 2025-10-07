import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Simple icon component to replace lucide-react icons
const SimpleIcon = ({ type, className }) => {
  const icons = {
    brain: "🧠",
    target: "🎯",
    zap: "⚡",
    users: "👥",
    code: "💻",
    trophy: "🏆"
  };
  return <span className={className}>{icons[type]}</span>;
};

function FeaturesSection() {
  const features = [
    {
      icon: "brain",
      title: "AI-Powered Personalization",
      description: "Advanced AI analyzes learning patterns to create personalized experiences.",
      gradient: "from-blue-500 to-cyan-500",
      color: "text-blue-800",
      bg: "bg-blue-50"
    },
    {
      icon: "target",
      title: "Smart Progress Tracking",
      description: "Analytics provide insights with predictive modeling to optimize study schedules.",
      gradient: "from-purple-500 to-pink-500",
      color: "text-purple-800",
      bg: "bg-purple-50"
    },
    {
      icon: "zap",
      title: "Interactive Learning",
      description: "Multimedia content and AI-powered quizzes maximize retention.",
      gradient: "from-indigo-500 to-blue-500",
      color: "text-indigo-800",
      bg: "bg-indigo-50"
    },
    {
      icon: "users",
      title: "Parent Dashboard",
      description: "Monitor progress with comprehensive reports and analytics.",
      gradient: "from-green-500 to-emerald-500",
      color: "text-green-800",
      bg: "bg-green-50"
    },
    {
      icon: "code",
      title: "Multi-Difficulty Levels",
      description: "AI adjusts content complexity to match skill levels.",
      gradient: "from-orange-500 to-red-500",
      color: "text-orange-800",
      bg: "bg-orange-50"
    },
    {
      icon: "trophy",
      title: "Achievement System",
      description: "Gamified learning with badges and progress milestones.",
      gradient: "from-yellow-500 to-orange-500",
      color: "text-yellow-800",
      bg: "bg-yellow-50"
    }
  ];

  return (
    <section className="py-20" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
            ⚡ Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Why Choose Our AI LMS?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience AI technology that adapts to your learning style.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.bg} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <CardHeader>
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                  <SimpleIcon type={feature.icon} className="text-2xl" />
                </div>
                <CardTitle className={`${feature.color} text-lg font-bold mb-2`}>
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;