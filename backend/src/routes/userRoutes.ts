import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/userController';
import { validate, validateParams } from '../middleware/validation';
import { projectProgressUpdateSchema, uuidParamSchema } from '../middleware/validation';
import { generalLimiter, writeLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

/**
 * OWASP Best Practice: User-specific endpoints
 * - All routes require authentication (authenticate middleware)
 * - UUID validation for all projectId params
 * - Rate limiting: general for reads, write limiter for mutations
 * - No data exposed without valid JWT token
 */

// Bookmark routes - all require authentication
router.get('/bookmarks', authenticate, generalLimiter, userController.getUserBookmarks);
router.post('/bookmarks/batch-check', authenticate, generalLimiter, userController.checkBookmarksBatch);
router.post('/bookmarks/:projectId', authenticate, writeLimiter, validateParams(z.object({ projectId: z.string().uuid() })), userController.toggleBookmark);
router.get('/bookmarks/:projectId/check', authenticate, generalLimiter, validateParams(z.object({ projectId: z.string().uuid() })), userController.checkBookmark);

// Progress routes - all require authentication
router.get('/progress', authenticate, generalLimiter, userController.getUserProgress);
router.put('/progress/:projectId', authenticate, writeLimiter, validateParams(z.object({ projectId: z.string().uuid() })), validate(projectProgressUpdateSchema), userController.updateProgress);
router.get('/progress/:projectId', authenticate, generalLimiter, validateParams(z.object({ projectId: z.string().uuid() })), userController.getProjectProgress);

// GitHub Project Progress routes - all require authentication
router.get('/github-progress', authenticate, generalLimiter, userController.getGithubProjectProgress);
router.put('/github-progress/:projectId', authenticate, writeLimiter, validateParams(z.object({ projectId: z.string().uuid() })), userController.upsertGithubProjectProgress);
router.get('/github-progress/:projectId', authenticate, generalLimiter, validateParams(z.object({ projectId: z.string().uuid() })), userController.getGithubSingleProgress);

// Profile stats and activity
router.get('/profile-stats', authenticate, generalLimiter, userController.getProfileStats);
router.get('/activity', authenticate, generalLimiter, userController.getActivity);

export default router;
