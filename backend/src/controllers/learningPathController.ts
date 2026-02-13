import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all learning paths
 * GET /api/learning-paths
 */
export const getLearningPaths = async (req: Request, res: Response) => {
  try {
    const { difficulty, domain } = req.query;

    const where: any = { isActive: true };
    if (difficulty) where.difficulty = difficulty as string;
    if (domain) where.domains = { has: domain as string };

    const paths = await prisma.learningPath.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ paths });
  } catch (error) {
    console.error('Get learning paths error:', error);
    res.status(500).json({ message: 'Failed to fetch learning paths' });
  }
};

/**
 * Get personalized learning path recommendations
 * GET /api/learning-paths/recommendations
 */
export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user's completed projects and progress
    const completedProjects = await prisma.projectProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      include: {
        project: {
          select: {
            difficulty: true,
            domainId: true,
            skillFocus: true
          }
        }
      }
    });

    // Analyze user's strengths
    const domainCounts: { [key: string]: number } = {};
    const skillCounts: { [key: string]: number } = {};
    let hardCount = 0, mediumCount = 0, easyCount = 0;

    completedProjects.forEach(cp => {
      // Count domains
      domainCounts[cp.project.domainId] = (domainCounts[cp.project.domainId] || 0) + 1;
      
      // Count skills
      cp.project.skillFocus.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });

      // Count difficulty
      if (cp.project.difficulty === 'HARD') hardCount++;
      else if (cp.project.difficulty === 'MEDIUM') mediumCount++;
      else easyCount++;
    });

    // Determine recommended difficulty
    let recommendedDifficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY';
    if (hardCount >= 3 || (mediumCount >= 5 && hardCount > 0)) {
      recommendedDifficulty = 'HARD';
    } else if (mediumCount >= 3 || easyCount >= 5) {
      recommendedDifficulty = 'MEDIUM';
    }

    // Get recommended paths based on user's progress
    const recommendations = await prisma.learningPath.findMany({
      where: {
        isActive: true,
        difficulty: recommendedDifficulty
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // If user has strong domain preference, filter by that
    const topDomain = Object.keys(domainCounts).sort((a, b) => domainCounts[b] - domainCounts[a])[0];
    
    res.json({
      recommendations,
      insights: {
        completedProjects: completedProjects.length,
        recommendedDifficulty,
        topDomain,
        topSkills: Object.keys(skillCounts)
          .sort((a, b) => skillCounts[b] - skillCounts[a])
          .slice(0, 5),
        difficultyDistribution: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount
        }
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
};

/**
 * Get a specific learning path by ID
 * GET /api/learning-paths/:pathId
 */
export const getLearningPathById = async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params;

    const path = await prisma.learningPath.findUnique({
      where: { id: pathId as string }
    });

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    // Fetch the projects in this path
    const projects = await prisma.project.findMany({
      where: {
        id: { in: path.projectIds }
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        minTime: true,
        maxTime: true,
        skillFocus: true,
        techStack: true,
        screenshots: true
      }
    });

    // Reorder projects according to path order
    const orderedProjects = path.projectIds
      .map(id => projects.find(p => p.id === id))
      .filter(p => p !== undefined);

    res.json({
      path,
      projects: orderedProjects
    });
  } catch (error) {
    console.error('Get learning path by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch learning path' });
  }
};

/**
 * Create a new learning path (Admin only)
 * POST /api/learning-paths
 */
export const createLearningPath = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, difficulty, domains, projectIds, estimatedTime, skills } = req.body;

    if (!title || !description || !difficulty || !projectIds || projectIds.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const path = await prisma.learningPath.create({
      data: {
        title,
        description,
        difficulty,
        domains: domains || [],
        projectIds,
        estimatedTime: estimatedTime || 0,
        skills: skills || []
      }
    });

    res.status(201).json({ message: 'Learning path created', path });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({ message: 'Failed to create learning path' });
  }
};

/**
 * Update a learning path (Admin only)
 * PUT /api/learning-paths/:pathId
 */
export const updateLearningPath = async (req: AuthRequest, res: Response) => {
  try {
    const { pathId } = req.params;
    const { title, description, difficulty, domains, projectIds, estimatedTime, skills, isActive } = req.body;

    const path = await prisma.learningPath.update({
      where: { id: pathId as string },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(difficulty && { difficulty }),
        ...(domains && { domains }),
        ...(projectIds && { projectIds }),
        ...(estimatedTime !== undefined && { estimatedTime }),
        ...(skills && { skills }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ message: 'Learning path updated', path });
  } catch (error) {
    console.error('Update learning path error:', error);
    res.status(500).json({ message: 'Failed to update learning path' });
  }
};

/**
 * Delete a learning path (Admin only)
 * DELETE /api/learning-paths/:pathId
 */
export const deleteLearningPath = async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params;

    await prisma.learningPath.delete({
      where: { id: pathId as string }
    });

    res.json({ message: 'Learning path deleted' });
  } catch (error) {
    console.error('Delete learning path error:', error);
    res.status(500).json({ message: 'Failed to delete learning path' });
  }
};
