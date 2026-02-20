import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
} from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/:notificationId/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);

export default router;
