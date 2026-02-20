'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    bio?: string;
    role: 'STUDENT' | 'ADMIN';
    isVerified: boolean;
    currentStreak?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') {
            setIsLoading(true);
            return;
        }

        if (status === 'authenticated' && session?.user) {
            const mappedUser: User = {
                id: session.user.id,
                email: session.user.email!,
                firstName: session.user.firstName || session.user.name?.split(' ')[0],
                lastName: session.user.lastName || session.user.name?.split(' ').slice(1).join(' '),
                profileImage: (session.user.profileImage || session.user.image) || undefined,
                bio: session.user.bio || undefined,
                role: (session.user.role as 'STUDENT' | 'ADMIN') || 'STUDENT',
                isVerified: session.user.isVerified || false,
            };
            setUser(mappedUser);
            // Persist backend-compatible access token (if provided by next-auth callbacks)
            // so the API client can attach the Authorization header.
            // Note: accessToken is injected into the session via `auth.ts` callbacks.
            // Store it in localStorage only on the client.
            const accessToken = (session as { accessToken?: string }).accessToken;
            if (typeof window !== 'undefined' && accessToken) {
                try {
                    localStorage.setItem('accessToken', accessToken);
                } catch {
                    // ignore storage errors
                }
            }
        } else if (status === 'unauthenticated') {
            setUser(null);
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                } catch {
                    // ignore
                }
            }
        }
        setIsLoading(false);
    }, [session, status]);

    // Listen for token-expired events dispatched by the API client when a 401
    // cannot be resolved via refresh. This ensures the React auth state stays
    // in sync with the actual token state in localStorage.
    useEffect(() => {
        const handleTokenExpired = () => {
            console.warn('[AuthContext] Token expired – signing out');
            setUser(null);
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                } catch {
                    // ignore
                }
            }
            // Trigger NextAuth sign-out so the session cookie is also cleared
            signOut({ callbackUrl: '/login' });
        };

        window.addEventListener('auth:token-expired', handleTokenExpired);
        return () => window.removeEventListener('auth:token-expired', handleTokenExpired);
    }, []);

    const login = async (email: string, password: string) => {
        const { signIn } = await import('next-auth/react');
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        if (result?.error) {
            throw new Error(result.error);
        }
    };

    const logout = async () => {
        await signOut({ callbackUrl: '/' });
        setUser(null);
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } catch {
                // ignore
            }
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    const refreshUser = async () => {
        try {
            const response = await authApi.getCurrentUser();
            if (response) {
                setUser({
                    id: response.id,
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    profileImage: response.profileImage,
                    bio: response.bio,
                    role: response.role || 'STUDENT',
                    isVerified: response.isVerified || false,
                    currentStreak: response.currentStreak,
                });
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading: isLoading, login, logout, isAdmin, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
