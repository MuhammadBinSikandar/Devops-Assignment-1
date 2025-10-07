"use client";

import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";

// Simple icon replacements to reduce bundle size
const icons = {
    users: "👥", clock: "⏰", check: "✅", x: "❌", mail: "📧",
    calendar: "📅", search: "🔍", filter: "🔽", userCheck: "✅",
    userX: "❌", ban: "🚫", rotate: "🔄"
};

const AdminDashboard = memo(function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all"); // all, pending, approved, rejected, suspended
    const [isInitialized, setIsInitialized] = useState(false);
    const fetchingRef = useRef(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0
    });

    const fetchUsers = useCallback(async () => {
        if (fetchingRef.current) return; // Prevent multiple simultaneous calls

        fetchingRef.current = true;
        setLoading(true);
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);

                // Optimized stats calculation
                const newStats = data.users.reduce((acc, user) => {
                    acc.total++;
                    if (user.isSuspended) {
                        acc.suspended++;
                    } else if (user.isApproved === null || user.isApproved === false) {
                        if (user.role === 'admin') {
                            acc.approved++; // Admins are automatically considered approved for stats
                        } else {
                            acc.pending++;
                        }
                    } else if (user.isApproved) {
                        acc.approved++;
                    }
                    return acc;
                }, { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 });

                setStats(newStats);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    const approveUser = useCallback(async (userId) => {
        setProcessing(prev => ({ ...prev, [userId]: 'approving' }));
        try {
            const response = await fetch(`/api/admin/users/${userId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                await fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error approving user:', error);
        } finally {
            setProcessing(prev => ({ ...prev, [userId]: null }));
        }
    }, [fetchUsers]);

    const rejectUser = useCallback(async (userId) => {
        setProcessing(prev => ({ ...prev, [userId]: 'rejecting' }));
        try {
            const response = await fetch(`/api/admin/users/${userId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                await fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
        } finally {
            setProcessing(prev => ({ ...prev, [userId]: null }));
        }
    }, [fetchUsers]);

    const suspendUser = useCallback(async (userId) => {
        const reason = prompt('Enter suspension reason (optional):') || 'Account suspended by admin';
        if (reason === null) return; // User cancelled

        setProcessing(prev => ({ ...prev, [userId]: 'suspending' }));
        try {
            const response = await fetch(`/api/admin/users/${userId}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                await fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error suspending user:', error);
        } finally {
            setProcessing(prev => ({ ...prev, [userId]: null }));
        }
    }, [fetchUsers]);

    const unsuspendUser = useCallback(async (userId) => {
        setProcessing(prev => ({ ...prev, [userId]: 'unsuspending' }));
        try {
            const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                await fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error unsuspending user:', error);
        } finally {
            setProcessing(prev => ({ ...prev, [userId]: null }));
        }
    }, [fetchUsers]);

    useEffect(() => {
        if (!isInitialized) {
            fetchUsers();
            setIsInitialized(true);
        }
    }, [isInitialized, fetchUsers]);

    const filteredUsers = useMemo(() => {
        if (!users.length) return [];

        return users.filter(user => {
            const matchesSearch = !searchTerm ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = (() => {
                switch (filter) {
                    case 'pending':
                        return (user.isApproved === null || user.isApproved === false) && user.role !== 'admin' && !user.isSuspended;
                    case 'approved':
                        return (user.isApproved === true || user.role === 'admin') && !user.isSuspended;
                    case 'rejected':
                        return user.isApproved === false && user.role !== 'admin' && !user.isSuspended;
                    case 'suspended':
                        return user.isSuspended === true;
                    default:
                        return true;
                }
            })();

            return matchesSearch && matchesFilter;
        });
    }, [users, searchTerm, filter]);

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const getUserStatus = useCallback((user) => {
        if (user.isSuspended) {
            return { label: 'Suspended', color: 'bg-red-100 text-red-800' };
        }
        if (user.role === 'admin') {
            return { label: 'Admin', color: 'bg-purple-100 text-purple-800' };
        }
        if (user.isApproved === true) {
            return { label: 'Approved', color: 'bg-green-100 text-green-800' };
        }
        if (user.isApproved === false) {
            return { label: 'Rejected', color: 'bg-orange-100 text-orange-800' };
        }
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    }, []);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                    { label: "Total Users", value: stats.total, icon: icons.users, bg: "bg-blue-100", color: "text-blue-600" },
                    { label: "Pending", value: stats.pending, icon: icons.clock, bg: "bg-yellow-100", color: "text-yellow-600" },
                    { label: "Approved", value: stats.approved, icon: icons.check, bg: "bg-green-100", color: "text-green-600" },
                    { label: "Rejected", value: stats.rejected, icon: icons.x, bg: "bg-red-100", color: "text-red-600" },
                    { label: "Suspended", value: stats.suspended, icon: icons.ban, bg: "bg-gray-100", color: "text-gray-600" }
                ].map((stat, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                <span className={`text-lg ${stat.color}`}>{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters and Search */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icons.search}</span>
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400">{icons.filter}</span>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Users</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        onClick={fetchUsers}
                        disabled={loading || fetchingRef.current}
                        variant="outline"
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading || fetchingRef.current ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                </div>
            </Card>

            {/* Users List */}
            <Card className="p-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        User Management {filter !== 'all' && `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                    </h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="text-4xl text-gray-400 block mb-4">{icons.users}</span>
                            <p className="text-gray-500">No users found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUsers.map((user) => {
                                const status = getUserStatus(user);
                                const isProcessing = processing[user.id];
                                const isPending = (user.isApproved === null || user.isApproved === false) && user.role !== 'admin' && !user.isSuspended;
                                const isSuspended = user.isSuspended;
                                const isApproved = user.isApproved && !user.isSuspended;

                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {user.name}
                                                    </p>
                                                    <Badge className={status.color}>
                                                        {status.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <div className="flex items-center space-x-1 text-gray-500">
                                                        <span className="text-xs">{icons.mail}</span>
                                                        <p className="text-xs truncate">{user.email}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-gray-500">
                                                        <span className="text-xs">{icons.calendar}</span>
                                                        <p className="text-xs">
                                                            Joined {formatDate(user.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {user.role !== 'admin' && (
                                            <div className="flex items-center space-x-2">
                                                {isPending && (
                                                    <>
                                                        <Button
                                                            onClick={() => approveUser(user.id)}
                                                            disabled={isProcessing}
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                                        >
                                                            {isProcessing === 'approving' ? (
                                                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                                            ) : (
                                                                <span className="mr-1">{icons.userCheck}</span>
                                                            )}
                                                            Approve
                                                        </Button>

                                                        <Button
                                                            onClick={() => rejectUser(user.id)}
                                                            disabled={isProcessing}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-300 text-red-700 hover:bg-red-50 text-xs"
                                                        >
                                                            {isProcessing === 'rejecting' ? (
                                                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                                            ) : (
                                                                <span className="mr-1">{icons.userX}</span>
                                                            )}
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                {isSuspended ? (
                                                    <Button
                                                        onClick={() => unsuspendUser(user.id)}
                                                        disabled={isProcessing}
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                                    >
                                                        {isProcessing === 'unsuspending' ? (
                                                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                                        ) : (
                                                            <span className="mr-1">{icons.rotate}</span>
                                                        )}
                                                        Unsuspend
                                                    </Button>
                                                ) : isApproved && (
                                                    <Button
                                                        onClick={() => suspendUser(user.id)}
                                                        disabled={isProcessing}
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                                                    >
                                                        {isProcessing === 'suspending' ? (
                                                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                                        ) : (
                                                            <span className="mr-1">{icons.ban}</span>
                                                        )}
                                                        Suspend
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
});

export default AdminDashboard;
