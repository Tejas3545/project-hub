'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useSession } from 'next-auth/react';

import { ProjectProgress, GitHubProjectProgress, TimeSession } from '@/types';
import { LayoutDashboard, Clock, CheckCircle2, PlayCircle, Star, ArrowRight, ExternalLink, Activity, Rocket, BookOpen } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: session } = useSession();
    const [progress, setProgress] = useState<ProjectProgress[]>([]);
    const [githubProgress, setGithubProgress] = useState<GitHubProjectProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState<TimeSession | null>(null);
    const [sessionTime, setSessionTime] = useState(0);

    useEffect(() => {
        if (user) {
            loadData();
            fetchActiveSession();
        }
    }, [user]);

    // Live session timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeSession) {
            const startTime = new Date(activeSession.startTime).getTime();
            interval = setInterval(() => {
                setSessionTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    const fetchActiveSession = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/timer/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setActiveSession(data.session);
            }
        } catch (error) {
            console.error('Fetch active session error:', error);
        }
    };

    const formatSessionTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [ progressData, githubData] = await Promise.all([
                userApi.getProgress(),
                userApi.getGithubProgress(),
            ]);
            setProgress(progressData);
            setGithubProgress(githubData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        inProgress: progress.filter(p => p.status === 'IN_PROGRESS').length + githubProgress.filter(p => p.status === 'IN_PROGRESS').length,
        completed: progress.filter(p => p.status === 'COMPLETED').length + githubProgress.filter(p => p.status === 'COMPLETED').length,
        onHold: progress.filter(p => p.status === 'ON_HOLD').length + githubProgress.filter(p => p.status === 'ON_HOLD').length,
        totalHours: Math.floor(githubProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0) / 3600)
    };

    const userName = session?.user?.name || user?.firstName || 'User';

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-muted-foreground mt-1">Here&apos;s an overview of your project progress and activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/projects" className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm">
                        Browse Projects
                    </Link>
                    <Link href="/workspace" className="px-5 py-2.5 bg-white border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-all">
                        My Workspace
                    </Link>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'In Progress', value: stats.inProgress, icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'On Hold', value: stats.onHold, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Total Hours', value: `${stats.totalHours}h`, icon: Activity, color: 'text-violet-500', bg: 'bg-violet-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold text-foreground">{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content: Recent Projects */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-foreground">Active Projects</h3>
                        <Link href="/workspace" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-secondary/30">
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="inline-block w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                                            </td>
                                        </tr>
                                    ) : (progress.length === 0 && githubProgress.length === 0) ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                                                No active projects in your workspace.
                                            </td>
                                        </tr>
                                    ) : (
                                        [
                                            ...progress.map(p => ({ 
                                                ...p, 
                                                type: 'standard' as const, 
                                                title: p.project.title, 
                                                id: p.id, 
                                                projectId: p.projectId,
                                                linkId: p.projectId
                                            })),
                                            ...githubProgress.map(p => ({ 
                                                ...p, 
                                                type: 'github' as const, 
                                                title: p.githubProject.title, 
                                                id: p.id, 
                                                githubProjectId: p.githubProjectId,
                                                linkId: p.githubProjectId
                                            }))
                                        ].slice(0, 5).map((item) => (
                                            <tr key={item.id} className="hover:bg-secondary/20 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-white group-hover:text-primary transition-all shadow-inner">
                                                            <Activity size={18} />
                                                        </div>
                                                        <p className="font-semibold text-foreground">{item.title}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3 w-32">
                                                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full bg-primary ${item.status === 'COMPLETED' ? 'w-full' : 'w-[45%]'}`}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {item.status === 'COMPLETED' ? '100%' : '45%'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        <span className={`size-1.5 rounded-full ${
                                                            item.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                            item.status === 'ON_HOLD' ? 'bg-amber-500' :
                                                            'bg-blue-500'
                                                        }`}></span>
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Link href={item.type === 'github' ? `/projects/${item.linkId}` : `/workspace/${item.linkId}`} className="text-muted-foreground hover:text-primary transition-colors">
                                                        <ExternalLink size={18} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Active Timer */}
                    {activeSession && (
                        <div className="bg-foreground text-white p-8 rounded-xl shadow-lg relative overflow-hidden group">
                            <div className="relative z-10 space-y-5">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                    <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Currently Working
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold line-clamp-1">{activeSession.project?.title || 'Active Session'}</h4>
                                    <p className="text-5xl font-mono font-bold mt-2 tracking-tighter">{formatSessionTime(sessionTime)}</p>
                                </div>
                                <Link href="/workspace" className="block w-full py-3 bg-white text-foreground text-center text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition-all">
                                    Go to Workspace
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                        </div>
                    )}

                    {/* Quick Launch */}
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <h4 className="font-bold text-foreground mb-4">Quick Launch</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { title: 'Browse Projects', href: '/projects', icon: Rocket },
                                { title: 'My Workspace', href: '/workspace', icon: LayoutDashboard },
                                { title: 'Learning Paths', href: '/learning-paths', icon: BookOpen },
                                { title: 'Achievements', href: '/achievements', icon: Star },
                            ].map((link, i) => (
                                <Link key={i} href={link.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-all group">
                                    <div className="p-2 rounded-md bg-secondary group-hover:bg-white text-muted-foreground group-hover:text-primary transition-all">
                                        <link.icon size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{link.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
