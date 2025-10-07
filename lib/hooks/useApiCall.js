import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import apiCache from '@/lib/api-cache';

/**
 * Custom hook for making cached API calls with proper loading states and cleanup
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {number} options.cacheTimeMs - Cache time in milliseconds (default: 5 minutes)
 * @param {boolean} options.enableCache - Whether to use caching (default: true)
 * @returns {Object} - { data, loading, error, refetch, clearCache }
 */
export function useApiCall(endpoint, options = {}) {
    const {
        debounceMs = 300,
        cacheTimeMs = 5 * 60 * 1000, // 5 minutes
        enableCache = true
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const abortControllerRef = useRef(null);
    const timeoutRef = useRef(null);

    const makeRequest = useCallback(async (params = {}, method = 'POST') => {
        // Prevent multiple simultaneous calls
        if (loading) return;

        // Generate cache key
        const cacheKey = enableCache ? apiCache.generateKey(endpoint, params) : null;
        
        // Check cache first
        if (enableCache && cacheKey) {
            const cachedData = apiCache.get(cacheKey);
            if (cachedData) {
                setData(cachedData);
                return cachedData;
            }
        }

        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError(null);

        try {
            const config = {
                signal: abortControllerRef.current.signal,
                ...options.axiosConfig
            };

            let result;
            if (method.toUpperCase() === 'GET') {
                result = await axios.get(endpoint, { ...config, params });
            } else {
                result = await axios.post(endpoint, params, config);
            }

            if (!abortControllerRef.current.signal.aborted) {
                setData(result.data);
                
                // Cache the result
                if (enableCache && cacheKey) {
                    apiCache.set(cacheKey, result.data, cacheTimeMs);
                }
                
                return result.data;
            }
        } catch (err) {
            if (!axios.isCancel(err) && !abortControllerRef.current?.signal.aborted) {
                const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
                setError(errorMessage);
                console.error(`API Error (${endpoint}):`, err);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, [endpoint, loading, enableCache, cacheTimeMs, options.axiosConfig]);

    const debouncedRequest = useCallback((params = {}, method = 'POST') => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            makeRequest(params, method);
        }, debounceMs);
    }, [makeRequest, debounceMs]);

    const refetch = useCallback((params = {}, method = 'POST') => {
        // Clear cache for this endpoint
        if (enableCache) {
            const cacheKey = apiCache.generateKey(endpoint, params);
            apiCache.delete(cacheKey);
        }
        
        return makeRequest(params, method);
    }, [makeRequest, endpoint, enableCache]);

    const clearCache = useCallback(() => {
        if (enableCache) {
            // Clear all cache entries for this endpoint
            const stats = apiCache.getStats();
            stats.keys.forEach(key => {
                if (key.startsWith(endpoint)) {
                    apiCache.delete(key);
                }
            });
        }
    }, [endpoint, enableCache]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        data,
        loading,
        error,
        makeRequest: debouncedRequest,
        refetch,
        clearCache
    };
}

/**
 * Hook specifically for study materials API
 */
export function useStudyMaterials(courseId) {
    const {
        data: studyTypeContent,
        loading,
        error,
        makeRequest,
        refetch
    } = useApiCall('/api/study-type', {
        debounceMs: 300,
        cacheTimeMs: 5 * 60 * 1000 // 5 minutes
    });

    const fetchStudyMaterials = useCallback(() => {
        if (!courseId) return;
        
        makeRequest({
            courseId,
            studyType: 'ALL'
        });
    }, [courseId, makeRequest]);

    useEffect(() => {
        fetchStudyMaterials();
    }, [fetchStudyMaterials]);

    return {
        studyTypeContent: studyTypeContent || [],
        loading,
        error,
        refetch: () => refetch({ courseId, studyType: 'ALL' })
    };
}