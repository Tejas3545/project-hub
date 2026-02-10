'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { userApi, projectApi, socialApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Unified item that works for both regular and catalog projects
interface UnifiedProject {
    id: string;
    projectId: string;
    title: string;
    difficulty: string;
    domainName: string;
    domainSlug?: string;
    subDomain?: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    timeSpent: number; // minutes for regular, seconds for catalog
    timeUnit: 'minutes' | 'seconds';
    startedAt?: string;
    completedAt?: string;
    screenshots?: string[];
    minTime?: number;
    maxTime?: number;
    source: 'regular' | 'catalog'; // catalog = formerly "github"
    detailUrl: string;
    workspaceUrl: string;
}

interface UserStats {
    totalProjects: number;
    inProgress: number;
    completed: number;
    totalTimeSpent: number; // in minutes (combined)
    currentStreak: number;
}

export default function WorkspacePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<UnifiedProject[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'time' | 'title'>('recent');
    const [trendingProjects, setTrendingProjects] = useState<Array<{ id: string; title: string; likesCount: number }>>([]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadData = async () => {
        try {
            // Fetch regular progress, bookmarks, AND catalog project progress in parallel
            const [progressData, bookmarksData, githubProgressData] = await Promise.all([
                userApi.getProgress(),
                userApi.getBookmarks(),
                userApi.getGithubProgress().catch(() => []),
            ]);

            const unified: UnifiedProject[] = [];

            // Add regular projects with progress
            progressData.forEach((p: any) => {
                unified.push({
                    id: p.id,
                    projectId: p.projectId,
                    title: p.project?.title || 'Untitled',
                    difficulty: p.project?.difficulty || 'MEDIUM',
                    domainName: p.project?.domain?.name || 'General',
                    domainSlug: p.project?.domain?.slug,
                    status: p.status,
                    timeSpent: p.timeSpent || 0,
                    timeUnit: 'minutes',
                    startedAt: p.startedAt,
                    completedAt: p.completedAt,
                    screenshots: p.project?.screenshots,
                    minTime: p.project?.minTime,
                    maxTime: p.project?.maxTime,
                    source: 'regular',
                    detailUrl: `/projects/${p.projectId}`,
                    workspaceUrl: `/workspace/${p.projectId}`,
                });
            });

            // Add bookmarked projects that don't have progress yet
            bookmarksData.forEach((bookmark: any) => {
                if (!unified.find(u => u.projectId === bookmark.project.id && u.source === 'regular')) {
                    unified.push({
                        id: `bookmark-${bookmark.id}`,
                        projectId: bookmark.project.id,
                        title: bookmark.project.title,
                        difficulty: bookmark.project.difficulty || 'MEDIUM',
                        domainName: bookmark.project.domain?.name || 'General',
                        domainSlug: bookmark.project.domain?.slug,
                        status: 'NOT_STARTED',
                        timeSpent: 0,
                        timeUnit: 'minutes',
                        screenshots: bookmark.project.screenshots,
                        minTime: bookmark.project.minTime,
                        maxTime: bookmark.project.maxTime,
                        source: 'regular',
                        detailUrl: `/projects/${bookmark.project.id}`,
                        workspaceUrl: `/workspace/${bookmark.project.id}`,
                    });
                }
            });

            // Add catalog (formerly GitHub) projects from DB
            githubProgressData.forEach((gp: any) => {
                unified.push({
                    id: gp.id,
                    projectId: gp.githubProjectId,
                    title: gp.githubProject?.title || 'Untitled',
                    difficulty: gp.githubProject?.difficulty || 'MEDIUM',
                    domainName: gp.githubProject?.domain?.name || 'General',
                    domainSlug: gp.githubProject?.domain?.slug,
                    subDomain: gp.githubProject?.subDomain,
                    status: gp.status,
                    timeSpent: gp.timeSpent || 0,
                    timeUnit: 'seconds',
                    startedAt: gp.startedAt,
                    completedAt: gp.completedAt,
                    source: 'catalog',
                    detailUrl: `/github-projects/${gp.githubProjectId}`,
                    workspaceUrl: `/workspace/${gp.githubProjectId}?type=github`,
                });
            });

            setProjects(unified);

            // Calculate unified stats
            const totalProjects = unified.length;
            const inProgress = unified.filter(p => p.status === 'IN_PROGRESS').length;
            const completed = unified.filter(p => p.status === 'COMPLETED').length;
            // Normalize all to minutes for stats
            const totalTimeSpent = unified.reduce((acc, p) => {
                return acc + (p.timeUnit === 'seconds' ? Math.round((p.timeSpent || 0) / 60) : (p.timeSpent || 0));
            }, 0);

            setStats({
                totalProjects,
                inProgress,
                completed,
                totalTimeSpent,
                currentStreak: user?.currentStreak || 0,
            });

            // Load trending projects
            try {
                const allProjectsList = await projectApi.getAll();
                const top = allProjectsList.slice(0, 5);
                const trendingWithLikes = await Promise.all(
                    top.map(async (p: any) => {
                        try {
                            const likesResult = await socialApi.getProjectLikesCount(p.id);
                            return { id: p.id, title: p.title, likesCount: likesResult.count || 0 };
                        } catch {
                            return { id: p.id, title: p.title, likesCount: 0 };
                        }
                    })
                );
                trendingWithLikes.sort((a, b) => b.likesCount - a.likesCount);
                setTrendingProjects(trendingWithLikes.slice(0, 3));
            } catch {
                // Fallback to empty trending
            }
        } catch (error) {
            console.error('Failed to load workspace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProjectStatus = async (item: UnifiedProject, newStatus: string) => {
        try {
            if (item.source === 'catalog') {
                await userApi.updateGithubProgress(item.projectId, { status: newStatus });
            } else {
                await userApi.updateProgress(item.projectId, { status: newStatus });
            }
            
            // Update local state
            setProjects(prev => {
                const updated = prev.map(p =>
                    p.id === item.id ? { ...p, status: newStatus as any } : p
                );
                // Recalculate stats with updated data
                const inProgress = updated.filter(p => p.status === 'IN_PROGRESS').length;
                const completed = updated.filter(p => p.status === 'COMPLETED').length;
                setStats(s => s ? { ...s, inProgress, completed } : null);
                return updated;
            });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const filteredProjects = projects.filter(p => {
        if (filterStatus === 'ALL') return true;
        return p.status === filterStatus;
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime();
        }
        if (sortBy === 'time') {
            // Normalize to same unit for comparison
            const aTime = a.timeUnit === 'seconds' ? a.timeSpent / 60 : a.timeSpent;
            const bTime = b.timeUnit === 'seconds' ? b.timeSpent / 60 : b.timeSpent;
            return bTime - aTime;
        }
        return a.title.localeCompare(b.title);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-text-secondary">Loading workspace...</p>
                </div>
            </div>
        );
    }

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatProjectTime = (item: UnifiedProject) => {
        if (item.timeUnit === 'seconds') {
            const h = Math.floor(item.timeSpent / 3600);
            const m = Math.floor((item.timeSpent % 3600) / 60);
            return `${h}h ${m}m`;
        }
        return formatTime(item.timeSpent || 0);
    };

    const statusColors: Record<string, string> = {
        NOT_STARTED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        IN_PROGRESS: 'bg-terracotta-DEFAULT/20 text-terracotta-light border-terracotta-DEFAULT/30',
        COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
        ON_HOLD: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };

    return (
        <div className="min-h-screen bg-dark flex">
            {/* LEFT SIDEBAR - Navigation & Filters */}
            <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} hidden md:block bg-dark-card border-r border-dark-lighter flex-shrink-0 transition-all duration-300 sticky top-0 h-screen overflow-y-auto`}>
                <div className="p-4">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full mb-4 p-2 text-text-muted hover:text-text-primary transition-colors"
                        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <svg className={`w-6 h-6 mx-auto transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    {!sidebarCollapsed && (
                        <>
                            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
                                My Workspace
                            </h2>

                            {/* Navigation */}
                            <nav className="space-y-1 mb-6">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-dark-lighter rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    href="/projects"
                                    className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-dark-lighter rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Launchpad</span>
                                </Link>
                                <Link
                                    href="/submit-project"
                                    className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-dark-lighter rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>My Projects (Uploaded)</span>
                                </Link>
                                <Link
                                    href="/workspace"
                                    className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/10 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>Inventory</span>
                                </Link>
                                <button
                                    onClick={() => setFilterStatus('COMPLETED')}
                                    className="flex items-center gap-3 px-3 py-2 w-full text-left text-text-secondary hover:text-text-primary hover:bg-dark-lighter rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Completed Projects</span>
                                </button>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-dark-lighter rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Profile</span>
                                </Link>
                            </nav>

                            {/* Filters */}
                            <div className="border-t border-dark-lighter pt-4">
                                <h3 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">
                                    Filters
                                </h3>
                                <div className="space-y-1">
                                    {['ALL', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'NOT_STARTED'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                filterStatus === status
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-lighter'
                                            }`}
                                        >
                                            {status.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="border-t border-dark-lighter pt-4 mt-4">
                                <h3 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">
                                    Sort By
                                </h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    aria-label="Sort by"
                                    className="w-full px-3 py-2 bg-dark-card border border-dark-lighter rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="recent">Recently Updated</option>
                                    <option value="time">Most Time Spent</option>
                                    <option value="title">Title (A-Z)</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* CENTER PANEL - Project Inventory */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
                            Project Inventory
                        </h1>
                        <p className="text-text-secondary">
                            Manage and track your projects in one place
                        </p>
                    </div>

                    {sortedProjects.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="text-xl font-bold text-text-primary mb-2">No projects yet</h3>
                            <p className="text-text-secondary mb-6">
                                Start by exploring our project catalog and clicking &quot;Start This Project&quot;
                            </p>
                            <Link
                                href="/domains"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors"
                            >
                                Browse Projects
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedProjects.map((item) => (
                                <div
                                    key={`${item.source}-${item.id}`}
                                    className="glass-card p-6 hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex gap-4">
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0">
                                            {item.screenshots?.[0] ? (
                                                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={item.screenshots[0]}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <Link
                                                        href={item.workspaceUrl}
                                                        className="text-lg font-bold text-text-primary hover:text-primary transition-colors group-hover:underline"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                    <p className="text-sm text-text-muted">
                                                        {item.domainName} • {item.difficulty} {item.subDomain ? `• ${item.subDomain}` : ''}
                                                    </p>
                                                </div>
                                                
                                                {/* Status Dropdown */}
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => updateProjectStatus(item, e.target.value)}
                                                    aria-label={`Status for ${item.title}`}
                                                    className={`px-3 py-1 text-sm font-medium rounded-lg border transition-colors ${statusColors[item.status]}`}
                                                >
                                                    <option value="NOT_STARTED">Not Started</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="ON_HOLD">On Hold</option>
                                                    <option value="COMPLETED">Completed</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formatProjectTime(item)} logged
                                                </span>
                                                {item.minTime != null && item.maxTime != null && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{item.minTime}-{item.maxTime}h estimated</span>
                                                    </>
                                                )}
                                                {item.startedAt && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Started {new Date(item.startedAt).toLocaleDateString()}</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                {item.status === 'NOT_STARTED' && (
                                                    <button
                                                        onClick={() => updateProjectStatus(item, 'IN_PROGRESS')}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Start Project
                                                    </button>
                                                )}
                                                {(item.status === 'IN_PROGRESS' || item.status === 'ON_HOLD') && (
                                                    <button
                                                        onClick={() => updateProjectStatus(item, 'COMPLETED')}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Mark as Done
                                                    </button>
                                                )}
                                                <Link
                                                    href={item.workspaceUrl}
                                                    className="text-sm text-primary hover:text-primary-light font-medium flex items-center gap-1"
                                                >
                                                    Open Workspace →
                                                </Link>
                                                <Link
                                                    href={item.detailUrl}
                                                    className="text-sm text-text-muted hover:text-text-secondary"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* RIGHT SIDEBAR - Quick Stats */}
            <aside className="hidden lg:block w-80 bg-dark-card border-l border-dark-lighter flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-lg font-display font-bold text-text-primary mb-6">
                        Quick Stats
                    </h2>

                    {stats && (
                        <div className="space-y-4">
                            <div className="glass-card p-4 border-l-4 border-primary">
                                <div className="text-2xl font-bold text-text-primary">{stats.totalProjects}</div>
                                <div className="text-sm text-text-muted">Total Projects</div>
                            </div>

                            <div className="glass-card p-4 border-l-4 border-terracotta-DEFAULT">
                                <div className="text-2xl font-bold text-text-primary">{stats.inProgress}</div>
                                <div className="text-sm text-text-muted">In Progress</div>
                            </div>

                            <div className="glass-card p-4 border-l-4 border-green-500">
                                <div className="text-2xl font-bold text-text-primary">{stats.completed}</div>
                                <div className="text-sm text-text-muted">Completed</div>
                            </div>

                            <div className="glass-card p-4 border-l-4 border-yellow-500">
                                <div className="text-2xl font-bold text-text-primary">{formatTime(stats.totalTimeSpent)}</div>
                                <div className="text-sm text-text-muted">Total Time Invested</div>
                            </div>

                            <div className="glass-card p-4 border-l-4 border-orange-500">
                                <div className="text-2xl font-bold text-text-primary">{stats.currentStreak} days</div>
                                <div className="text-sm text-text-muted">Current Streak</div>
                            </div>
                        </div>
                    )}

                    {/* Trending Projects (Real Data) */}
                    <div className="mt-8 border-t border-dark-lighter pt-6">
                        <h3 className="text-sm font-bold text-text-muted mb-4 uppercase tracking-wider">
                            Trending This Week
                        </h3>
                        <div className="space-y-3">
                            {trendingProjects.length > 0 ? (
                                trendingProjects.map((trend, idx) => (
                                    <Link key={trend.id} href={`/projects/${trend.id}`} className="flex items-center gap-3 hover:bg-dark-lighter rounded-lg p-1 transition">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-text-primary truncate">{trend.title}</div>
                                            <div className="text-xs text-text-muted">{trend.likesCount} likes</div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-text-muted">No trending projects yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
