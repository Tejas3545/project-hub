'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { userApi, projectApi, socialApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UnifiedProject {
    id: string;
    projectId: string;
    title: string;
    difficulty: string;
    domainName: string;
    domainSlug?: string;
    subDomain?: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    timeSpent: number;
    timeUnit: 'minutes' | 'seconds';
    startedAt?: string;
    completedAt?: string;
    screenshots?: string[];
    minTime?: number;
    maxTime?: number;
    source: 'regular' | 'catalog';
    detailUrl: string;
    workspaceUrl: string;
}

interface UserStats {
    totalProjects: number;
    inProgress: number;
    completed: number;
    totalTimeSpent: number;
    currentStreak: number;
}

export default function WorkspacePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<UnifiedProject[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'recent' | 'time' | 'title'>('recent');

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        loadData();
    }, [user, router]);

    const loadData = async () => {
        try {
            const [progressData, bookmarksData, githubProgressData] = await Promise.all([
                userApi.getProgress(),
                userApi.getBookmarks(),
                userApi.getGithubProgress().catch((err: unknown) => { console.warn('Failed to load GitHub progress:', err); return []; }),
            ]);

            const unified: UnifiedProject[] = [];

            progressData.forEach((p: ProjectProgress) => {
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

            bookmarksData.forEach((bookmark: Bookmark) => {
                // Bookmark can reference either a regular project or a GitHub project
                const proj = bookmark.project || bookmark.githubProject;
                if (!proj) return; // skip bookmarks with no associated project

                const isGithub = !bookmark.project && !!bookmark.githubProject;
                const projId = proj.id;

                // Skip if already in the unified list
                if (unified.find(u => u.projectId === projId)) return;

                unified.push({
                    id: `bookmark-${bookmark.id}`,
                    projectId: projId,
                    title: proj.title || 'Untitled',
                    difficulty: proj.difficulty || 'MEDIUM',
                    domainName: proj.domain?.name || 'General',
                    domainSlug: proj.domain?.slug,
                    status: 'NOT_STARTED',
                    timeSpent: 0,
                    timeUnit: isGithub ? 'seconds' : 'minutes',
                    screenshots: proj.screenshots,
                    minTime: proj.minTime || proj.estimatedMinTime,
                    maxTime: proj.maxTime || proj.estimatedMaxTime,
                    source: isGithub ? 'catalog' : 'regular',
                    detailUrl: isGithub ? `/projects/${projId}` : `/projects/${projId}`,
                    workspaceUrl: isGithub ? `/workspace/${projId}?type=github` : `/workspace/${projId}`,
                });
            });

            githubProgressData.forEach((gp: ProjectProgress) => {
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
                    detailUrl: `/projects/${gp.githubProjectId}`,
                    workspaceUrl: `/workspace/${gp.githubProjectId}?type=github`,
                });
            });

            setProjects(unified);

            setStats({
                totalProjects: unified.length,
                inProgress: unified.filter(p => p.status === 'IN_PROGRESS').length,
                completed: unified.filter(p => p.status === 'COMPLETED').length,
                totalTimeSpent: unified.reduce((acc, p) => acc + (p.timeUnit === 'seconds' ? Math.round((p.timeSpent || 0) / 60) : (p.timeSpent || 0)), 0),
                currentStreak: user?.currentStreak || 0,
            });

        } catch (error) {
            console.error('Failed to load workspace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProjectStatus = async (item: UnifiedProject, newStatus: string) => {
        try {
            if (item.source === 'catalog') { await userApi.updateGithubProgress(item.projectId, { status: newStatus }); }
            else { await userApi.updateProgress(item.projectId, { status: newStatus }); }
            setProjects(prev => prev.map(p => p.id === item.id ? { ...p, status: newStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' } : p));
        } catch (error) { console.error('Failed to update status:', error); }
    };

    const filteredProjects = projects.filter(p => filterStatus === 'ALL' || p.status === filterStatus);
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime();
        return a.title.localeCompare(b.title);
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-10 p-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        My Projects
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage your active projects and track progress</p>
                </header>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-border">
                    <div className="flex flex-wrap items-center gap-3">
                        {[
                            { id: 'ALL', label: 'All Projects' },
                            { id: 'IN_PROGRESS', label: 'In Progress' },
                            { id: 'COMPLETED', label: 'Completed' },
                            { id: 'ON_HOLD', label: 'On Hold' },
                            { id: 'NOT_STARTED', label: 'Not Started' }
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => setFilterStatus(status.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white text-muted-foreground border border-border hover:bg-secondary'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                    <select
                        aria-label="Sort projects"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
                        className="bg-white border border-border rounded-lg text-foreground text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="recent">Recently Accesssed</option>
                        <option value="title">Alphabetical</option>
                    </select>
                </div>

                {/* Project List */}
                <div className="space-y-4">
                    {sortedProjects.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-border shadow-sm">
                            <span className="material-symbols-outlined text-4xl text-muted-foreground/50 mb-4">inventory_2</span>
                            <p className="text-muted-foreground font-medium mb-6">No projects found.</p>
                            <Link href="/projects" className="btn-primary inline-block">
                                Browse Projects
                            </Link>
                        </div>
                    ) : (
                        sortedProjects.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start">

                                <div className="size-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                                    {item.screenshots?.[0] ? (
                                        <Image src={item.screenshots[0]} alt={item.title} fill className="object-cover" />
                                    ) : (
                                        <div className="size-full flex items-center justify-center text-muted-foreground">
                                            <span className="material-symbols-outlined text-3xl">architecture</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div>
                                            <Link href={item.detailUrl} className="text-xl font-bold text-foreground hover:text-primary transition-colors block mb-1">
                                                {item.title}
                                            </Link>
                                            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <span className="text-primary">{item.domainName}</span>
                                                <span className="size-1 rounded-full bg-border"></span>
                                                <span>{item.difficulty}</span>
                                            </div>
                                        </div>
                                        <select
                                            aria-label={`Status for ${item.title}`}
                                            value={item.status}
                                            onChange={(e) => updateProjectStatus(item, e.target.value)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    item.status === 'IN_PROGRESS' ? 'bg-accent text-primary border-primary/20' :
                                                        'bg-secondary text-muted-foreground border-border'
                                                }`}
                                        >
                                            <option value="NOT_STARTED">Not Started</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="ON_HOLD">On Hold</option>
                                            <option value="COMPLETED">Completed</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Link href={item.workspaceUrl} className="btn-primary text-sm flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">terminal</span> Open Workspace
                                        </Link>
                                        <Link href={item.detailUrl} className="btn-secondary text-sm flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">visibility</span> View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Sidebar Stats */}
            <aside className="w-full xl:w-80 space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm sticky top-8">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">Overview</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Total Projects', val: stats?.totalProjects || 0, icon: 'inventory_2', color: 'text-primary', bg: 'bg-primary/10' },
                            { label: 'Active', val: stats?.inProgress || 0, icon: 'sync', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Completed', val: stats?.completed || 0, icon: 'task_alt', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Time Invested', val: stats ? `${Math.floor(stats.totalTimeSpent / 60)}h` : '0h', icon: 'schedule', color: 'text-purple-600', bg: 'bg-purple-50' }
                        ].map((stat, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
                                    <div className="text-2xl font-bold text-foreground">{stat.val}</div>
                                </div>
                                <div className={`size-10 rounded-xl flex items-center justify-center ${stat.color} ${stat.bg}`}>
                                    <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}

