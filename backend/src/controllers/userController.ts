import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

// Get all bookmarks for authenticated user
export const getUserBookmarks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Simplified for mock database
        const bookmarks = await prisma.bookmark.findMany();
        const userBookmarks = bookmarks.filter((b: any) => b.userId === req.user!.id);

        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
};

// Toggle bookmark (add or remove)
export const toggleBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

        // Check if bookmark already exists
        const allBookmarks = await prisma.bookmark.findMany();
        const existing = allBookmarks.find((b: any) => b.userId === req.user!.id && b.projectId === projectId);

        if (existing) {
            // Remove bookmark
            const allBookmarks = await prisma.bookmark.findMany();
            const index = allBookmarks.findIndex((b: any) => b.userId === req.user!.id && b.projectId === projectId);
            if (index !== -1) {
                allBookmarks.splice(index, 1);
            }
            res.json({ bookmarked: false, message: 'Bookmark removed' });
        } else {
            // Add bookmark
            await prisma.bookmark.create({
                data: {
                    userId: req.user.id,
                    projectId,
                },
            });
            res.json({ bookmarked: true, message: 'Project bookmarked' });
        }
    } catch (error) {
        next(error);
    }
};

// Check if project is bookmarked
export const checkBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.json({ bookmarked: false });
        }

        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                userId_projectId: {
                    userId: req.user.id,
                    projectId,
                },
            },
        });

        res.json({ bookmarked: !!bookmark });
    } catch (error) {
        next(error);
    }
};

// Get user's project progress
export const getUserProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const progress = await prisma.projectProgress.findMany({
            where: { userId: req.user.id },
            include: {
                project: {
                    include: {
                        domain: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.json(progress);
    } catch (error) {
        next(error);
    }
};

// Update project progress
export const updateProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const { status, notes } = req.body;

        const progress = await prisma.projectProgress.upsert({
            where: {
                userId_projectId: {
                    userId: req.user.id,
                    projectId,
                },
            },
            update: {
                status,
                notes,
                startedAt: status === 'IN_PROGRESS' && !req.body.startedAt ? new Date() : undefined,
                completedAt: status === 'COMPLETED' ? new Date() : null,
                updatedAt: new Date(),
            },
            create: {
                userId: req.user.id,
                projectId,
                status,
                notes,
                startedAt: status === 'IN_PROGRESS' ? new Date() : undefined,
                completedAt: status === 'COMPLETED' ? new Date() : null,
            },
            include: {
                project: true,
            },
        });

        res.json(progress);
    } catch (error) {
        next(error);
    }
};

// Get progress for specific project
export const getProjectProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.json({ status: 'NOT_STARTED' });
        }

        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

        const progress = await prisma.projectProgress.findUnique({
            where: {
                userId_projectId: {
                    userId: req.user.id,
                    projectId,
                },
            },
        });

        res.json(progress || { status: 'NOT_STARTED' });
    } catch (error) {
        next(error);
    }
};
