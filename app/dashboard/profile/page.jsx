"use client";

import { useState, useMemo, useCallback, memo, Suspense, lazy } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  User,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Edit3,
  Save,
  X,
  Loader2,
  Camera,
  GraduationCap,
  Users,
  Phone,
  Calendar,
  Briefcase,
  BookOpen,
  Target,
  Clock,
  Twitter
} from 'lucide-react';

// Lazy load heavy components for better performance
const ProfileEditForm = lazy(() => import('./components/ProfileEditForm'));
const SubjectSelector = lazy(() => import('./components/SubjectSelector'));

const ProfilePage = memo(function ProfilePage() {
  const { user, userProfile, updateProfile } = useSupabase();

  // Memoized initial editing state calculation
  const initialIsEditing = useMemo(() => {
    if (!userProfile) return false;
    const r = (userProfile?.role || '').toLowerCase();
    if (r === 'student') {
      return !userProfile?.grade || !userProfile?.learning_style ||
        !userProfile?.subjects_of_interest ||
        (Array.isArray(userProfile?.subjects_of_interest) && userProfile.subjects_of_interest.length === 0);
    }
    return false;
  }, [userProfile]);

  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [loading, setLoading] = useState(false);

  // Memoized role calculation
  const role = useMemo(() => (userProfile?.role || '').toLowerCase(), [userProfile?.role]);

  // Memoized profile save handler
  const handleSave = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Error handling could be improved with a toast or error state
    } finally {
      setLoading(false);
    }
  }, [updateProfile]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Memoized role color function
  const getRoleColor = useCallback((role) => {
    switch (role) {
      case 'instructor':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }, []);

  // Show content-specific loading only, layout handles auth
  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                {userProfile?.avatar_url ? (
                  <Image
                    src={userProfile.avatar_url}
                    alt={userProfile.name || 'User avatar'}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userProfile?.name || 'User'}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleColor(userProfile?.role)}>
                    {userProfile?.role || 'student'}
                  </Badge>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {!isEditing && userProfile?.bio && (
                <p className="text-gray-700 mt-3">{userProfile.bio}</p>
              )}

              {!isEditing && (
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  {userProfile?.country && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {userProfile.city ? `${userProfile.city}, ${userProfile.country}` : userProfile.country}
                    </div>
                  )}
                  {userProfile?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {userProfile.phone}
                    </div>
                  )}
                  {role === 'student' && userProfile?.grade && (
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      {userProfile.grade}
                    </div>
                  )}
                  {role === 'parent' && userProfile?.occupation && (
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {userProfile.occupation}
                    </div>
                  )}
                  {userProfile?.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {userProfile?.linkedin_url && (
                    <div className="flex items-center">
                      <Linkedin className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {userProfile?.github_url && (
                    <div className="flex items-center">
                      <Github className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub
                      </a>
                    </div>
                  )}
                  {userProfile?.twitter_url && (
                    <div className="flex items-center">
                      <Twitter className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Twitter
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form - Lazy loaded for better performance */}
      {isEditing && (
        <Suspense fallback={
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading Profile Editor...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }>
          <ProfileEditForm
            userProfile={userProfile}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={loading}
          />
        </Suspense>
      )}

      {/* Profile Completion & Additional Info */}
      {!isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const requiredFields = role === 'student'
                  ? ['name', 'country', 'grade', 'learning_goals', 'subjects_of_interest', 'learning_style']
                  : ['name', 'country', 'occupation', 'number_of_children'];

                const completedFields = requiredFields.filter(field => {
                  const value = userProfile?.[field];
                  if (Array.isArray(value)) {
                    return value.length > 0;
                  }
                  return value && value.toString().trim().length > 0;
                }).length;

                const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-medium">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    {completionPercentage < 100 && (
                      <div className="text-sm text-gray-600">
                        Complete your profile to get better course recommendations and personalized learning experiences
                      </div>
                    )}
                    {userProfile?.role === 'student' && completionPercentage >= 80 && (
                      <div className="text-sm text-green-600 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Great progress! Your detailed profile helps us create better learning experiences for you.
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {role === 'student' ? (
                  <>
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    Learning Profile
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Family Information
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile?.role === 'student' ? (
                <div className="space-y-3">
                  {userProfile?.learning_style && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Learning Style</span>
                      <span className="font-medium capitalize">{userProfile.learning_style}</span>
                    </div>
                  )}
                  {userProfile?.difficulty_preference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty Level</span>
                      <span className="font-medium capitalize">{userProfile.difficulty_preference}</span>
                    </div>
                  )}
                  {userProfile?.school_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">School</span>
                      <span className="font-medium">{userProfile.school_name}</span>
                    </div>
                  )}
                  {userProfile?.grade && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade</span>
                      <span className="font-medium">{userProfile.grade}</span>
                    </div>
                  )}
                  {userProfile?.subjects_of_interest && userProfile.subjects_of_interest.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Interests</span>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.subjects_of_interest.slice(0, 4).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {userProfile.subjects_of_interest.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{userProfile.subjects_of_interest.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {userProfile?.number_of_children && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Children</span>
                      <span className="font-medium">{userProfile.number_of_children}</span>
                    </div>
                  )}
                  {userProfile?.children_age_range && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Children&apos;s Age Range</span>
                      <span className="font-medium">{userProfile.children_age_range}</span>
                    </div>
                  )}
                  {userProfile?.parenting_experience && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-medium capitalize">{userProfile.parenting_experience.replace('-', ' ')}</span>
                    </div>
                  )}
                  {userProfile?.education_level && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Education</span>
                      <span className="font-medium">{userProfile.education_level}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Account Created</span>
              <span className="font-medium">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Email Verified</span>
              <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                {user?.email_confirmed_at ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Language</span>
              <span className="font-medium capitalize">
                {userProfile?.language === 'en' ? 'English' : userProfile?.language || 'English'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">User Role</span>
              <Badge className={getRoleColor(userProfile?.role)}>
                {role || 'student'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">
                {userProfile?.updated_at
                  ? new Date(userProfile.updated_at).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ProfilePage;
