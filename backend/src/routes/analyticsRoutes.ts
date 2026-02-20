import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDashboard,
  getTimeTracking,
  getProgressInsights,
  updateStreak,
  getLeaderboard
} from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', authenticate, getDashboard);
router.get('/time-tracking', authenticate, getTimeTracking);
router.get('/progress-insights', authenticate, getProgressInsights);
router.post('/update-streak', authenticate, updateStreak);
router.get('/leaderboard', getLeaderboard);

export default router;
