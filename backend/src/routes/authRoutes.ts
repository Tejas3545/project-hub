import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userRegisterSchema, userLoginSchema, userUpdateProfileSchema } from '../middleware/validation';
import { authLimiter, registerLimiter, writeLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * OWASP Best Practice: Authentication endpoints use strict rate limiting
 * - Register: 3 attempts per hour per IP
 * - Login: 5 attempts per 15 minutes per IP
 * - All routes have input validation
 */

// Public routes with strict rate limiting
router.post('/register', registerLimiter, validate(userRegisterSchema), authController.register);
router.post('/login', authLimiter, validate(userLoginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/google-auth', authLimiter, authController.googleAuth);
router.post('/google-user', authLimiter, authController.googleUser);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.put('/update-profile', authenticate, writeLimiter, validate(userUpdateProfileSchema), authController.updateProfile);

export default router;
