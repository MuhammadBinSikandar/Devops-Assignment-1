"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSupabase } from '../supabase-provider';
import { useRouter } from 'next/navigation';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, userProfile, loading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-blue-100' : 'bg-white/80 backdrop-blur-sm border-b border-blue-100'
      }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI LMS
          </h1>
        </Link>

        <nav className="hidden md:flex space-x-8">
          {['Features', 'Courses', 'Pricing', 'About'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110 font-medium">
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : user ? (
            <>
              <Link href={userProfile?.role?.toLowerCase() === 'parent' ? '/dashboard/parent' : userProfile?.role?.toLowerCase() === 'student' ? '/dashboard/student' : '/dashboard'}>
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Button>
              </Link>
              <Link href="/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Create Course
                </Button>
              </Link>
              <AuthenticatedUserMenu user={user} userProfile={userProfile} />
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-blue-100">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {['Features', 'Courses', 'Pricing', 'About'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="block text-gray-600 hover:text-blue-600 transition-colors">
                {item}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <>
                  <Link href={userProfile?.role?.toLowerCase() === 'parent' ? '/dashboard/parent' : userProfile?.role?.toLowerCase() === 'student' ? '/dashboard/student' : '/dashboard'}>
                    <Button variant="ghost" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Create Course
                    </Button>
                  </Link>
                  <MobileAuthenticatedUserMenu user={user} userProfile={userProfile} />
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Authenticated User Menu Component for Desktop
function AuthenticatedUserMenu({ user, userProfile }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user: supabaseUser, loading } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden lg:block">
          {userProfile?.name || user?.email?.split('@')[0] || 'User'}
        </span>
      </Button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {userProfile?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            {userProfile?.role && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {userProfile.role}
              </span>
            )}
          </div>

          <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Profile Settings
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Authenticated User Menu Component for Mobile
function MobileAuthenticatedUserMenu({ user, userProfile }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="pt-2 border-t border-gray-200 space-y-2">
      <div className="px-2 py-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {userProfile?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            {userProfile?.role && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {userProfile.role}
              </span>
            )}
          </div>
        </div>
      </div>

      <Link href="/dashboard/profile">
        <Button variant="ghost" className="w-full justify-start">
          <User className="w-4 h-4 mr-2" />
          Profile Settings
        </Button>
      </Link>

      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}

export default Header;