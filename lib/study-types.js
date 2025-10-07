import { BookOpen, Brain, Zap, Target, Trophy, GraduationCap, Briefcase, Code, Lightbulb } from "lucide-react";

export const studyTypes = [
    {
        name: "Exam Preparation",
        icon: <GraduationCap className="w-8 h-8" />,
        description: "Comprehensive study materials for academic exams",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        examples: ["SAT", "GRE", "TOEFL", "Academic Tests"]
    },
    {
        name: "Job Interview",
        icon: <Briefcase className="w-8 h-8" />,
        description: "Interview preparation and career development",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        examples: ["Technical Interviews", "Behavioral Questions", "Case Studies"]
    },
    {
        name: "Practice Sessions",
        icon: <Target className="w-8 h-8" />,
        description: "Hands-on practice with real-world scenarios",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        examples: ["Problem Solving", "Skill Building", "Practical Exercises"]
    },
    {
        name: "Coding Prep",
        icon: <Code className="w-8 h-8" />,
        description: "Programming and software development skills",
        color: "from-orange-500 to-red-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        examples: ["Algorithms", "Data Structures", "System Design"]
    },
    {
        name: "Custom Learning",
        icon: <Lightbulb className="w-8 h-8" />,
        description: "Personalized learning for any subject",
        color: "from-indigo-500 to-purple-500",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        examples: ["Any Topic", "Personal Interest", "Skill Development"]
    }
];
