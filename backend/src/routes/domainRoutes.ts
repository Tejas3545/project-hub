import { Router } from 'express';
import * as domainController from '../controllers/domainController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validation';
import { domainCreateSchema, domainUpdateSchema, uuidParamSchema, slugParamSchema } from '../middleware/validation';
import { generalLimiter, writeLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * OWASP Best Practice: All endpoints validated
 * - UUID format validation for IDs
 * - Slug format validation (lowercase, alphanumeric, hyphens)
 * - Rate limiting on all endpoints
 */

// Public routes with validation
router.get('/', generalLimiter, domainController.getAllDomains);
router.get('/slug/:slug', generalLimiter, validateParams(slugParamSchema), domainController.getDomainBySlug);
router.get('/:id', generalLimiter, validateParams(uuidParamSchema), domainController.getDomainById);

// Admin-only routes with write rate limiting
router.post('/', authenticate, requireAdmin, writeLimiter, validate(domainCreateSchema), domainController.createDomain);
router.put('/:id', authenticate, requireAdmin, writeLimiter, validateParams(uuidParamSchema), validate(domainUpdateSchema), domainController.updateDomain);
router.delete('/:id', authenticate, requireAdmin, writeLimiter, validateParams(uuidParamSchema), domainController.deleteDomain);

export default router;
