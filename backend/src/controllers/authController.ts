import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { logSecurityEvent } from '../utils/logger';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('📝 Attempting user registration:', { email: req.body.email });
        const user = await authService.registerUser(req.body);
        console.log('✅ User registered successfully:', user.id);

        res.status(201).json({
            message: 'User registered successfully',
            user,
        });
    } catch (error) {
        console.error('❌ Registration failed:', error);
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);

        logSecurityEvent('User Login', {
            userId: result.user.id,
            email: result.user.email,
            ip: req.ip,
        });

        res.json(result);
    } catch (error) {
        logSecurityEvent('Failed Login Attempt', {
            email: req.body.email,
            ip: req.ip,
        });
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const result = authService.refreshAccessToken(refreshToken);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await authService.getUserProfile(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // In a real application, you would blacklist the token here
        // For now, we'll just return success (client should delete the token)

        if (req.user) {
            logSecurityEvent('User Logout', {
                userId: req.user.id,
                email: req.user.email,
                ip: req.ip,
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { firstName, lastName, profileImage, bio, headline, location, githubUrl, portfolioUrl } = req.body;
        const user = await authService.updateUserProfile(
            req.user.id,
            { firstName, lastName, profileImage, bio, headline, location, githubUrl, portfolioUrl },
            { email: req.user.email, role: req.user.role }
        );

        logSecurityEvent('Profile Updated', {
            userId: req.user.id,
            email: req.user.email,
            ip: req.ip,
        });

        res.json({
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, firstName, lastName, profileImage } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await authService.googleAuthUser({
            email,
            firstName,
            lastName,
            profileImage,
        });

        logSecurityEvent('Google OAuth Login', {
            userId: user.id,
            email: user.email,
            ip: req.ip,
        });

        res.json(user);
    } catch (error) {
        logSecurityEvent('Failed Google OAuth Attempt', {
            email: req.body.email,
            ip: req.ip,
        });
        next(error);
    }
};

export const googleUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, id } = req.body;

        if (!email && !id) {
            return res.status(400).json({ error: 'Email or ID is required' });
        }

        // Fetch user from database by email or id
        const user = await authService.getUserByEmailOrId(email, id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};
