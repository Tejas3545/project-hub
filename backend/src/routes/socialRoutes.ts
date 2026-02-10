import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    toggleProjectLike,
    getProjectLikeStatus,
    getProjectLikesCount,
    addProjectComment,
    getProjectComments,
    deleteComment,
    upvoteComment,
} from '../controllers/socialController';

const router = Router();

// Like routes
router.post('/projects/:projectId/like', authenticate, toggleProjectLike);
router.get('/projects/:projectId/like/status', authenticate, getProjectLikeStatus);
router.get('/projects/:projectId/like/count', getProjectLikesCount);

// Comment routes
router.post('/projects/:projectId/comments', authenticate, addProjectComment);
router.get('/projects/:projectId/comments', getProjectComments);
router.delete('/comments/:commentId', authenticate, deleteComment);
router.post('/comments/:commentId/upvote', authenticate, upvoteComment);

export default router;
