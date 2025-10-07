import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, ArrowRight, Users, Trophy, Zap, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSupabase } from '../supabase-provider';

function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Learning', 'Education', 'Growth', 'Success'];
  // const { user, loading } = useSupabase();
  const { user, userProfile, loading } = useSupabase();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-40 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 border-blue-200 animate-pulse">
          <Zap className="w-4 h-4 mr-2" />
          Powered by Advanced AI Technology
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Transform Your
          </span>
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {words[currentWord]}
            </span>
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 animate-pulse"></span>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Experience the future of education with our AI-powered learning management system.
          Create personalized courses, track progress with intelligent analytics, and unlock your potential.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading...</span>
            </div>
          ) : user ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={userProfile?.role?.toLowerCase() === 'parent' ? '/dashboard/parent' : userProfile?.role?.toLowerCase() === 'student' ? '/dashboard/student' : '/dashboard'}>
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Create Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Enhanced Search Bar */}
        {/* <div className="max-w-lg mx-auto mb-20">
          <div className="relative group">
            <Input
              placeholder="What would you like to learn today?"
              className="pl-6 pr-16 py-4 text-lg border-2 border-blue-200 focus:border-blue-400 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm group-hover:shadow-xl transition-all duration-300"
            />
            <Button size="lg" className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">Try: "JavaScript", "Data Science", "Machine Learning"</p>
        </div> */}

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-gray-600 font-medium">4.9/5 Rating</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600 font-medium">50K+ Students</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-purple-500" />
            <span className="text-gray-600 font-medium">Award Winning</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;