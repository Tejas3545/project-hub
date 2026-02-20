import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  startTimer,
  stopTimer,
  getTimeSessions,
  getActiveSession,
  createNote,
  getNotesByProject,
  updateNote,
  deleteNote
} from '../controllers/workspaceController';

const router = Router();

// Timer routes
router.post('/timer/start', authenticate, startTimer);
router.post('/timer/stop', authenticate, stopTimer);
router.get('/timer/sessions', authenticate, getTimeSessions);
router.get('/timer/active', authenticate, getActiveSession);

// Notes routes
router.post('/notes', authenticate, createNote);
router.get('/notes/:projectId', authenticate, getNotesByProject);
router.put('/notes/:noteId', authenticate, updateNote);
router.delete('/notes/:noteId', authenticate, deleteNote);

export default router;
