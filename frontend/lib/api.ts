import { Domain, Project } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Simple in-memory GET cache to deduplicate frequent GET requests and reduce rate-limit pressure.
// Safety: cache key includes the auth token when present to avoid leaking authenticated responses
// between users. TTL is short to favour freshness while preventing duplicate requests.
const getCache = new Map<string, { timestamp: number; data: any }>();
const GET_CACHE_TTL = parseInt(process.env.NEXT_PUBLIC_GET_CACHE_TTL_MS || '5000'); // default 5s
// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

// Helper to create authenticated fetch options
const getAuthHeaders = (token?: string): HeadersInit => {
    const authToken = token || getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
    };
};

// Helper to refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null;

    if (!refreshToken) {
        return null;
    }

    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
            // Refresh failed, clear tokens
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
            return null;
        }

        const data = await res.json();
        if (typeof window !== 'undefined' && data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        return data.accessToken;
    } catch {
        return null;
    }
};

// Fetch wrapper with automatic token refresh
const fetchWithAutoRefresh = async (
    url: string,
    options: RequestInit,
    retried = false
): Promise<Response> => {
    const res = await fetch(url, options);

    // If unauthorized and haven't retried yet, try refreshing the token
    if (res.status === 401 && !retried) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            // Retry with new token
            const newHeaders = {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
            };
            return fetchWithAutoRefresh(url, { ...options, headers: newHeaders }, true);
        }
    }

    return res;
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

    googleAuth: async (data: {
        email: string;
        firstName?: string;
        lastName?: string;
        profileImage?: string;
    }) => {
        const res = await fetch(`${API_URL}/auth/google-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Google authentication failed');
        }
        return res.json();
    },

    updateProfile: async (data: { firstName?: string; lastName?: string; profileImage?: string; bio?: string }) => {
        const res = await fetch(`${API_URL}/auth/update-profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Profile update failed');
        }
        return res.json();
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

    // Profile stats and activity
    getProfileStats: async () => {
        return api.get('/user/profile-stats');
    },

    getActivity: async () => {
        return api.get('/user/activity');
    },

    // GitHub Project Progress
    getGithubProgress: async () => {
        return api.get('/user/github-progress');
    },

    updateGithubProgress: async (projectId: string, data: { status?: string; notes?: string; timeSpent?: number; checklist?: boolean[] }) => {
        return api.put(`/user/github-progress/${projectId}`, data);
    },

    getGithubSingleProgress: async (projectId: string) => {
        try {
            return api.get(`/user/github-progress/${projectId}`);
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

    search: async (query: string, page: number = 1, limit: number = 50) => {
        const params = new URLSearchParams();
        params.append('q', query);
        params.append('page', String(page));
        params.append('limit', String(limit));
        return api.get<{ projects: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/github-projects/search?${params}`);
    },
};

// General API client for authenticated requests
export const api = {
    get: async <T = any>(endpoint: string, options?: { params?: Record<string, any>; cache?: RequestCache; token?: string }): Promise<T> => {
        const params = new URLSearchParams();
        if (options?.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const url = params.toString() ? `${API_URL}${endpoint}?${params}` : `${API_URL}${endpoint}`;

        // Determine token to include in cache key (if any)
        const tokenForKey = options?.token || getAuthToken() || '';
        const cacheKey = `${url}::${tokenForKey}`;

        // Only use in-memory cache when request cache isn't explicitly disabled
        const skipCache = options?.cache === 'no-store';

        if (!skipCache) {
            const cached = getCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < GET_CACHE_TTL) {
                return cached.data as T;
            }
        }

        try {
            console.log('Fetching from URL:', url);
            const res = await fetchWithAutoRefresh(url, {
                method: 'GET',
                headers: getAuthHeaders(options?.token),
                cache: options?.cache || 'no-store', // Default to no-store for fresh data
            });

            console.log('Response status:', res.status, res.statusText);

            if (!res.ok) {
                const errorText = await res.text();
                const error = JSON.parse(errorText || '{}');
                throw new Error(error.error || `Request failed with status ${res.status}`);
            }

            const json = await res.json();

            if (!skipCache) {
                try {
                    getCache.set(cacheKey, { timestamp: Date.now(), data: json });
                } catch {
                    // ignore cache set errors
                }
            }

            return json;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    post: async <T = any>(endpoint: string, body?: any): Promise<T> => {
        const res = await fetchWithAutoRefresh(`${API_URL}${endpoint}`, {
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

    put: async <T = any>(endpoint: string, body?: any, token?: string): Promise<T> => {
        const res = await fetchWithAutoRefresh(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || 'Request failed');
        }

        return res.json();
    },

    delete: async <T = any>(endpoint: string): Promise<T> => {
        const res = await fetchWithAutoRefresh(`${API_URL}${endpoint}`, {
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

// Social API (likes, comments)
export const socialApi = {
    // Project likes
    toggleProjectLike: async (projectId: string) => {
        return api.post(`/social/projects/${projectId}/like`, {});
    },

    getProjectLikeStatus: async (projectId: string) => {
        return api.get(`/social/projects/${projectId}/like/status`);
    },

    getProjectLikesCount: async (projectId: string) => {
        return api.get(`/social/projects/${projectId}/like/count`);
    },

    // Project comments
    addComment: async (projectId: string, text: string, parentId?: string) => {
        return api.post(`/social/projects/${projectId}/comments`, { text, parentId });
    },

    getComments: async (projectId: string, page = 1, limit = 10) => {
        return api.get(`/social/projects/${projectId}/comments?page=${page}&limit=${limit}`);
    },

    deleteComment: async (commentId: string) => {
        return api.delete(`/social/comments/${commentId}`);
    },

    upvoteComment: async (commentId: string) => {
        return api.post(`/social/comments/${commentId}/upvote`, {});
    },
};

// Notification API
export const notificationApi = {
    getNotifications: async (page = 1, limit = 20, token?: string) => {
        return api.get(`/notifications?page=${page}&limit=${limit}`, { token });
    },

    getUnreadCount: async (token?: string) => {
        return api.get('/notifications/unread-count', { token });
    },

    markAsRead: async (notificationId: string, token?: string) => {
        return api.put(`/notifications/${notificationId}/read`, {}, token);
    },

    markAllAsRead: async (token?: string) => {
        return api.put('/notifications/read-all', {}, token);
    },
};