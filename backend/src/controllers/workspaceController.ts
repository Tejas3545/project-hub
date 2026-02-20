import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// ============================================
// TIME TRACKING ENDPOINTS
// ============================================

/**
 * Start a timer session for a project
 * POST /api/workspace/timer/start
 */
export const startTimer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.body;

    if (!userId || !projectId) {
      return res.status(400).json({ message: 'User ID and Project ID required' });
    }

    // Check if there's already an active session
    const activeSession = await prisma.timeSession.findFirst({
      where: { userId, isActive: true }
    });

    if (activeSession) {
      return res.status(400).json({ 
        message: 'You already have an active timer session',
        session: activeSession
      });
    }

    // Create new session
    const session = await prisma.timeSession.create({
      data: {
        userId,
        projectId,
        startTime: new Date(),
        isActive: true
      }
    });

    // Update project progress
    await prisma.projectProgress.upsert({
      where: {
        userId_projectId: { userId, projectId }
      },
      update: {
        isRunning: true,
        lastTimerStart: new Date(),
        status: 'IN_PROGRESS',
        startedAt: new Date()
      },
      create: {
        userId,
        projectId,
        isRunning: true,
        lastTimerStart: new Date(),
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });

    res.status(201).json({ message: 'Timer started', session });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Failed to start timer' });
  }
};

/**
 * Stop the active timer session
 * POST /api/workspace/timer/stop
 */
export const stopTimer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sessionId, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the active session
    const session = await prisma.timeSession.findFirst({
      where: { 
        id: sessionId,
        userId, 
        isActive: true 
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Active timer session not found' });
    }

    // Calculate duration
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000 / 60); // minutes

    // Update session
    const updatedSession = await prisma.timeSession.update({
      where: { id: session.id },
      data: {
        endTime,
        duration,
        isActive: false,
        notes
      }
    });

    // Update project progress and user stats
    const [progress] = await Promise.all([
      prisma.projectProgress.update({
        where: {
          userId_projectId: {
            userId,
            projectId: session.projectId
          }
        },
        data: {
          isRunning: false,
          timeSpent: { increment: duration },
          lastTimerStart: null
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalTimeSpent: { increment: duration },
          lastActiveDate: new Date()
        }
      })
    ]);

    // Check for achievement unlocks
    await checkTimeAchievements(userId, duration);

    res.json({ 
      message: 'Timer stopped', 
      session: updatedSession,
      totalTimeSpent: progress.timeSpent 
    });
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ message: 'Failed to stop timer' });
  }
};

/**
 * Get user's time sessions with optional filters
 * GET /api/workspace/timer/sessions
 */
export const getTimeSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, limit = 10, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const where: any = { userId };
    if (projectId) where.projectId = projectId as string;

    const [sessions, total] = await Promise.all([
      prisma.timeSession.findMany({
        where,
        orderBy: { startTime: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.timeSession.count({ where })
    ]);

    res.json({ sessions, total });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
};

/**
 * Get active timer session
 * GET /api/workspace/timer/active
 */
export const getActiveSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const session = await prisma.timeSession.findFirst({
      where: { userId, isActive: true }
    });

    res.json({ session });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ message: 'Failed to fetch active session' });
  }
};

// ============================================
// PROJECT NOTES ENDPOINTS
// ============================================

/**
 * Create a new note for a project
 * POST /api/workspace/notes
 */
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, title, content, tags } = req.body;

    if (!userId || !projectId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const note = await prisma.projectNote.create({
      data: {
        userId,
        projectId,
        title: title || 'Untitled Note',
        content,
        tags: tags || []
      }
    });

    res.status(201).json({ message: 'Note created', note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
};

/**
 * Get notes for a project
 * GET /api/workspace/notes/:projectId
 */
export const getNotesByProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notes = await prisma.projectNote.findMany({
      where: { userId, projectId: projectId as string },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

/**
 * Update a note
 * PUT /api/workspace/notes/:noteId
 */
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { noteId } = req.params;
    const { title, content, tags, isPinned } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify ownership
    const existingNote = await prisma.projectNote.findUnique({
      where: { id: noteId as string }
    });

    if (!existingNote || existingNote.userId !== userId) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const note = await prisma.projectNote.update({
      where: { id: noteId as string },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(tags && { tags }),
        ...(isPinned !== undefined && { isPinned })
      }
    });

    res.json({ message: 'Note updated', note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Failed to update note' });
  }
};

/**
 * Delete a note
 * DELETE /api/workspace/notes/:noteId
 */
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { noteId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify ownership
    const existingNote = await prisma.projectNote.findUnique({
      where: { id: noteId as string }
    });

    if (!existingNote || existingNote.userId !== userId) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await prisma.projectNote.delete({
      where: { id: noteId as string }
    });

    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkTimeAchievements(userId: string, minutesLogged: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalTimeSpent: true }
    });

    if (!user) return;

    const totalHours = Math.floor(user.totalTimeSpent / 60);
    const achievementChecks = [
      { hours: 1, name: 'First Hour' },
      { hours: 10, name: '10 Hours Logged' },
      { hours: 50, name: '50 Hours Logged' },
      { hours: 100, name: '100 Hours Logged' },
      { hours: 500, name: '500 Hours Logged' }
    ];

    for (const check of achievementChecks) {
      if (totalHours >= check.hours) {
        const achievement = await prisma.achievement.findUnique({
          where: { name: check.name }
        });

        if (achievement) {
          // Try to create user achievement (will fail silently if already exists)
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id
            }
          }).catch(() => {}); // Ignore duplicate errors
        }
      }
    }
  } catch (error) {
    console.error('Check achievements error:', error);
  }
}
