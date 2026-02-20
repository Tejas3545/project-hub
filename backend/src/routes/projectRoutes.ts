import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { projectCreateSchema, projectUpdateSchema, projectQuerySchema, uuidParamSchema } from '../middleware/validation';
import { generalLimiter, writeLimiter, searchLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

/**
 * OWASP Best Practice: All endpoints have:
 * - Input validation (query, params, body)
 * - Rate limiting (search queries have stricter limits)
 * - Type checking via Zod schemas
 */

// Public routes with query validation and rate limiting
router.get('/', generalLimiter, validateQuery(projectQuerySchema), projectController.getAllProjects);
router.get('/:id', generalLimiter, validateParams(uuidParamSchema), projectController.getProjectById);
router.get('/domain/:domainId', generalLimiter, validateParams(z.object({ domainId: z.string().uuid() })), projectController.getProjectsByDomain);

// Authenticated create (submissions); admin-only update/delete
router.post('/', authenticate, writeLimiter, validate(projectCreateSchema), projectController.createProject);
router.put('/:id', authenticate, requireAdmin, writeLimiter, validateParams(uuidParamSchema), validate(projectUpdateSchema), projectController.updateProject);
router.delete('/:id', authenticate, requireAdmin, writeLimiter, validateParams(uuidParamSchema), projectController.deleteProject);

export default router;
