'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectCard from '@/components/ProjectCard';
import WorkstationLayout from '@/components/layouts/WorkstationLayout';
import Link from 'next/link';
import { Bookmark, ProjectProgress } from '@/types';

export default function DashboardPage() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [progress, setProgress] = useState<ProjectProgress[]>([]);
    const [activeTab, setActiveTab] = useState<'progress' | 'bookmarks'>('progress');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bookmarksData, progressData] = await Promise.all([
                userApi.getBookmarks(),
                userApi.getProgress(),
            ]);
            setBookmarks(bookmarksData);
            setProgress(progressData);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Authentication')) {
                console.log('User not authenticated');
            } else {
                console.error('Failed to load dashboard data:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const progressByStatus = {
        IN_PROGRESS: progress.filter(p => p.status === 'IN_PROGRESS'),
        COMPLETED: progress.filter(p => p.status === 'COMPLETED'),
        ON_HOLD: progress.filter(p => p.status === 'ON_HOLD'),
    };

    return (
        <ProtectedRoute>
            <WorkstationLayout>
                <div className="h-full overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        {/* Decorative Background */}
                        <div className="fixed inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-accent rounded-full blur-3xl opacity-30"></div>
                            <div className="absolute bottom-40 left-20 w-80 h-80 bg-purple-accent rounded-full blur-3xl opacity-30"></div>
                        </div>

                        {/* Header */}
                        <div className="relative mb-8">
                            <h1 className="text-3xl font-semibold text-gradient-cyan-blue mb-2 tracking-tight">
                                Workspace
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Track your learning journey and manage your projects
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            <div className="bg-card border border-border/30 rounded-xl p-6 hover-lift relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-accent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 relative z-10">In Progress</p>
                                <p className="text-3xl font-bold text-primary relative z-10">{progressByStatus.IN_PROGRESS.length}</p>
                            </div>

                            <div className="bg-card border border-border/30 rounded-xl p-6 hover-lift relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-success-accent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 relative z-10">Completed</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 relative z-10">{progressByStatus.COMPLETED.length}</p>
                            </div>

                            <div className="bg-card border border-border/30 rounded-xl p-6 hover-lift relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-accent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 relative z-10">On Hold</p>
                                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 relative z-10">{progressByStatus.ON_HOLD.length}</p>
                            </div>

                            <div className="bg-card border border-border/30 rounded-xl p-6 hover-lift relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-accent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 relative z-10">Bookmarked</p>
                                <p className="text-3xl font-bold text-secondary">{bookmarks.length}</p>
                            </div>
                    </div>

                        {/* Tabs */}
                        <div className="mb-6">
                            <div className="flex gap-1 border-b border-border">
                                <button
                                    onClick={() => setActiveTab('progress')}
                                    className={`px-4 py-2.5 text-sm font-medium transition-all ${
                                        activeTab === 'progress'
                                            ? 'text-foreground border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    My Projects
                                </button>
                                <button
                                    onClick={() => setActiveTab('bookmarks')}
                                    className={`px-4 py-2.5 text-sm font-medium transition-all ${
                                        activeTab === 'bookmarks'
                                            ? 'text-foreground border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Bookmarked
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-56 bg-muted/40 border border-border/50 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {activeTab === 'progress' && (
                                    <div className="space-y-8">
                                        {progressByStatus.IN_PROGRESS.length > 0 && (
                                            <div>
                                                <h2 className="text-lg font-semibold mb-4 text-foreground tracking-tight">In Progress</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {progressByStatus.IN_PROGRESS.map((item: ProjectProgress) => (
                                                    <ProjectCard key={item.id} project={item.project} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                        {progressByStatus.COMPLETED.length > 0 && (
                                            <div>
                                                <h2 className="text-lg font-semibold mb-4 text-foreground tracking-tight">Completed</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {progressByStatus.COMPLETED.map((item: ProjectProgress) => (
                                                    <ProjectCard key={item.id} project={item.project} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                        {progressByStatus.ON_HOLD.length > 0 && (
                                            <div>
                                                <h2 className="text-lg font-semibold mb-4 text-foreground tracking-tight">On Hold</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {progressByStatus.ON_HOLD.map((item: ProjectProgress) => (
                                                    <ProjectCard key={item.id} project={item.project} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                        {progress.length === 0 && (
                                            <div className="text-center py-16">
                                                <p className="text-sm text-muted-foreground mb-6">No projects started yet</p>
                                                <Link 
                                                    href="/projects" 
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors text-sm font-medium"
                                                >
                                                    Browse Projects
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'bookmarks' && (
                                    <>
                                        {bookmarks.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {bookmarks.map((item: Bookmark) => (
                                                <ProjectCard key={item.id} project={item.project} />
                                            ))}
                                        </div>
                                        ) : (
                                            <div className="text-center py-16">
                                                <p className="text-sm text-muted-foreground mb-6">No bookmarked projects yet</p>
                                                <Link 
                                                    href="/projects" 
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors text-sm font-medium"
                                                >
                                                    Explore Projects
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </WorkstationLayout>
        </ProtectedRoute>
    );
}
