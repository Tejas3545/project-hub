'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
    achievement: '🏆',
    project: '📋',
    comment: '💬',
    like: '❤️',
    message: '📩',
    system: 'ℹ️',
    warning: '⚠️',
    default: '🔔',
};

const POLLING_INTERVAL = 30000; // 30 seconds for real-time updates

export default function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const hasLoadedRef = useRef(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const loadNotifications = useCallback(async () => {
        if (!session?.accessToken) return;

        try {
            setIsLoading(true);
            const response = await notificationApi.getNotifications(1, 30, session.accessToken);
            setNotifications(response.notifications || []);
            setUnreadCount(response.unreadCount || 0);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // Keep existing notifications on error
        } finally {
            setIsLoading(false);
        }
    }, [session?.accessToken]);

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!session?.accessToken) return;
        try {
            await notificationApi.markAsRead(notificationId, session.accessToken);
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, [session?.accessToken]);

    const markAllAsRead = useCallback(async () => {
        if (!session?.accessToken) return;
        try {
            await notificationApi.markAllAsRead(session.accessToken);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                closePanel();
            }, 1500);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [session?.accessToken]);

    const openPanel = useCallback(() => {
        setIsOpen(true);
        setIsAnimating(true);
    }, []);

    const closePanel = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => setIsOpen(false), 150);
    }, []);

    const togglePanel = useCallback(() => {
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }, [isOpen, closePanel, openPanel]);

    useEffect(() => {
        if (session?.accessToken && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadNotifications();
        }
    }, [session?.accessToken, loadNotifications]);

    // Real-time polling: refresh notifications every 30 seconds when panel is open
    useEffect(() => {
        if (isOpen && session?.accessToken) {
            loadNotifications();

            // Set up polling interval
            pollingIntervalRef.current = setInterval(() => {
                loadNotifications();
            }, POLLING_INTERVAL);
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [isOpen, session?.accessToken, loadNotifications]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                closePanel();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePanel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const formatTime = useCallback((dateString: string) => {
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
    }, []);

    if (!session) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Icon Button */}
            <button
                onClick={togglePanel}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Notifications"
                aria-expanded={isOpen ? "true" : "false"}
                aria-haspopup="true"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel - 100% OPAQUE with backdrop blur */}
            {isOpen && (
                <div 
                    className={`absolute right-0 mt-4 w-80 sm:w-96 border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px] transform origin-top-right transition-all duration-150 ease-out backdrop-blur-xl ${
                        isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
                    }`}
                    style={{ backgroundColor: 'hsl(var(--card))', backdropFilter: 'blur(12px)' }}
                >
                    {/* Success Message Overlay */}
                    {showSuccess && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--card))' }}>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-success-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-500 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                </div>
                                <p className="text-foreground font-semibold text-base">All caught up!</p>
                                <p className="text-muted-foreground text-sm mt-1">No more unread notifications</p>
                            </div>
                        </div>
                    )}

                    {/* Header Section - SOLID BACKGROUND */}
                    <div className="px-4 py-4 border-b border-border" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-foreground text-lg">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={showSuccess}
                                    className="ml-2 px-3 py-1.5 gradient-blue-purple text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 hover:shadow-lg"
                                >
                                    Mark all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List - Scrollable */}
                    <div className="overflow-y-auto flex-1 min-h-[200px] bg-card">
                        {isLoading && notifications.length === 0 ? (
                            <div className="p-8 text-center space-y-3">
                                <div className="flex justify-center">
                                    <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center space-y-3">
                                <div className="w-14 h-14 bg-blue-accent rounded-full flex items-center justify-center mx-auto text-2xl border border-primary/20">
                                    🔔
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">No notifications yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">You&apos;re all set!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:translate-x-0.5 ${
                                            !notification.isRead 
                                                ? 'bg-blue-accent hover:bg-blue-accent border-l-4 border-l-primary' 
                                                : 'hover:bg-muted border-l-4 border-l-transparent'
                                        }`}
                                        onClick={() => {
                                            if (!notification.isRead) {
                                                markAsRead(notification.id);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Notification Icon */}
                                            <div className="shrink-0 mt-0.5 text-lg">
                                                {NOTIFICATION_ICONS[notification.type || 'default']}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm line-clamp-2 ${
                                                    !notification.isRead 
                                                        ? 'text-foreground font-semibold' 
                                                        : 'text-foreground/80 font-medium'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Unread Indicator */}
                                            {!notification.isRead && (
                                                <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shadow-md animate-pulse-slow" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-border/50 bg-muted/50 text-center">
                            <Link
                                href="/notifications"
                                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                                onClick={closePanel}
                            >
                                <span>View all notifications</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
