import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';

export function useConnections() {
    const [connections, setConnections] = useState({ pendingRequests: [], acceptedConnections: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userProfile } = useSupabase();

    useEffect(() => {
        if (!userProfile) return;

        const fetchConnections = async () => {
            try {
                setLoading(true);

                // Check cache first
                const cacheKey = `connections_${userProfile.id}`;
                const cachedConnections = sessionStorage.getItem(cacheKey);
                const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
                const cacheExpiry = 3 * 60 * 1000; // 3 minutes for connections

                if (cachedConnections && cacheTimestamp) {
                    const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
                    if (!isExpired) {
                        setConnections(JSON.parse(cachedConnections));
                        setLoading(false);
                        return;
                    }
                }

                // Fetch from API if not cached or expired
                const response = await fetch('/api/connections');

                if (!response.ok) {
                    throw new Error('Failed to fetch connections');
                }

                const data = await response.json();
                setConnections(data);

                // Cache the result
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, [userProfile]);

    // Get connected students for parent users
    const getConnectedStudents = () => {
        if (!userProfile || userProfile.role.toLowerCase() !== 'parent') {
            return [];
        }

        // Ensure we're comparing the same types (both should be numbers)
        const parentId = parseInt(userProfile.id);

        return connections.acceptedConnections
            .filter(conn => parseInt(conn.parentId) === parentId)
            .map(conn => ({
                id: conn.studentId.toString(),
                name: conn.studentName,
                email: conn.studentEmail,
                connectionId: conn.id
            }));
    };

    // Get connected parent for student users
    const getConnectedParent = () => {
        if (!userProfile || userProfile.role.toLowerCase() !== 'student') {
            return null;
        }

        const connection = connections.acceptedConnections
            .find(conn => conn.studentId === userProfile.id);

        return connection ? {
            id: connection.parentId,
            name: connection.parentName,
            email: connection.parentEmail,
            connectionId: connection.id
        } : null;
    };

    const refetchConnections = async (forceRefresh = false) => {
        if (!userProfile) return;

        try {
            setLoading(true);

            if (forceRefresh) {
                // Clear cache for force refresh
                const cacheKey = `connections_${userProfile.id}`;
                sessionStorage.removeItem(cacheKey);
                sessionStorage.removeItem(`${cacheKey}_timestamp`);
            }

            // Check cache first
            const cacheKey = `connections_${userProfile.id}`;
            const cachedConnections = sessionStorage.getItem(cacheKey);
            const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
            const cacheExpiry = 3 * 60 * 1000; // 3 minutes for connections

            if (!forceRefresh && cachedConnections && cacheTimestamp) {
                const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
                if (!isExpired) {
                    setConnections(JSON.parse(cachedConnections));
                    setLoading(false);
                    return;
                }
            }

            // Fetch from API
            const response = await fetch('/api/connections');

            if (!response.ok) {
                throw new Error('Failed to fetch connections');
            }

            const data = await response.json();
            setConnections(data);

            // Cache the result
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        connections,
        loading,
        error,
        getConnectedStudents,
        getConnectedParent,
        refetch: refetchConnections
    };
}
