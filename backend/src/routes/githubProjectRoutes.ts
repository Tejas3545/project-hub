import express from 'express';
import { githubProjectController } from '../controllers/githubProjectController';
import { authMiddleware } from '../middleware/auth';
import { generalLimiter, searchLimiter, writeLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * OWASP Best Practice: All endpoints protected with rate limiting
 * - Search endpoints use stricter limits to prevent resource exhaustion
 * - Write operations (tracking) use write limiter
 * - All read operations use general limiter
 */

// Public routes with appropriate rate limiting
router.get('/', generalLimiter, githubProjectController.getAllListing); // Lightweight paginated listing
router.get('/domain/:domainSlug', generalLimiter, githubProjectController.getByDomain);
router.get('/domain/:domainSlug/stats', generalLimiter, githubProjectController.getDomainStats);
router.get('/languages', generalLimiter, githubProjectController.getLanguages);
router.get('/search', searchLimiter, githubProjectController.search); // Stricter limit for search
router.get('/top-downloaded', generalLimiter, githubProjectController.getTopDownloaded);
router.get('/:id', generalLimiter, githubProjectController.getById);
router.get('/:id/download-info', generalLimiter, githubProjectController.getDownloadInfo);

router.get('/:id/documentation', generalLimiter, githubProjectController.getDocumentation);

// Download tracking with write limiter to prevent abuse
router.post('/:id/track-download', writeLimiter, githubProjectController.trackDownload);

// Review route (Admin only)
router.post('/:id/review', authMiddleware, writeLimiter, githubProjectController.updateReview);

export default router;
