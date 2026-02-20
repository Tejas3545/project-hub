'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/lib/AuthContext';
import { notificationApi } from '@/lib/api';
import Link from 'next/link';

interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type?: string;
    relatedProjectId?: string;
    icon?: string;
}

const NOTIFICATION_ICONS: Record<string, string> = {
    achievement: 'trophy',
    project: 'assignment',
    comment: 'chat_bubble',
    like: 'favorite',
    message: 'mail',
    system: 'info',
    warning: 'warning',
    default: 'notifications',
};

const POLLING_INTERVAL = 60000; // 1 minute for polling

export default function NotificationBell() {
    const { data: session } = useSession();
    const { user: authUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const hasLoadedRef = useRef(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentUser = session?.user || authUser;

    const loadNotifications = useCallback(async () => {
        if (!currentUser) return;

        try {
            setIsLoading(true);
            const response = await notificationApi.getNotifications(1, 30);

            // Handle both array and object response formats
            const fetchedNotifs = Array.isArray(response) ? response : (response.notifications || []);
            const fetchedUnread = typeof response.unreadCount === 'number' ? response.unreadCount : fetchedNotifs.filter((n: { isRead?: boolean }) => !n.isRead).length;

            // Do NOT use mock notifications as fallback if API is empty/failed
            setNotifications(fetchedNotifs);
            setUnreadCount(fetchedUnread);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // On error we keep current state or empty, but no fake data
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await notificationApi.markAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            setShowSuccess(true);

            await notificationApi.markAllAsRead();

            setTimeout(() => {
                setShowSuccess(false);
                closePanel();
            }, 1200);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, []);

    const openPanel = useCallback(() => {
        setIsOpen(true);
        setTimeout(() => setIsAnimating(true), 10);
    }, []);

    const closePanel = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => setIsOpen(false), 200);
    }, []);

    const togglePanel = useCallback(() => {
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }, [isOpen, closePanel, openPanel]);

    useEffect(() => {
        if (currentUser && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadNotifications();
        }
    }, [currentUser, loadNotifications]);

    useEffect(() => {
        if (isOpen && currentUser) {
            loadNotifications();
            pollingIntervalRef.current = setInterval(loadNotifications, POLLING_INTERVAL);
        }
        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [isOpen, currentUser, loadNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                closePanel();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closePanel]);

    const formatTime = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }, []);

    if (!currentUser) return null;

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={togglePanel}
                className={`relative size-9 flex items-center justify-center rounded-lg transition-all duration-150 border ${isOpen
                    ? 'bg-primary/15 border-primary/30 text-foreground'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                aria-label="Notifications"
            >
                <span className="material-symbols-outlined text-lg">notifications</span>

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 mt-3 w-80 z-[100] transform transition-all duration-200 ease-out ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
                        }`}
                >
                    <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[32rem]">
                        {showSuccess && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white animate-in fade-in duration-200">
                                <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mb-3 border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-2xl">done_all</span>
                                </div>
                                <p className="text-foreground font-medium text-sm">All caught up!</p>
                            </div>
                        )}

                        {/* Header */}
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary">
                            <div>
                                <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <p className="text-[10px] text-primary font-medium mt-0.5">
                                        {unreadCount} unread
                                    </p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {isLoading && notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block size-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-3 border border-border">
                                        <span className="material-symbols-outlined text-muted-foreground text-xl">notifications_off</span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-0.5">No notifications</p>
                                    <p className="text-xs text-muted-foreground">You&apos;re all set!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 transition-all duration-150 cursor-pointer group ${!notification.isRead
                                                ? 'bg-primary/5 hover:bg-primary/8'
                                                : 'hover:bg-muted'
                                                }`}
                                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${!notification.isRead
                                                    ? 'bg-primary/15 border-primary/20 text-primary'
                                                    : 'bg-secondary border-border text-muted-foreground'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-lg">
                                                        {NOTIFICATION_ICONS[notification.type || 'default']}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-relaxed ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                                                        }`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatTime(notification.createdAt)}
                                                        </span>
                                                        {!notification.isRead && (
                                                            <span className="size-1.5 rounded-full bg-primary"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 border-t border-border bg-secondary">
                            <Link
                                href="/notifications"
                                className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                onClick={closePanel}
                            >
                                View all
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
