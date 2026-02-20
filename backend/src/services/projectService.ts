import prisma from '../utils/prisma';

interface ProjectFilters {
    domainId?: string;
    difficulty?: string;
    isPublished?: boolean;
    minTime?: number;
    maxTime?: number;
    skills?: string[];
    search?: string;
}

export const getAllProjects = async (filters: ProjectFilters = {}) => {
    const where: any = {};

    // Basic filters
    if (filters.domainId) {
        where.domainId = filters.domainId;
    }

    if (filters.difficulty) {
        where.difficulty = filters.difficulty;
    }

    if (filters.isPublished !== undefined) {
        where.isPublished = filters.isPublished;
    }

    // Time range filter
    if (filters.minTime !== undefined || filters.maxTime !== undefined) {
        where.AND = where.AND || [];

        if (filters.minTime !== undefined) {
            where.AND.push({ maxTime: { gte: filters.minTime } });
        }

        if (filters.maxTime !== undefined) {
            where.AND.push({ minTime: { lte: filters.maxTime } });
        }
    }

    // Skills filter (match projects that have any of the specified skills)
    if (filters.skills && filters.skills.length > 0) {
        where.skillFocus = {
            hasSome: filters.skills,
        };
    }

    // Full-text search across multiple fields
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { industryContext: { contains: filters.search, mode: 'insensitive' } },
            { problemStatement: { contains: filters.search, mode: 'insensitive' } },
            { scope: { contains: filters.search, mode: 'insensitive' } },
            { caseStudy: { contains: filters.search, mode: 'insensitive' } },
            { solutionDescription: { contains: filters.search, mode: 'insensitive' } },
            { subDomain: { contains: filters.search, mode: 'insensitive' } },
            { domain: { name: { contains: filters.search, mode: 'insensitive' } } },
            { skillFocus: { hasSome: filters.search.split(/\s+/) } },
        ];
    }

    return prisma.project.findMany({
        where,
        include: {
            domain: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getProjectById = async (id: string) => {
    return prisma.project.findUnique({
        where: { id },
        include: {
            domain: true,
        },
    });
};

export const getProjectsByDomain = async (domainId: string) => {
    return prisma.project.findMany({
        where: {
            domainId,
            isPublished: true,
        },
        select: {
            id: true,
            title: true,
            difficulty: true,
            minTime: true,
            maxTime: true,
            skillFocus: true,
            industryContext: true,
            problemStatement: true,
        },
    });
};

export const createProject = async (data: any) => {
    return prisma.project.create({
        data,
        include: {
            domain: true,
        },
    });
};

export const updateProject = async (id: string, data: any) => {
    return prisma.project.update({
        where: { id },
        data,
        include: {
            domain: true,
        },
    });
};

export const deleteProject = async (id: string) => {
    return prisma.project.delete({
        where: { id },
    });
};
