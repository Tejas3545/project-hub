import prisma from '../utils/prisma';

interface FilterOptions {
  difficulty?: string;
  language?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  qaStatus?: string;
}

export const githubProjectService = {
  /**
   * Lightweight listing endpoint for the Explore page.
   * Returns only card-essential fields to minimise payload size.
   */
  async getAllListing(
    page: number = 1,
    limit: number = 24,
    filters: FilterOptions & { domainId?: string } = {}
  ) {
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (filters.qaStatus) {
      where.qaStatus = filters.qaStatus;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.domainId) {
      where.domainId = filters.domainId;
    }
    if (filters.language) {
      where.language = filters.language;
    }
    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { techStack: { hasSome: q.split(/\s+/) } },
        { technicalSkills: { hasSome: q.split(/\s+/) } },
        { toolsUsed: { hasSome: q.split(/\s+/) } },
        { conceptsUsed: { hasSome: q.split(/\s+/) } },
        { topics: { hasSome: q.split(/\s+/) } },
        { language: { contains: q, mode: 'insensitive' } },
        { caseStudy: { contains: q, mode: 'insensitive' } },
        { problemStatement: { contains: q, mode: 'insensitive' } },
        { solutionDescription: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { domain: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = {};
    const sortField = filters.sortBy || 'stars';
    orderBy[sortField] = filters.order || 'desc';

    const [projects, total] = await Promise.all([
      prisma.gitHubProject.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          repoUrl: true,
          repoOwner: true,
          repoName: true,
          defaultBranch: true,
          downloadUrl: true,
          liveUrl: true,
          downloadCount: true,
          domainId: true,
          stars: true,
          forks: true,
          language: true,
          techStack: true,
          difficulty: true,
          isActive: true,
          author: true,
          introduction: true,
          technicalSkills: true,
          estimatedMinTime: true,
          estimatedMaxTime: true,
          qaStatus: true,
          domain: {
            select: { id: true, name: true, slug: true }
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.gitHubProject.count({ where }),
    ]);

    return {
      projects,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

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
    // 1. Try finding in GitHub projects first
    const githubProject = await prisma.gitHubProject.findUnique({
      where: { id },
      include: {
        domain: {
          select: { id: true, name: true, slug: true }
        },
        sourceCode: true
      }
    });

    if (githubProject) return githubProject;

    // 2. Fallback to regular projects
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        domain: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    if (!project) return null;

    // 3. Map regular project to the interface expected by the UI
    // The UI uses GitHubProject fields like estimatedMinTime, downloadUrl, etc.
    return {
      ...project,
      id: project.id,
      title: project.title,
      description: project.solutionDescription || project.industryContext, // fallback
      estimatedMinTime: project.minTime,
      estimatedMaxTime: project.maxTime,
      technicalSkills: project.skillFocus,
      downloadUrl: '#', // Regular projects don't have direct download links yet
      repoUrl: '',
      isRegularProject: true, // flag for UI logic if needed
    };
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
        HARD: projects.filter((p: any) => p.difficulty === 'HARD').length,
        BEGINNER: projects.filter((p: any) => p.difficulty === 'BEGINNER').length,
        INTERMEDIATE: projects.filter((p: any) => p.difficulty === 'INTERMEDIATE').length,
        ADVANCED: projects.filter((p: any) => p.difficulty === 'ADVANCED').length,
      } as Record<string, number>,
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
        { technicalSkills: { hasSome: query.split(/\s+/) } },
        { toolsUsed: { hasSome: query.split(/\s+/) } },
        { conceptsUsed: { hasSome: query.split(/\s+/) } },
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
  },

  /**
   * Update QA status and feedback for a project
   */
  async updateGaStatus(id: string, qaStatus: string, qaFeedback?: string, reviewedBy?: string) {
    return await prisma.gitHubProject.update({
      where: { id },
      data: {
        qaStatus: qaStatus as any,
        qaFeedback,
        reviewedBy,
        reviewedAt: new Date(),
      }
    });
  }
};
