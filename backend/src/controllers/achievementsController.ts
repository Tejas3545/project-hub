import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// ============================================
// DEADLINE MANAGEMENT
// ============================================

/**
 * Create a new deadline
 * POST /api/deadlines
 */
export const createDeadline = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, title, description, dueDate, priority } = req.body;

    if (!userId || !projectId || !title || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const deadline = await prisma.deadline.create({
      data: {
        userId,
        projectId,
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM'
      }
    });

    res.status(201).json({ message: 'Deadline created', deadline });
  } catch (error) {
    console.error('Create deadline error:', error);
    res.status(500).json({ message: 'Failed to create deadline' });
  }
};

/**
 * Get user's deadlines with filters
 * GET /api/deadlines
 */
export const getDeadlines = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, isCompleted, upcoming } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const where: any = { userId };
    
    if (projectId) where.projectId = projectId as string;
    if (isCompleted !== undefined) where.isCompleted = isCompleted === 'true';
    if (upcoming === 'true') {
      where.dueDate = { gte: new Date() };
      where.isCompleted = false;
    }

    const deadlines = await prisma.deadline.findMany({
      where,
      orderBy: [
        { isCompleted: 'asc' },
        { dueDate: 'asc' }
      ]
    });

    res.json({ deadlines });
  } catch (error) {
    console.error('Get deadlines error:', error);
    res.status(500).json({ message: 'Failed to fetch deadlines' });
  }
};

/**
 * Update a deadline
 * PUT /api/deadlines/:deadlineId
 */
export const updateDeadline = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { deadlineId } = req.params;
    const { title, description, dueDate, isCompleted, priority } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify ownership
    const existing = await prisma.deadline.findUnique({
      where: { id: deadlineId as string }
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Deadline not found' });
    }

    const deadline = await prisma.deadline.update({
      where: { id: deadlineId as string },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(priority && { priority })
      }
    });

    res.json({ message: 'Deadline updated', deadline });
  } catch (error) {
    console.error('Update deadline error:', error);
    res.status(500).json({ message: 'Failed to update deadline' });
  }
};

/**
 * Delete a deadline
 * DELETE /api/deadlines/:deadlineId
 */
export const deleteDeadline = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { deadlineId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify ownership
    const existing = await prisma.deadline.findUnique({
      where: { id: deadlineId as string }
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Deadline not found' });
    }

    await prisma.deadline.delete({
      where: { id: deadlineId as string }
    });

    res.json({ message: 'Deadline deleted' });
  } catch (error) {
    console.error('Delete deadline error:', error);
    res.status(500).json({ message: 'Failed to delete deadline' });
  }
};

/**
 * Get overdue deadlines count
 * GET /api/deadlines/overdue-count
 */
export const getOverdueCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await prisma.deadline.count({
      where: {
        userId,
        isCompleted: false,
        dueDate: { lt: new Date() }
      }
    });

    res.json({ overdueCount: count });
  } catch (error) {
    console.error('Get overdue count error:', error);
    res.status(500).json({ message: 'Failed to fetch overdue count' });
  }
};

// ============================================
// ACHIEVEMENT SYSTEM
// ============================================

/**
 * Get all available achievements
 * GET /api/achievements/all
 */
export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { category: 'asc' },
        { requirement: 'asc' }
      ]
    });

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
};

/**
 * Get user's earned achievements
 * GET /api/achievements/user
 */
export const getUserAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    // Get user stats for progress
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalTimeSpent: true,
        currentStreak: true,
        points: true
      }
    });

    const completedProjects = await prisma.projectProgress.count({
      where: { userId, status: 'COMPLETED' }
    });

    res.json({ 
      achievements: userAchievements.map(ua => ({
        ...ua.achievement,
        earnedAt: ua.earnedAt
      })),
      progress: {
        totalHours: Math.floor((user?.totalTimeSpent || 0) / 60),
        completedProjects,
        currentStreak: user?.currentStreak || 0,
        points: user?.points || 0
      }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ message: 'Failed to fetch user achievements' });
  }
};

/**
 * Check and award achievements
 * POST /api/achievements/check
 */
export const checkAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newAchievements = await checkAndAwardAchievements(userId);

    res.json({ 
      message: 'Achievements checked', 
      newAchievements,
      count: newAchievements.length 
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ message: 'Failed to check achievements' });
  }
};

// Helper function to check and award achievements
async function checkAndAwardAchievements(userId: string) {
  const newAchievements: any[] = [];

  try {
    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalTimeSpent: true,
        currentStreak: true,
        longestStreak: true
      }
    });

    const completedProjects = await prisma.projectProgress.count({
      where: { userId, status: 'COMPLETED' }
    });

    const totalComments = await prisma.comment.count({
      where: { userId }
    });

    const totalLikes = await prisma.like.count({
      where: { userId }
    });

    if (!user) return newAchievements;

    const totalHours = Math.floor(user.totalTimeSpent / 60);

    // Time-based achievements
    const timeChecks = [
      { hours: 1, name: 'First Hour', desc: 'Logged your first hour of work', points: 10 },
      { hours: 10, name: '10 Hours Logged', desc: 'Logged 10 hours of focused work', points: 50 },
      { hours: 50, name: '50 Hours Logged', desc: 'Logged 50 hours of dedicated work', points: 100 },
      { hours: 100, name: '100 Hours Logged', desc: 'Logged 100 hours of hard work', points: 200 },
      { hours: 500, name: '500 Hours Logged', desc: 'Logged 500 hours - You\'re a master!', points: 500 }
    ];

    for (const check of timeChecks) {
      if (totalHours >= check.hours) {
        const achievement = await getOrCreateAchievement(check.name, check.desc, 'TIME_TRACKING', check.hours, check.points);
        const awarded = await awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(achievement);
      }
    }

    // Project completion achievements
    const projectChecks = [
      { count: 1, name: 'First Project', desc: 'Completed your first project', points: 20 },
      { count: 5, name: '5 Projects', desc: 'Completed 5 projects', points: 100 },
      { count: 10, name: '10 Projects', desc: 'Completed 10 projects', points: 200 },
      { count: 25, name: '25 Projects', desc: 'Completed 25 projects - Expert level!', points: 500 }
    ];

    for (const check of projectChecks) {
      if (completedProjects >= check.count) {
        const achievement = await getOrCreateAchievement(check.name, check.desc, 'PROJECTS', check.count, check.points);
        const awarded = await awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(achievement);
      }
    }

    // Streak achievements
    const streakChecks = [
      { days: 3, name: '3 Day Streak', desc: 'Logged in for 3 consecutive days', points: 30 },
      { days: 7, name: 'Week Warrior', desc: 'Logged in for 7 consecutive days', points: 70 },
      { days: 30, name: 'Month Master', desc: 'Logged in for 30 consecutive days', points: 300 }
    ];

    for (const check of streakChecks) {
      if (user.currentStreak >= check.days) {
        const achievement = await getOrCreateAchievement(check.name, check.desc, 'STREAK', check.days, check.points);
        const awarded = await awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(achievement);
      }
    }

    // Social achievements
    if (totalComments >= 10) {
      const achievement = await getOrCreateAchievement('Social Butterfly', 'Posted 10 comments', 'SOCIAL', 10, 50);
      const awarded = await awardAchievement(userId, achievement.id);
      if (awarded) newAchievements.push(achievement);
    }

    if (totalLikes >= 25) {
      const achievement = await getOrCreateAchievement('Like Machine', 'Liked 25 projects', 'SOCIAL', 25, 50);
      const awarded = await awardAchievement(userId, achievement.id);
      if (awarded) newAchievements.push(achievement);
    }

  } catch (error) {
    console.error('Check and award achievements error:', error);
  }

  return newAchievements;
}

async function getOrCreateAchievement(name: string, description: string, category: any, requirement: number, points: number) {
  let achievement = await prisma.achievement.findUnique({
    where: { name }
  });

  if (!achievement) {
    achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        category,
        requirement,
        points,
        icon: '🏆' // Default icon
      }
    });
  }

  return achievement;
}

async function awardAchievement(userId: string, achievementId: string): Promise<boolean> {
  try {
    await prisma.userAchievement.create({
      data: { userId, achievementId }
    });

    // Award points to user
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (achievement) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: achievement.points }
        }
      });
    }

    return true;
  } catch (error) {
    // Achievement already awarded
    return false;
  }
}
