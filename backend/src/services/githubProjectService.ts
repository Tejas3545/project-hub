import prisma from '../utils/prisma';

interface FilterOptions {
  difficulty?: string;
  language?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const githubProjectService = {
  async getByDomain(
    domainSlug: string,
    page: number = 1,
    limit: number = 20,
    filters: FilterOptions = {}
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      domain: {
        slug: domainSlug
      }
    };

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.language) {
      where.language = filters.language;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    const sortField = filters.sortBy || 'stars';
    orderBy[sortField] = filters.order || 'desc';

    const [projects, total] = await Promise.all([
      prisma.gitHubProject.findMany({
        where,
        include: {
          domain: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          sourceCode: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.gitHubProject.count({ where })
    ]);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getById(id: string) {
    return await prisma.gitHubProject.findUnique({
      where: { id },
      include: {
        domain: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        sourceCode: true
      }
    });
  },

  async getDomainStats(domainSlug: string) {
    const projects = await prisma.gitHubProject.findMany({
      where: {
        isActive: true,
        domain: {
          slug: domainSlug
        }
      },
      select: {
        difficulty: true,
        language: true,
        stars: true
      }
    });

    const stats = {
      total: projects.length,
      byDifficulty: {
        EASY: projects.filter((p: any) => p.difficulty === 'EASY').length,
        MEDIUM: projects.filter((p: any) => p.difficulty === 'MEDIUM').length,
        HARD: projects.filter((p: any) => p.difficulty === 'HARD').length
      },
      byLanguage: projects.reduce((acc: any, p: any) => {
        if (p.language) {
          acc[p.language] = (acc[p.language] || 0) + 1;
        }
        return acc;
      }, {}),
      totalStars: projects.reduce((sum: number, p: any) => sum + p.stars, 0),
      averageStars: Math.round(projects.reduce((sum: number, p: any) => sum + p.stars, 0) / projects.length)
    };

    return stats;
  },

  async getUniqueLanguages() {
    const projects = await prisma.gitHubProject.findMany({
      where: { isActive: true },
      select: { language: true },
      distinct: ['language']
    });

    return projects
      .map((p: any) => p.language)
      .filter((lang: any) => lang !== null)
      .sort();
  },

  async searchProjects(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { techStack: { hasSome: query.split(/\s+/) } },
        { topics: { hasSome: query.split(/\s+/) } },
        { language: { contains: query, mode: 'insensitive' as const } },
        { caseStudy: { contains: query, mode: 'insensitive' as const } },
        { problemStatement: { contains: query, mode: 'insensitive' as const } },
        { solutionDescription: { contains: query, mode: 'insensitive' as const } },
        { author: { contains: query, mode: 'insensitive' as const } },
        { domain: { name: { contains: query, mode: 'insensitive' as const } } },
      ]
    };

    const [projects, total] = await Promise.all([
      prisma.gitHubProject.findMany({
        where,
        include: {
          domain: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          sourceCode: true
        },
        orderBy: { stars: 'desc' },
        skip,
        take: limit
      }),
      prisma.gitHubProject.count({ where })
    ]);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Track download for analytics
   */
  async trackDownload(projectId: string) {
    try {
      await prisma.gitHubProject.update({
        where: { id: projectId },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error tracking download:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get download information for a project
   */
  async getDownloadInfo(projectId: string) {
    const project = await prisma.gitHubProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        repoOwner: true,
        repoName: true,
        defaultBranch: true,
        downloadUrl: true,
        downloadCount: true,
        stars: true,
        forks: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  },

  /**
   * Get top downloaded projects
   */
  async getTopDownloaded(limit: number = 10) {
    return await prisma.gitHubProject.findMany({
      where: { isActive: true },
      orderBy: { downloadCount: 'desc' },
      take: limit,
      include: {
        domain: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });
  }
};
