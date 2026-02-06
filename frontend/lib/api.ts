import { Domain, Project } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

// Helper to create authenticated fetch options
const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// Authentication API
export const authApi = {
    register: async (data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            const errorMessage = error.details
                ? `${error.error}: ${error.details.map((d: { message: string }) => d.message).join(', ')}`
                : (error.error || 'Registration failed');
            throw new Error(errorMessage);
        }
        return res.json();
    },

    login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Login failed');
        }
        const data = await res.json();

        // Store tokens in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        return data;
    },

    logout: async () => {
        const token = getAuthToken();
        if (token) {
            try {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                });
            } catch {
                // Logout locally even if server request fails
            }
        }

        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    getCurrentUser: async () => {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) {
            throw new Error('Not authenticated');
        }
        return res.json();
    },

    refreshToken: async () => {
        const refreshToken = typeof window !== 'undefined'
            ? localStorage.getItem('refreshToken')
            : null;

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await res.json();

        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
        }

        return data;
    },
};

// Domain API
export const domainApi = {
    getAll: async (): Promise<Domain[]> => {
        // Add timestamp to bypass any caching layers
        return api.get<Domain[]>(`/domains?_t=${Date.now()}`);
    },

    getById: async (id: string): Promise<Domain> => {
        return api.get<Domain>(`/domains/${id}`);
    },

    getBySlug: async (slug: string): Promise<Domain> => {
        return api.get<Domain>(`/domains/slug/${slug}`);
    },

    // Admin only
    create: async (data: { name: string; slug: string; description?: string }) => {
        return api.post('/domains', data);
    },

    update: async (id: string, data: { name?: string; description?: string }) => {
        return api.put(`/domains/${id}`, data);
    },

    delete: async (id: string) => {
        return api.delete(`/domains/${id}`);
    },
};

// Project API (enhanced with admin operations)
export const projectApi = {
    getAll: async (filters?: { domainId?: string; difficulty?: string; search?: string }): Promise<Project[]> => {
        const params = new URLSearchParams();
        if (filters?.domainId) params.append('domainId', filters.domainId);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.search) params.append('search', filters.search);

        return api.get<Project[]>(`/projects?${params}`);
    },

    getById: async (id: string): Promise<Project> => {
        return api.get<Project>(`/projects/${id}`);
    },

    getByDomain: async (domainId: string): Promise<Project[]> => {
        return api.get<Project[]>(`/projects/domain/${domainId}`);
    },

    // Admin only
    create: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
        return api.post('/projects', data);
    },

    // Admin only
    update: async (id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) => {
        return api.put(`/projects/${id}`, data);
    },

    // Admin only
    delete: async (id: string) => {
        return api.delete(`/projects/${id}`);
    },
};

// User API (Bookmarks & Progress)
export const userApi = {
    // Bookmarks
    getBookmarks: async () => {
        return api.get('/user/bookmarks');
    },

    toggleBookmark: async (projectId: string) => {
        return api.post(`/user/bookmarks/${projectId}`);
    },

    checkBookmark: async (projectId: string) => {
        try {
            return api.get(`/user/bookmarks/${projectId}/check`);
        } catch {
            return { bookmarked: false };
        }
    },

    // Progress
    getProgress: async () => {
        return api.get('/user/progress');
    },

    updateProgress: async (projectId: string, data: { status: string; notes?: string }) => {
        return api.put(`/user/progress/${projectId}`, data);
    },

    getProjectProgress: async (projectId: string) => {
        try {
            return api.get(`/user/progress/${projectId}`);
        } catch {
            return { status: 'NOT_STARTED' };
        }
    },
};

// GitHub Projects API
export const githubProjectApi = {
    getAll: async (filters?: { domainId?: string; difficulty?: string; search?: string }) => {
        const params = new URLSearchParams();
        if (filters?.domainId) params.append('domainId', filters.domainId);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.search) params.append('search', filters.search);

        return api.get(`/github-projects?${params}`);
    },

    getById: async (id: string) => {
        return api.get(`/github-projects/${id}`);
    },

    getByDomain: async (domainId: string) => {
        return api.get(`/github-projects/domain/${domainId}`);
    },
};

// General API client for authenticated requests
export const api = {
    get: async <T = any>(endpoint: string, options?: { params?: Record<string, any>; cache?: RequestCache }): Promise<T> => {
        const params = new URLSearchParams();
        if (options?.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const url = params.toString() ? `${API_URL}${endpoint}?${params}` : `${API_URL}${endpoint}`;
        
        try {
            console.log('Fetching from URL:', url);
            const res = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders(),
                cache: options?.cache || 'no-store', // Default to no-store for fresh data
            });

            console.log('Response status:', res.status, res.statusText);
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Error response:', errorText);
                const error = JSON.parse(errorText || '{}');
                throw new Error(error.error || `Request failed with status ${res.status}`);
            }

            return res.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    post: async <T = any>(endpoint: string, body?: any): Promise<T> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || 'Request failed');
        }

        return res.json();
    },

    put: async <T = any>(endpoint: string, body?: any): Promise<T> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || 'Request failed');
        }

        return res.json();
    },

    delete: async <T = any>(endpoint: string): Promise<T> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || 'Request failed');
        }

        // DELETE might not return content
        const text = await res.text();
        return text ? JSON.parse(text) : {} as T;
    },
};

export default api;
