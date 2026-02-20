import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// Get all notifications for the authenticated user
export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required' });

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where: { userId } }),
        ]);

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false },
        });

        res.json({ notifications, total, unreadCount, page, limit });
    } catch (error) {
        console.error('Failed to get notifications:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
};

// Mark a single notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required' });

        const notificationId = req.params.notificationId as string;

        await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required' });

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to mark all as read:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required' });

        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });

        res.json({ count });
    } catch (error) {
        console.error('Failed to get unread count:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
};
