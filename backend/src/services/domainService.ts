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
            _count: {
                select: { projects: true },
            },
        },
    });

    if (!domain) return null;

    // Calculate project counts by difficulty
    const projectCountsByDifficulty = {
        EASY: domain.projects.filter((p: any) => p.difficulty === 'EASY').length,
        MEDIUM: domain.projects.filter((p: any) => p.difficulty === 'MEDIUM').length,
        HARD: domain.projects.filter((p: any) => p.difficulty === 'HARD').length,
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
