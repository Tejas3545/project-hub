import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getCache, setCache, clearCacheByPrefix } from '../utils/cache';

/**
 * Get user analytics dashboard data
 * GET /api/analytics/dashboard
 */
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cacheKey = `analytics_dashboard_${userId}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    // Fetch user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalTimeSpent: true,
        currentStreak: true,
        longestStreak: true,
        points: true,
        level: true,
        lastActiveDate: true
      }
    });

    // Fetch project progress stats
    const [totalProjects, inProgress, completed, notStarted] = await Promise.all([
      prisma.projectProgress.count({ where: { userId } }),
      prisma.projectProgress.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.projectProgress.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.projectProgress.count({ where: { userId, status: 'NOT_STARTED' } })
    ]);

    // Fetch recent activity
    const recentSessions = await prisma.timeSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 5
    });

    // Calculate weekly time spent
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyTime = await prisma.timeSession.aggregate({
      where: {
        userId,
        startTime: { gte: weekAgo },
        isActive: false
      },
      _sum: { duration: true }
    });

    // Get achievement count
    const achievementCount = await prisma.userAchievement.count({
      where: { userId }
    });

    const result = {
      user: {
        ...user,
        totalTimeSpentHours: Math.floor((user?.totalTimeSpent || 0) / 60),
        weeklyTimeSpent: weeklyTime._sum.duration || 0
      },
      projects: {
        total: totalProjects,
        inProgress,
        completed,
        notStarted,
        completionRate: totalProjects > 0 ? Math.round((completed / totalProjects) * 100) : 0
      },
      achievements: {
        total: achievementCount
      },
      recentActivity: recentSessions
    };

    setCache(cacheKey, result, 60); // Cache user dashboard for 60 seconds
    res.json(result);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get time tracking analytics
 * GET /api/analytics/time-tracking
 */
export const getTimeTracking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { days = 30 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get sessions grouped by day
    const sessions = await prisma.timeSession.findMany({
      where: {
        userId,
        startTime: { gte: startDate },
        isActive: false
      },
      orderBy: { startTime: 'asc' }
    });

    // Group by date
    const dailyData: { [key: string]: number } = {};
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + session.duration;
    });

    // Get project-wise breakdown
    const projectBreakdown = await prisma.projectProgress.findMany({
      where: { userId, timeSpent: { gt: 0 } },
      orderBy: { timeSpent: 'desc' },
      take: 10,
      select: {
        timeSpent: true,
        project: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        }
      }
    });

    res.json({
      dailyData,
      projectBreakdown: projectBreakdown.map(p => ({
        projectId: p.project.id,
        projectTitle: p.project.title,
        difficulty: p.project.difficulty,
        timeSpent: p.timeSpent,
        timeSpentHours: Math.floor(p.timeSpent / 60)
      })),
      totalSessions: sessions.length
    });
  } catch (error) {
    console.error('Get time tracking error:', error);
    res.status(500).json({ message: 'Failed to fetch time tracking data' });
  }
};

/**
 * Get project progress insights
 * GET /api/analytics/progress-insights
 */
export const getProgressInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all progress records
    const progressRecords = await prisma.projectProgress.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            title: true,
            difficulty: true,
            minTime: true,
            maxTime: true,
            domainId: true
          }
        }
      }
    });

    // Calculate insights
    const insights = {
      averageCompletionTime: 0,
      fastestCompletion: null as any,
      slowestCompletion: null as any,
      domainDistribution: {} as { [key: string]: number },
      difficultyDistribution: {
        EASY: 0,
        MEDIUM: 0,
        HARD: 0,
        BEGINNER: 0,
        INTERMEDIATE: 0,
        ADVANCED: 0,
      } as Record<string, number>,
      completedProjects: [] as any[],
      suggestions: [] as string[]
    };

    const completedProjects = progressRecords.filter(p => p.status === 'COMPLETED');

    if (completedProjects.length > 0) {
      const totalTime = completedProjects.reduce((sum, p) => sum + p.timeSpent, 0);
      insights.averageCompletionTime = Math.floor(totalTime / completedProjects.length);

      // Find fastest and slowest
      const sorted = [...completedProjects].sort((a, b) => a.timeSpent - b.timeSpent);
      insights.fastestCompletion = {
        project: sorted[0].project.title,
        time: sorted[0].timeSpent
      };
      insights.slowestCompletion = {
        project: sorted[sorted.length - 1].project.title,
        time: sorted[sorted.length - 1].timeSpent
      };

      insights.completedProjects = completedProjects.map(p => ({
        title: p.project.title,
        timeSpent: p.timeSpent,
        completedAt: p.completedAt
      }));
    }

    // Domain distribution
    progressRecords.forEach(p => {
      const domainId = p.project.domainId;
      insights.domainDistribution[domainId] = (insights.domainDistribution[domainId] || 0) + 1;
    });

    // Difficulty distribution
    progressRecords.forEach(p => {
      insights.difficultyDistribution[p.project.difficulty]++;
    });

    // Generate suggestions
    if (completedProjects.length === 0) {
      insights.suggestions.push('Complete your first project to unlock insights!');
    } else if (completedProjects.length < 5) {
      insights.suggestions.push('Complete more projects to improve your skills!');
    }

    if (insights.difficultyDistribution.HARD === 0 && completedProjects.length > 3) {
      insights.suggestions.push('Try challenging yourself with a HARD difficulty project!');
    }

    const inProgress = progressRecords.filter(p => p.status === 'IN_PROGRESS');
    if (inProgress.length > 5) {
      insights.suggestions.push('Focus on completing existing projects before starting new ones.');
    }

    res.json(insights);
  } catch (error) {
    console.error('Get progress insights error:', error);
    res.status(500).json({ message: 'Failed to fetch progress insights' });
  }
};

/**
 * Update user streak
 * POST /api/analytics/update-streak
 */
export const updateStreak = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveDate: true, currentStreak: true, longestStreak: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    let newStreak = user.currentStreak;

    if (!lastActive || lastActive.getTime() !== today.getTime()) {
      // Check if it's consecutive day
      if (lastActive) {
        const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          newStreak++;
        } else if (daysDiff > 1) {
          newStreak = 1; // Reset streak
        }
      } else {
        newStreak = 1; // First day
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
          lastActiveDate: new Date()
        }
      });

      res.json({
        message: 'Streak updated',
        currentStreak: updatedUser.currentStreak,
        longestStreak: updatedUser.longestStreak
      });
    } else {
      res.json({
        message: 'Streak already updated today',
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      });
    }
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ message: 'Failed to update streak' });
  }
};

/**
 * Get leaderboard data
 * GET /api/analytics/leaderboard
 */
export const getLeaderboard = async (req: any, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const cacheKey = `leaderboard_${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        level: true,
        totalTimeSpent: true,
        githubProgress: {
          where: { status: 'COMPLETED' },
          select: { id: true }
        },
        // We can add projectProgress count too if needed
        _count: {
          select: {
            createdProjects: true,
            githubProgress: { where: { status: 'COMPLETED' } }
          }
        }
      },
      orderBy: { points: 'desc' },
      take: limit
    });

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || 'Anonymous',
      image: user.image,
      points: user.points,
      level: user.level,
      projectsCompleted: user._count.githubProgress,
      totalTimeSpent: user.totalTimeSpent
    }));

    setCache(cacheKey, leaderboard, 600); // Cache leaderboard for 10 minutes
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};
