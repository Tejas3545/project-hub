import prisma from '../utils/prisma';

export const getAllDomains = async () => {
    return prisma.domain.findMany({
        include: {
            _count: {
                select: {
                    projects: {
                        where: { isPublished: true }
                    },
                    githubProjects: {
                        where: { isActive: true }
                    }
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
};

export const getDomainById = async (id: string) => {
    return prisma.domain.findUnique({
        where: { id },
        include: {
            projects: {
                where: { isPublished: true },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    minTime: true,
                    maxTime: true,
                },
            },
        },
    });
};

export const getDomainBySlug = async (slug: string) => {
    const domain = await prisma.domain.findUnique({
        where: { slug },
        include: {
            projects: {
                where: { isPublished: true },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    minTime: true,
                    maxTime: true,
                    skillFocus: true,
                    subDomain: true,
                },
            },
            githubProjects: {
                where: { isActive: true },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    subDomain: true,
                    estimatedMinTime: true,
                    estimatedMaxTime: true,
                },
            },
            _count: {
                select: {
                    projects: { where: { isPublished: true } },
                    githubProjects: { where: { isActive: true } },
                },
            },
        },
    });

    if (!domain) return null;

    // Calculate project counts by difficulty (combine both Project and GitHubProject)
    const allDifficulties = [
        ...domain.projects.map((p: any) => p.difficulty),
        ...domain.githubProjects.map((p: any) => p.difficulty),
    ];
    const projectCountsByDifficulty: Record<string, number> = {
        EASY: allDifficulties.filter((d: string) => d === 'EASY').length,
        MEDIUM: allDifficulties.filter((d: string) => d === 'MEDIUM').length,
        HARD: allDifficulties.filter((d: string) => d === 'HARD').length,
        BEGINNER: allDifficulties.filter((d: string) => d === 'BEGINNER').length,
        INTERMEDIATE: allDifficulties.filter((d: string) => d === 'INTERMEDIATE').length,
        ADVANCED: allDifficulties.filter((d: string) => d === 'ADVANCED').length,
    };

    return {
        ...domain,
        projectCountsByDifficulty,
    };
};

export const createDomain = async (data: { name: string; slug: string; description?: string }) => {
    return prisma.domain.create({
        data,
    });
};

export const updateDomain = async (id: string, data: { name?: string; description?: string }) => {
    return prisma.domain.update({
        where: { id },
        data,
    });
};

export const deleteDomain = async (id: string) => {
    return prisma.domain.delete({
        where: { id },
    });
};
