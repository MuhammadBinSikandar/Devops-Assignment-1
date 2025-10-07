"use client";

import { useState, useMemo, useCallback, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { subjectCategories } from '@/lib/profile-data';

const SubjectSelector = memo(function SubjectSelector({ selectedSubjects = [], onSubjectChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});

    // Memoized filtered categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return subjectCategories;

        const filtered = {};
        Object.entries(subjectCategories).forEach(([category, subjects]) => {
            const matchingSubjects = subjects.filter(subject =>
                subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matchingSubjects.length > 0) {
                filtered[category] = matchingSubjects;
            }
        });
        return filtered;
    }, [searchTerm]);

    // Optimized subject toggle handler
    const handleSubjectToggle = useCallback((subject) => {
        const currentSubjects = Array.isArray(selectedSubjects) ? selectedSubjects : [];

        if (currentSubjects.includes(subject)) {
            onSubjectChange(currentSubjects.filter(s => s !== subject));
        } else {
            onSubjectChange([...currentSubjects, subject]);
        }
    }, [selectedSubjects, onSubjectChange]);

    // Category toggle handler
    const toggleCategory = useCallback((category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    }, []);

    // Select all subjects in category
    const selectAllInCategory = useCallback((category) => {
        const categorySubjects = subjectCategories[category] || [];
        const currentSubjects = Array.isArray(selectedSubjects) ? selectedSubjects : [];
        const newSubjects = Array.from(new Set([...currentSubjects, ...categorySubjects]));
        onSubjectChange(newSubjects);
    }, [selectedSubjects, onSubjectChange]);

    // Clear search and expand all if searching
    const shouldExpandAll = searchTerm.length > 0;

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Subjects of Interest</label>
                <p className="text-sm text-gray-600 mb-3">Select subjects that interest you</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Selected: {Array.isArray(selectedSubjects) ? selectedSubjects.length : 0} subjects
                </p>
                {Array.isArray(selectedSubjects) && selectedSubjects.length > 0 && (
                    <button
                        onClick={() => onSubjectChange([])}
                        className="text-sm text-red-600 hover:text-red-700"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Subject categories */}
            <div className="border rounded-lg max-h-80 overflow-y-auto">
                {Object.entries(filteredCategories).map(([category, subjects]) => {
                    const isExpanded = shouldExpandAll || expandedCategories[category];
                    const selectedInCategory = subjects.filter(subject =>
                        Array.isArray(selectedSubjects) && selectedSubjects.includes(subject)
                    ).length;

                    return (
                        <div key={category} className="border-b border-gray-200 last:border-b-0">
                            {/* Category header */}
                            <div
                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                onClick={() => toggleCategory(category)}
                            >
                                <div className="flex items-center space-x-2">
                                    {shouldExpandAll ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                                    )}
                                    <span className="font-medium text-gray-700">{category}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {selectedInCategory}/{subjects.length}
                                    </Badge>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectAllInCategory(category);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                                >
                                    Select All
                                </button>
                            </div>

                            {/* Category subjects */}
                            {isExpanded && (
                                <div className="p-3 bg-white">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {subjects.map((subject) => (
                                            <label
                                                key={subject}
                                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(selectedSubjects) && selectedSubjects.includes(subject)}
                                                    onChange={() => handleSubjectToggle(subject)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{subject}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected subjects preview */}
            {Array.isArray(selectedSubjects) && selectedSubjects.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Subjects:</p>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {selectedSubjects.map((subject) => (
                            <Badge
                                key={subject}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-red-100"
                                onClick={() => handleSubjectToggle(subject)}
                            >
                                {subject} ×
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default SubjectSelector;

