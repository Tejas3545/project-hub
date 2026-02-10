'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: 'comment' | 'like' | 'approval' | 'system';
}

// localStorage key for tracking read notifications
const READ_NOTIFICATIONS_KEY = 'project-hub-read-notifications';

// Get read notification IDs from localStorage
function getReadNotifications(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

// Save read notification IDs to localStorage
function saveReadNotifications(readIds: Set<string>) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...readIds]));
    } catch (error) {
        console.error('Failed to save read notifications:', error);
    }
}

// Generate consistent mock notifications
function getMockNotifications(readIds: Set<string>): Notification[] {
    return [
        {
            id: 'notif-1',
            message: '🎉 Welcome to Project Hub!',
            isRead: readIds.has('notif-1'),
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            type: 'system',
        },
        {
            id: 'notif-2',
            message: '💡 Tip: Save projects to your workspace for quick access',
            isRead: readIds.has('notif-2'),
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            type: 'system',
        },
        {
            id: 'notif-3',
            message: '📚 Explore projects by difficulty level using filters',
            isRead: readIds.has('notif-3'),
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            type: 'system',
        },
    ];
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadNotifications = () => {
        try {
            // TODO: Replace with actual API call
            // const response = await notificationApi.getAll();
            
            const readIds = getReadNotifications();
            const mockNotifications = getMockNotifications(readIds);
            
            setNotifications(mockNotifications);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = (notificationId: string) => {
        const readIds = getReadNotifications();
        readIds.add(notificationId);
        saveReadNotifications(readIds);
        
        setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
        ));
    };

    const markAllAsRead = () => {
        const readIds = getReadNotifications();
        notifications.forEach(n => readIds.add(n.id));
        saveReadNotifications(readIds);
        
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const clearAllNotifications = () => {
        if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            const readIds = getReadNotifications();
            notifications.forEach(n => readIds.add(n.id));
            saveReadNotifications(readIds);
            setNotifications([]);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const typeColors = {
        comment: 'border-primary/30 bg-blue-accent',
        like: 'border-cyan-500/30 bg-cyan-accent',
        approval: 'border-green-500/30 bg-success-accent',
        system: 'border-purple-500/30 bg-purple-accent',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
                    <p className="mt-4 text-muted-foreground">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 relative">
            {/* Decorative gradient backgrounds */}
            <div className="fixed top-20 right-10 w-96 h-96 gradient-purple-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-10 w-80 h-80 gradient-blue-purple opacity-5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="text-muted-foreground hover:text-primary transition-colors text-sm mb-4 inline-block"
                    >
                        ← Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient-cyan-blue mb-2">
                                Notifications
                            </h1>
                            <p className="text-muted-foreground">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-blue-accent text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'all'
                                ? 'gradient-blue-purple text-white shadow-md shadow-primary/20'
                                : 'bg-card text-muted-foreground hover:bg-muted/50 border border-border/30'
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'unread'
                                ? 'gradient-blue-purple text-white shadow-md shadow-primary/20'
                                : 'bg-card text-muted-foreground hover:bg-muted/50 border border-border/30'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-card border border-border/30 rounded-xl p-12 text-center hover-lift">
                        <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            No {filter === 'unread' ? 'unread' : ''} notifications
                        </h3>
                        <p className="text-muted-foreground">
                            {filter === 'unread' ? 'You\'re all caught up!' : 'Notifications will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-card border border-border/30 rounded-xl p-4 cursor-pointer hover:border-primary/30 hover-lift transition-all ${
                                    !notification.isRead ? 'border-l-4 border-l-primary' : ''
                                }`}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        markAsRead(notification.id);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${typeColors[notification.type]}`}>
                                        {notification.type === 'comment' && (
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        )}
                                        {notification.type === 'like' && (
                                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        )}
                                        {notification.type === 'approval' && (
                                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {notification.type === 'system' && (
                                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 animate-pulse-slow" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
