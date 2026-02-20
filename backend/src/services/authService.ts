import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { authConfig } from '../config';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

export const registerUser = async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}) => {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });

        if (existingUser) {
            throw new AppError('Email already registered', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'STUDENT',
                isVerified: false, // TODO: Implement email verification
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true,
            },
        });

        return user;
    } catch (error) {
        console.error('❌ Registration error:', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to register user. Please try again later.', 500);
    }
};

export const loginUser = async (email: string, password: string) => {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    if (!user.passwordHash) {
        throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            bio: user.bio,
            role: user.role,
            isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
    };
};

export const refreshAccessToken = (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, authConfig.jwtRefreshSecret) as {
            id: string;
            email: string;
            role: 'STUDENT' | 'ADMIN';
        };

        const newAccessToken = generateAccessToken({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        });

        return { accessToken: newAccessToken };
    } catch (error) {
        throw new AppError('Invalid refresh token', 401);
    }
};

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            bio: true,
            role: true,
            isVerified: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

export const updateUserProfile = async (
    userId: string,
    data: { 
        firstName?: string; 
        lastName?: string; 
        profileImage?: string; 
        bio?: string;
        headline?: string;
        location?: string;
        githubUrl?: string;
        portfolioUrl?: string;
    },
    authContext: { email: string; role: 'STUDENT' | 'ADMIN' }
) => {
    const user = await prisma.user.upsert({
        where: { id: userId },
        update: {
            firstName: data.firstName,
            lastName: data.lastName,
            profileImage: data.profileImage,
            bio: data.bio,
            headline: data.headline,
            location: data.location,
            githubUrl: data.githubUrl,
            portfolioUrl: data.portfolioUrl,
        },
        create: {
            id: userId,
            email: authContext.email.toLowerCase(),
            firstName: data.firstName,
            lastName: data.lastName,
            profileImage: data.profileImage,
            bio: data.bio,
            headline: data.headline,
            location: data.location,
            githubUrl: data.githubUrl,
            portfolioUrl: data.portfolioUrl,
            role: authContext.role,
            isVerified: authContext.role === 'ADMIN',
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            bio: true,
            headline: true,
            location: true,
            githubUrl: true,
            portfolioUrl: true,
            role: true,
            isVerified: true,
            createdAt: true,
        },
    });

    return user;
};

// Helper functions
const generateAccessToken = (payload: { id: string; email: string; role: string }) => {
    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn,
    } as jwt.SignOptions);
};

const generateRefreshToken = (payload: { id: string; email: string; role: string }) => {
    return jwt.sign(payload, authConfig.jwtRefreshSecret, {
        expiresIn: authConfig.jwtRefreshExpiresIn,
    } as jwt.SignOptions);
};

export const googleAuthUser = async (data: {
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    bio?: string;
}) => {
    try {
        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                bio: true,
                role: true,
                isVerified: true,
                createdAt: true,
            },
        });

        // If user doesn't exist, create them
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    passwordHash: '', // Google OAuth users don't need password
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profileImage: data.profileImage,
                    bio: data.bio,
                    role: 'STUDENT',
                    isVerified: true, // Auto-verify Google users
                    lastLogin: new Date(),
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    bio: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                },
            });
        } else {
            // Update last login and profile image if changed
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLogin: new Date(),
                    profileImage: data.profileImage || user.profileImage,
                    bio: data.bio || user.bio,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    bio: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                },
            });
        }

        return user;
    } catch (error) {
        console.error('Google Auth Error:', error);
        throw new AppError('Failed to authenticate with Google', 500);
    }
};

export const getUserByEmailOrId = async (email?: string, id?: string) => {
    try {
        if (id) {
            return await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    bio: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                },
            });
        }

        if (email) {
            return await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    bio: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                },
            });
        }

        return null;
    } catch (error) {
        console.error('Get User Error:', error);
        throw new AppError('Failed to fetch user', 500);
    }
};
