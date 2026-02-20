'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { notificationApi } from '@/lib/api';

interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: 'comment' | 'like' | 'approval' | 'system';
}

// localStorage key for tracking read notifications (Fallback for demo/offline)
const READ_NOTIFICATIONS_KEY = 'project-hub-read-notifications';

function getReadNotifications(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

function saveReadNotifications(readIds: Set<string>) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...readIds]));
    } catch (error) {
        console.error('Failed to save read notifications:', error);
    }
}

function getMockNotifications(readIds: Set<string>): Notification[] {
    return [
        {
            id: 'notif-1',
            message: '🎉 Welcome to Project Hub! We\'re excited to have you here.',
            isRead: readIds.has('notif-1'),
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            type: 'system',
        },
        {
            id: 'notif-2',
            message: '💡 Pro Tip: Save projects to your workspace for quick access later.',
            isRead: readIds.has('notif-2'),
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            type: 'system',
        },
        {
            id: 'notif-3',
            message: '📚 Explore projects by difficulty level using the new filters.',
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
        if (user) {
            loadNotifications();
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationApi.getNotifications(1, 50);

            let data = response.notifications || [];
            const readIds = getReadNotifications();

            // Fallback to mock data if API is empty
            if (data.length === 0) {
                data = getMockNotifications(readIds);
            }

            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            const readIds = getReadNotifications();
            setNotifications(getMockNotifications(readIds));
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        const readIds = getReadNotifications();
        readIds.add(notificationId);
        saveReadNotifications(readIds);

        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
        ));

        try {
            await notificationApi.markAsRead(notificationId);
        } catch (error) {
            // Silently fail as we already updated UI and local storage
        }
    };

    const markAllAsRead = async () => {
        const readIds = getReadNotifications();
        notifications.forEach(n => readIds.add(n.id));
        saveReadNotifications(readIds);

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        try {
            await notificationApi.markAllAsRead();
        } catch (error) {
            // Silently fail
        }
    };

    const clearAllNotifications = () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const NOTIFICATION_ICONS: Record<string, string> = {
        comment: 'chat_bubble',
        like: 'favorite',
        approval: 'verified',
        system: 'info',
        default: 'notifications',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight">
                        Notifications
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
                            : "You're all caught up! Nice work."}
                    </p>
                </div>

                <div className="flex gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all text-sm font-bold active:scale-95"
                        >
                            Mark all as read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAllNotifications}
                            className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm font-bold active:scale-95"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1.5 bg-secondary rounded-lg w-fit border border-border">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${filter === 'all'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                >
                    All ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${filter === 'unread'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white border border-border p-20 text-center rounded-xl">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                            <span className="material-symbols-outlined text-muted-foreground text-4xl">notifications_off</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            Nothing to see here
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {filter === 'unread' ? "You've read all your notifications. Stay tuned for new updates!" : "Your activity and system updates will appear here."}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                            className={`relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${notification.isRead
                                ? 'bg-white border-border bg-transparent opacity-60 hover:opacity-100 hover:bg-secondary'
                                : 'bg-white border-primary/20 bg-primary/5 hover:border-primary/30'
                                }`}
                        >
                            <div className="flex gap-5">
                                {/* Icon */}
                                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${!notification.isRead
                                    ? 'bg-primary/20 border-primary/30 text-primary'
                                    : 'bg-secondary border-border text-muted-foreground'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <p className={`text-base leading-relaxed ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-bold'}`}>
                                            {notification.message}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap pt-1 uppercase tracking-widest">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
                                            <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                                            <span className="text-[9px] font-black text-primary uppercase tracking-tighter">New Update</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
