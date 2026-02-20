import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getLearningPaths,
  getRecommendations,
  getLearningPathById,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath
} from '../controllers/learningPathController';

const router = Router();

router.get('/', getLearningPaths);
router.get('/recommendations', authenticate, getRecommendations);
router.get('/:pathId', getLearningPathById);
router.post('/', authenticate, requireAdmin, createLearningPath);
router.put('/:pathId', authenticate, requireAdmin, updateLearningPath);
router.delete('/:pathId', authenticate, requireAdmin, deleteLearningPath);

export default router;
