import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

// Get all bookmarks for authenticated user
export const getUserBookmarks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const bookmarks = await prisma.bookmark.findMany({
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
            orderBy: { createdAt: 'desc' },
        });

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
        // Use Prisma upsert-like logic for toggle using the composite unique key
        try {
            const existing = await prisma.bookmark.findUnique({
                where: {
                    userId_projectId: {
                        userId: req.user.id,
                        projectId,
                    },
                },
            });

            if (existing) {
                await prisma.bookmark.delete({
                    where: {
                        userId_projectId: {
                            userId: req.user.id,
                            projectId,
                        },
                    },
                });
                return res.json({ bookmarked: false, message: 'Bookmark removed' });
            }

            await prisma.bookmark.create({
                data: {
                    userId: req.user.id,
                    projectId,
                },
            });

            return res.json({ bookmarked: true, message: 'Project bookmarked' });
        } catch (prismaErr: any) {
            // Handle foreign key / related resource errors (invalid project id)
            if (prismaErr?.code === 'P2003' || prismaErr?.code === 'P2025') {
                return res.status(400).json({ error: 'Invalid reference: related resource does not exist' });
            }
            throw prismaErr;
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

        let progress;
        try {
            progress = await prisma.projectProgress.upsert({
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
        } catch (prismaErr: any) {
            if (prismaErr?.code === 'P2003' || prismaErr?.code === 'P2025') {
                return res.status(400).json({ error: 'Invalid reference: related resource does not exist' });
            }
            throw prismaErr;
        }

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

// ================================
// GitHub Project Progress
// ================================

// Get all github project progress for user
export const getGithubProjectProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const progress = await prisma.gitHubProjectProgress.findMany({
            where: { userId: req.user.id },
            include: {
                githubProject: {
                    include: {
                        domain: {
                            select: { id: true, name: true, slug: true },
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

// Upsert github project progress
export const upsertGithubProjectProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const githubProjectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const { status, notes, timeSpent, checklist } = req.body;

        let progress;
        try {
            progress = await prisma.gitHubProjectProgress.upsert({
                where: {
                    userId_githubProjectId: {
                        userId: req.user.id,
                        githubProjectId,
                    },
                },
                update: {
                    ...(status !== undefined && { status }),
                    ...(notes !== undefined && { notes }),
                    ...(timeSpent !== undefined && { timeSpent }),
                    ...(checklist !== undefined && { checklist }),
                    ...(status === 'COMPLETED' && { completedAt: new Date() }),
                    updatedAt: new Date(),
                },
                create: {
                    userId: req.user.id,
                    githubProjectId,
                    status: status || 'IN_PROGRESS',
                    notes: notes || '',
                    timeSpent: timeSpent || 0,
                    checklist: checklist || [],
                    startedAt: new Date(),
                },
                include: {
                    githubProject: {
                        include: {
                            domain: { select: { id: true, name: true, slug: true } },
                        },
                    },
                },
            });
        } catch (prismaErr: any) {
            if (prismaErr?.code === 'P2003' || prismaErr?.code === 'P2025') {
                return res.status(400).json({ error: 'Invalid reference: GitHub project does not exist' });
            }
            throw prismaErr;
        }

        res.json(progress);
    } catch (error) {
        next(error);
    }
};

// Get progress for specific github project
export const getGithubSingleProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.json({ status: 'NOT_STARTED' });
        }

        const githubProjectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

        const progress = await prisma.gitHubProjectProgress.findUnique({
            where: {
                userId_githubProjectId: {
                    userId: req.user.id,
                    githubProjectId,
                },
            },
        });

        res.json(progress || { status: 'NOT_STARTED' });
    } catch (error) {
        next(error);
    }
};

// Get profile stats for authenticated user
export const getProfileStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.user.id;

        const [uploadedProjects, projectsSaved, projectsStarted, projectsCompleted, likesReceived, upvotesAgg] = await Promise.all([
            prisma.project.count({ where: { createdById: userId } }),
            prisma.bookmark.count({ where: { userId } }),
            prisma.projectProgress.count({ where: { userId, status: 'IN_PROGRESS' } }),
            prisma.projectProgress.count({ where: { userId, status: 'COMPLETED' } }),
            prisma.like.count({ where: { project: { createdById: userId } } }),
            prisma.comment.aggregate({ where: { userId }, _sum: { upvotes: true } }),
        ]);

        res.json({
            uploadedProjects,
            projectsSaved,
            projectsStarted,
            projectsCompleted,
            likesReceived,
            upvotesReceived: upvotesAgg._sum.upvotes || 0,
        });
    } catch (error) {
        next(error);
    }
};

// Get recent activity for authenticated user
export const getActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.user.id;

        const [uploads, likes, comments, progress] = await Promise.all([
            prisma.project.findMany({
                where: { createdById: userId },
                select: { id: true, title: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.like.findMany({
                where: { project: { createdById: userId } },
                select: { id: true, createdAt: true, project: { select: { id: true, title: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.comment.findMany({
                where: { userId },
                select: { id: true, text: true, createdAt: true, project: { select: { id: true, title: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.projectProgress.findMany({
                where: { userId },
                select: { id: true, status: true, updatedAt: true, project: { select: { id: true, title: true } } },
                orderBy: { updatedAt: 'desc' },
                take: 10,
            }),
        ]);

        const activityItems = [
            ...uploads.map((item) => ({
                id: `upload-${item.id}`,
                type: 'project_upload',
                timestamp: item.createdAt.toISOString(),
                projectId: item.id,
                projectTitle: item.title,
            })),
            ...likes.map((item) => ({
                id: `like-${item.id}`,
                type: 'like',
                timestamp: item.createdAt.toISOString(),
                projectId: item.project?.id,
                projectTitle: item.project?.title,
            })),
            ...comments.map((item) => ({
                id: `comment-${item.id}`,
                type: 'comment',
                timestamp: item.createdAt.toISOString(),
                projectId: item.project?.id,
                projectTitle: item.project?.title,
                content: item.text,
            })),
            ...progress.map((item) => ({
                id: `progress-${item.id}`,
                type: 'progress',
                timestamp: item.updatedAt.toISOString(),
                projectId: item.project?.id,
                projectTitle: item.project?.title,
                status: item.status,
            })),
        ]
            .filter((item) => item.projectId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 30);

        res.json(activityItems);
    } catch (error) {
        next(error);
    }
};
