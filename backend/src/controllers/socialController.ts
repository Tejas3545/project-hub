import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// Toggle like on a project
export const toggleProjectLike = async (req: AuthRequest, res: Response) => {
    try {
        const projectId = req.params.projectId as string;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if like exists
        const existingLike = await prisma.like.findFirst({
            where: {
                userId,
                projectId,
            },
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id },
            });

            return res.json({
                liked: false,
                message: 'Project unliked successfully',
            });
        } else {
            // Like
            try {
                await prisma.like.create({
                    data: {
                        userId,
                        projectId,
                    },
                });
            } catch (prismaErr: any) {
                if (prismaErr?.code === 'P2003' || prismaErr?.code === 'P2025') {
                    return res.status(400).json({ error: 'Invalid reference: related resource does not exist' });
                }
                throw prismaErr;
            }

            // Create notification for the project owner
            try {
                const project = await prisma.project.findUnique({
                    where: { id: projectId },
                    select: { createdById: true, title: true },
                });
                if (project?.createdById && project.createdById !== userId) {
                    const liker = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { firstName: true, lastName: true },
                    });
                    const likerName = liker ? `${liker.firstName} ${liker.lastName}` : 'Someone';
                    await prisma.notification.create({
                        data: {
                            userId: project.createdById,
                            message: `${likerName} liked your project "${project.title}"`,
                            type: 'NEW_UPVOTE',
                            relatedProjectId: projectId,
                        },
                    });
                }
            } catch (notifError) {
                // Don't fail the like if notification creation fails
                console.error('Failed to create like notification:', notifError);
            }

            return res.json({
                liked: true,
                message: 'Project liked successfully',
            });
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        return res.status(500).json({ error: 'Failed to toggle like' });
    }
};

// Get like status for a project
export const getProjectLikeStatus = async (req: AuthRequest, res: Response) => {
    try {
        const projectId = req.params.projectId as string;
        const userId = req.user?.id;

        if (!userId) {
            return res.json({ liked: false, count: 0 });
        }

        const [like, likesCount] = await Promise.all([
            prisma.like.findFirst({
                where: {
                    userId,
                    projectId,
                },
            }),
            prisma.like.count({
                where: { projectId },
            }),
        ]);

        return res.json({
            liked: !!like,
            count: likesCount,
        });
    } catch (error) {
        console.error('Get like status error:', error);
        return res.status(500).json({ error: 'Failed to get like status' });
    }
};

// Get project likes count
export const getProjectLikesCount = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.projectId as string;

        const count = await prisma.like.count({
            where: { projectId },
        });

        return res.json({ count });
    } catch (error) {
        console.error('Get likes count error:', error);
        return res.status(500).json({ error: 'Failed to get likes count' });
    }
};

// Add comment to project
export const addProjectComment = async (req: AuthRequest, res: Response) => {
    try {
        const projectId = req.params.projectId as string;
        const { text, parentId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        let comment;
        try {
            comment = await prisma.comment.create({
                data: {
                    text,
                    userId,
                    projectId,
                    parentId: parentId || null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profileImage: true,
                        },
                    },
                },
            });
        } catch (prismaErr: any) {
            if (prismaErr?.code === 'P2003' || prismaErr?.code === 'P2025') {
                return res.status(400).json({ error: 'Invalid reference: related resource does not exist' });
            }
            throw prismaErr;
        }

        // Create notification for the project owner
        try {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { createdById: true, title: true },
            });
            if (project?.createdById && project.createdById !== userId) {
                const commenterName = comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Someone';
                await prisma.notification.create({
                    data: {
                        userId: project.createdById,
                        message: `${commenterName} commented on your project "${project.title}"`,
                        type: 'NEW_COMMENT',
                        relatedProjectId: projectId,
                    },
                });
            }
        } catch (notifError) {
            console.error('Failed to create comment notification:', notifError);
        }

        return res.status(201).json(comment);
    } catch (error) {
        console.error('Add comment error:', error);
        return res.status(500).json({ error: 'Failed to add comment' });
    }
};

// Get project comments
export const getProjectComments = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.projectId as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: { projectId },
                select: {
                    id: true,
                    text: true,
                    userId: true,
                    projectId: true,
                    parentId: true,
                    upvotes: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profileImage: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.comment.count({
                where: { projectId },
            }),
        ]);

        return res.json({
            comments,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get comments error:', error);
        return res.status(500).json({ error: 'Failed to get comments' });
    }
};

// Delete comment (only by comment author or admin)
export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        const commentId = req.params.commentId as string;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                user: true,
            },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user is comment author or admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (comment.userId !== userId && user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        return res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        return res.status(500).json({ error: 'Failed to delete comment' });
    }
};

// Update comment upvotes
export const upvoteComment = async (req: AuthRequest, res: Response) => {
    try {
        const commentId = req.params.commentId as string;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: {
                upvotes: { increment: 1 },
            },
        });

        return res.json(updated);
    } catch (error) {
        console.error('Upvote comment error:', error);
        return res.status(500).json({ error: 'Failed to upvote comment' });
    }
};
