import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

/* =====================================================
   BOOKMARKS
===================================================== */

export const getUserBookmarks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Authentication required' });

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: req.user.id },
            include: {
                project: {
                    include: {
                        domain: { select: { id: true, name: true, slug: true } },
                    },
                },
                githubProject: {
                    include: {
                        domain: { select: { id: true, name: true, slug: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(bookmarks);
    } catch (err) {
        next(err);
    }
};

async function resolveProjectType(id: string): Promise<'project' | 'github'> {
    const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
    return project ? 'project' : 'github';
}

export const toggleBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Authentication required' });

        const projectId = (Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId) as string;
        const type = await resolveProjectType(projectId);

        if (type === 'project') {
            const existing = await prisma.bookmark.findFirst({
                where: { userId: req.user.id, projectId },
            });

            if (existing) {
                await prisma.bookmark.delete({ where: { id: existing.id } });
                return res.json({ bookmarked: false });
            }

            await prisma.bookmark.create({
                data: {
                    user: { connect: { id: req.user.id } },
                    project: { connect: { id: projectId } },
                },
            });
        } else {
            const existing = await prisma.bookmark.findFirst({
                where: { userId: req.user.id, githubProjectId: projectId },
            });

            if (existing) {
                await prisma.bookmark.delete({ where: { id: existing.id } });
                return res.json({ bookmarked: false });
            }

            await prisma.bookmark.create({
                data: {
                    user: { connect: { id: req.user.id } },
                    githubProject: { connect: { id: projectId } },
                },
            });
        }

        res.json({ bookmarked: true });
    } catch (err) {
        next(err);
    }
};

export const checkBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.json({ bookmarked: false });

        const projectId = (Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId) as string;
        const type = await resolveProjectType(projectId);

        const bookmark =
            type === 'project'
                ? await prisma.bookmark.findFirst({ where: { userId: req.user.id, projectId } })
                : await prisma.bookmark.findFirst({ where: { userId: req.user.id, githubProjectId: projectId } });

        res.json({ bookmarked: !!bookmark });
    } catch (err) {
        next(err);
    }
};

export const checkBookmarksBatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.json({ bookmarks: {} });

        const { projectIds } = req.body;
        if (!Array.isArray(projectIds)) return res.json({ bookmarks: {} });

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: req.user.id,
                OR: [
                    { projectId: { in: projectIds } },
                    { githubProjectId: { in: projectIds } },
                ],
            },
            select: {
                project: { select: { id: true } },
                githubProject: { select: { id: true } },
            },
        });

        const map: Record<string, boolean> = {};
        projectIds.forEach((id: string) => (map[id] = false));

        bookmarks.forEach((b) => {
            const id = b.project?.id || b.githubProject?.id;
            if (id) map[id] = true;
        });

        res.json({ bookmarks: map });
    } catch (err) {
        next(err);
    }
};

/* =====================================================
   PROJECT PROGRESS
===================================================== */

export const getUserProgress = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const progress = await prisma.projectProgress.findMany({
        where: { userId: req.user.id },
        include: { project: true },
    });

    res.json(progress);
};

export const updateProgress = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const projectId = (Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId) as string;
    const { status, notes } = req.body;

    const progress = await prisma.projectProgress.upsert({
        where: { userId_projectId: { userId: req.user.id, projectId } },
        update: { status, notes },
        create: { userId: req.user.id, projectId, status, notes },
    });

    res.json(progress);
};

export const getProjectProgress = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.json({ status: 'NOT_STARTED' });

    const progress = await prisma.projectProgress.findUnique({
        where: { userId_projectId: { userId: req.user.id, projectId: (Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId) as string } },
    });

    res.json(progress || { status: 'NOT_STARTED' });
};

/* =====================================================
   GITHUB PROJECT PROGRESS
===================================================== */

export const getGithubProjectProgress = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const progress = await prisma.gitHubProjectProgress.findMany({
        where: { userId: req.user.id },
        include: { githubProject: true },
    });

    res.json(progress);
};

export const upsertGithubProjectProgress = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const progress = await prisma.gitHubProjectProgress.upsert({
        where: {
            userId_githubProjectId: {
                userId: req.user.id,
                githubProjectId: (Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId) as string,
            },
        },
        update: req.body,
        create: {
            userId: req.user.id,
            githubProjectId: (Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId) as string,
            ...req.body,
        },
    });

    res.json(progress);
};

export const getGithubSingleProgress = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.json({ status: 'NOT_STARTED' });

    const progress = await prisma.gitHubProjectProgress.findUnique({
        where: {
            userId_githubProjectId: {
                userId: req.user.id,
                githubProjectId: (Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId) as string,
            },
        },
    });

    res.json(progress || { status: 'NOT_STARTED' });
};

/* =====================================================
   PROFILE
===================================================== */

export const getProfileStats = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const userId = req.user.id;

    const [uploadedProjects, projectsSaved, started, completed] = await prisma.$transaction([
        prisma.project.count({ where: { createdById: userId } }),
        prisma.bookmark.count({ where: { userId } }),
        prisma.projectProgress.count({ where: { userId, status: 'IN_PROGRESS' } }),
        prisma.projectProgress.count({ where: { userId, status: 'COMPLETED' } }),
    ]);

    res.json({ uploadedProjects, projectsSaved, started, completed });
};

export const getActivity = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const activity = await prisma.projectProgress.findMany({
        where: { userId: req.user.id },
        include: { project: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
    });

    res.json(activity);
};