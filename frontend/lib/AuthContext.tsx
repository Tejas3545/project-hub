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
            // @ts-ignore
            const mappedUser: User = {
                // @ts-ignore
                id: session.user.id,
                email: session.user.email!,
                // @ts-ignore
                firstName: session.user.firstName || session.user.name?.split(' ')[0],
                // @ts-ignore
                lastName: session.user.lastName || session.user.name?.split(' ').slice(1).join(' '),
                // @ts-ignore
                profileImage: session.user.profileImage || session.user.image,
                // @ts-ignore
                bio: session.user.bio,
                // @ts-ignore
                role: (session.user.role as 'STUDENT' | 'ADMIN') || 'STUDENT',
                // @ts-ignore
                isVerified: session.user.isVerified || false,
            };
            setUser(mappedUser);
            // Persist backend-compatible access token (if provided by next-auth callbacks)
            // so the API client can attach the Authorization header.
            // Note: accessToken is injected into the session via `auth.ts` callbacks.
            // Store it in localStorage only on the client.
            // @ts-ignore
            const accessToken = (session as any).accessToken;
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

    const login = async (email: string, password: string) => {
        // Sign in logic handled by next-auth or external auth provider
        // This is a placeholder that redirects to login page
        await window.location.assign('/login');
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

    return (
        <AuthContext.Provider value={{ user, loading: isLoading, login, logout, isAdmin }}>
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
