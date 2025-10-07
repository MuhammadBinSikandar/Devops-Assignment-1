"use client"
import { useEffect, useRef, lazy, Suspense } from 'react'
import Header from './_components/Header';
import HeroSection from './_components/HeroSection';
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'

// Lazy load below-the-fold components
const CourseOptionsSection = lazy(() => import('./_components/CourseOptionsSection'));
const FeaturesSection = lazy(() => import('./_components/FeaturesSection'));
const StatsSection = lazy(() => import('./_components/StatsSection'));
const PricingSection = lazy(() => import('./_components/PricingSection'));
const TestimonialsSection = lazy(() => import('./_components/TestimonialsSection'));
const CTASection = lazy(() => import('./_components/CTASection'));
const Footer = lazy(() => import('./_components/Footer'));

export default function Home() {
  const { loading, userProfile, user } = useSupabase();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Don't redirect if loading or already redirected
    if (loading || hasRedirectedRef.current) return;
    if (!user) return; // No user, stay on homepage

    // Redirect authenticated users with roles directly to their dashboard
    if (
      userProfile?.role &&
      typeof window !== 'undefined' &&
      window.location.pathname === '/'
    ) {
      hasRedirectedRef.current = true;
      const role = userProfile.role.toLowerCase();
      const destination = role === 'admin' ? '/admin'
        : role === 'parent' ? '/dashboard/parent'
          : role === 'student' ? '/dashboard/student'
            : '/dashboard';
      // Use replace to prevent back button issues
      router.replace(destination);
    }
  }, [loading, user, userProfile, router]); // Include userProfile in dependencies

  // Show nothing while loading or if user exists (to prevent flashing)
  if (loading || user) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <HeroSection />
      <Suspense fallback={<div className="h-20 bg-gray-50 animate-pulse" />}>
        <CourseOptionsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
        <CTASection />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  );
}