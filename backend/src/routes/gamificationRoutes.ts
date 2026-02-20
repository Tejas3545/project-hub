import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createDeadline,
  getDeadlines,
  updateDeadline,
  deleteDeadline,
  getOverdueCount,
  getAllAchievements,
  getUserAchievements,
  checkAchievements
} from '../controllers/achievementsController';

const router = Router();

// Deadline routes
router.post('/deadlines', authenticate, createDeadline);
router.get('/deadlines', authenticate, getDeadlines);
router.get('/deadlines/overdue-count', authenticate, getOverdueCount);
router.put('/deadlines/:deadlineId', authenticate, updateDeadline);
router.delete('/deadlines/:deadlineId', authenticate, deleteDeadline);

// Achievement routes
router.get('/achievements/all', getAllAchievements);
router.get('/achievements/user', authenticate, getUserAchievements);
router.post('/achievements/check', authenticate, checkAchievements);

export default router;
