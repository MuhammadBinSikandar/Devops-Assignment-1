"use client";

import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Loader2, GraduationCap, Users } from 'lucide-react';
import { countries, grades, learningStyles, educationLevels, parentingExperience, childrenAgeRanges } from '@/lib/profile-data';
import SubjectSelector from './SubjectSelector';

const ProfileEditForm = memo(function ProfileEditForm({
    userProfile,
    onSave,
    onCancel,
    loading
}) {
    const role = (userProfile?.role || '').toLowerCase();

    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        bio: userProfile?.bio || '',
        phone: userProfile?.phone || '',
        country: userProfile?.country || '',
        city: userProfile?.city || '',
        timezone: userProfile?.timezone || '',
        language: userProfile?.language || 'en',
        website: userProfile?.website || '',
        linkedin_url: userProfile?.linkedin_url || '',
        github_url: userProfile?.github_url || '',
        twitter_url: userProfile?.twitter_url || '',

        // Student-specific fields
        grade: userProfile?.grade || '',
        school_name: userProfile?.school_name || '',
        date_of_birth: userProfile?.date_of_birth ? userProfile.date_of_birth.split('T')[0] : '',
        learning_goals: userProfile?.learning_goals || '',
        subjects_of_interest: userProfile?.subjects_of_interest || [],
        learning_style: userProfile?.learning_style || '',
        difficulty_preference: userProfile?.difficulty_preference || 'intermediate',

        // Parent-specific fields
        occupation: userProfile?.occupation || '',
        number_of_children: userProfile?.number_of_children || '',
        education_level: userProfile?.education_level || '',
        parenting_experience: userProfile?.parenting_experience || '',
        children_age_range: userProfile?.children_age_range || ''
    });

    const [errors, setErrors] = useState({});

    // Memoized validation functions
    const validatePhone = useCallback((phone) => {
        if (!phone) return true;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }, []);

    const validateUrl = useCallback((url) => {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }, []);

    const validateForm = useCallback(() => {
        const newErrors = {};

        // Basic validations
        if (!formData.name || formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (formData.website && !validateUrl(formData.website)) {
            newErrors.website = 'Please enter a valid website URL';
        }

        if (formData.linkedin_url && !validateUrl(formData.linkedin_url)) {
            newErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
        }

        if (formData.github_url && !validateUrl(formData.github_url)) {
            newErrors.github_url = 'Please enter a valid GitHub URL';
        }

        if (formData.twitter_url && !validateUrl(formData.twitter_url)) {
            newErrors.twitter_url = 'Please enter a valid Twitter URL';
        }

        // Student-specific validations
        if (role === 'student') {
            if (formData.date_of_birth) {
                const birthDate = new Date(formData.date_of_birth);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 5 || age > 100) {
                    newErrors.date_of_birth = 'Please enter a valid date of birth';
                }
            }

            if (formData.school_name && formData.school_name.length > 100) {
                newErrors.school_name = 'School name must be less than 100 characters';
            }
        }

        // Parent-specific validations
        if (role === 'parent') {
            if (formData.number_of_children && (formData.number_of_children < 1 || formData.number_of_children > 20)) {
                newErrors.number_of_children = 'Please enter a valid number of children (1-20)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, role, validatePhone, validateUrl]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Convert subjects_of_interest array to proper format if needed
        const updatedData = {
            ...formData,
            number_of_children: formData.number_of_children ? parseInt(formData.number_of_children) : null,
            subjects_of_interest: Array.isArray(formData.subjects_of_interest)
                ? formData.subjects_of_interest
                : formData.subjects_of_interest ? [formData.subjects_of_interest] : []
        };

        onSave(updatedData);
    }, [formData, validateForm, onSave]);

    const handleSubjectChange = useCallback((subjects) => {
        setFormData(prev => ({ ...prev, subjects_of_interest: subjects }));
    }, []);

    const updateFormField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => updateFormField('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => updateFormField('phone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className={errors.phone ? "border-red-500" : ""}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Bio</label>
                            <Textarea
                                value={formData.bio}
                                onChange={(e) => updateFormField('bio', e.target.value)}
                                placeholder="Tell us about yourself"
                                rows={3}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Country *</label>
                                <Select value={formData.country} onValueChange={(value) => updateFormField('country', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your country" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {countries.map((country) => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">City</label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => updateFormField('city', e.target.value)}
                                    placeholder="Enter your city"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student-specific fields */}
                    {role === 'student' && (
                        <div>
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                                Student Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Grade Level</label>
                                    <Select value={formData.grade} onValueChange={(value) => updateFormField('grade', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.map((grade) => (
                                                <SelectItem key={grade} value={grade}>
                                                    {grade}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">School Name</label>
                                    <Input
                                        value={formData.school_name}
                                        onChange={(e) => updateFormField('school_name', e.target.value)}
                                        placeholder="Enter your school name"
                                        className={errors.school_name ? "border-red-500" : ""}
                                    />
                                    {errors.school_name && <p className="text-red-500 text-sm mt-1">{errors.school_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                                    <Input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => updateFormField('date_of_birth', e.target.value)}
                                        className={errors.date_of_birth ? "border-red-500" : ""}
                                    />
                                    {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Learning Style</label>
                                    <Select value={formData.learning_style} onValueChange={(value) => updateFormField('learning_style', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your learning style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {learningStyles.map((style) => (
                                                <SelectItem key={style.value} value={style.value}>
                                                    {style.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Difficulty Preference</label>
                                    <Select value={formData.difficulty_preference} onValueChange={(value) => updateFormField('difficulty_preference', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium mb-2">Learning Goals</label>
                                <Textarea
                                    value={formData.learning_goals}
                                    onChange={(e) => updateFormField('learning_goals', e.target.value)}
                                    placeholder="What do you want to achieve with your learning?"
                                    rows={3}
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-500 mt-1">{formData.learning_goals.length}/1000 characters</p>
                            </div>

                            <div className="mt-6">
                                <SubjectSelector
                                    selectedSubjects={formData.subjects_of_interest}
                                    onSubjectChange={handleSubjectChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Parent-specific fields */}
                    {role === 'parent' && (
                        <div>
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-green-600" />
                                Parent Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Occupation</label>
                                    <Input
                                        value={formData.occupation}
                                        onChange={(e) => updateFormField('occupation', e.target.value)}
                                        placeholder="Your profession or job title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Education Level</label>
                                    <Select value={formData.education_level} onValueChange={(value) => updateFormField('education_level', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your education level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {educationLevels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Number of Children</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.number_of_children}
                                        onChange={(e) => updateFormField('number_of_children', e.target.value)}
                                        placeholder="How many children do you have?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Children&apos;s Age Range</label>
                                    <Select value={formData.children_age_range} onValueChange={(value) => updateFormField('children_age_range', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select age range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {childrenAgeRanges.map((range) => (
                                                <SelectItem key={range} value={range}>
                                                    {range}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Parenting Experience</label>
                                    <Select value={formData.parenting_experience} onValueChange={(value) => updateFormField('parenting_experience', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your parenting experience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {parentingExperience.map((exp) => (
                                                <SelectItem key={exp.value} value={exp.value}>
                                                    {exp.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Website</label>
                                <Input
                                    value={formData.website}
                                    onChange={(e) => updateFormField('website', e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                    className={errors.website ? "border-red-500" : ""}
                                />
                                {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                                <Input
                                    value={formData.linkedin_url}
                                    onChange={(e) => updateFormField('linkedin_url', e.target.value)}
                                    placeholder="https://linkedin.com/in/username"
                                    className={errors.linkedin_url ? "border-red-500" : ""}
                                />
                                {errors.linkedin_url && <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">GitHub URL</label>
                                <Input
                                    value={formData.github_url}
                                    onChange={(e) => updateFormField('github_url', e.target.value)}
                                    placeholder="https://github.com/username"
                                    className={errors.github_url ? "border-red-500" : ""}
                                />
                                {errors.github_url && <p className="text-red-500 text-sm mt-1">{errors.github_url}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Twitter URL</label>
                                <Input
                                    value={formData.twitter_url}
                                    onChange={(e) => updateFormField('twitter_url', e.target.value)}
                                    placeholder="https://twitter.com/username"
                                    className={errors.twitter_url ? "border-red-500" : ""}
                                />
                                {errors.twitter_url && <p className="text-red-500 text-sm mt-1">{errors.twitter_url}</p>}
                            </div>
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
});

export default ProfileEditForm;

