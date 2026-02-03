'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'STUDENT' | 'ADMIN';
    isVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const userData = await authApi.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            // Token might be expired, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        setUser(data.user);
    };

    const register = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
        const response = await authApi.register(data);
        // After registration, user needs to login
        // Or you can auto-login by calling login(data.email, data.password)
        return response;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
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
