'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectCard from '@/components/ProjectCard';
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
            console.error('Failed to load dashboard data:', error);
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-display font-bold mb-3">
                            <span className="gradient-text">My Dashboard</span>
                        </h1>
                        <p className="text-xl text-text-secondary">
                            Track your learning journey and manage your projects
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-muted text-sm mb-1">In Progress</p>
                                    <p className="text-3xl font-bold text-primary">{progressByStatus.IN_PROGRESS.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-muted text-sm mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-green-400">{progressByStatus.COMPLETED.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-muted text-sm mb-1">On Hold</p>
                                    <p className="text-3xl font-bold text-yellow-400">{progressByStatus.ON_HOLD.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-muted text-sm mb-1">Bookmarked</p>
                                    <p className="text-3xl font-bold text-indigo-400">{bookmarks.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8">
                        <div className="flex gap-4 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`px-6 py-3 font-medium transition-all ${
                                    activeTab === 'progress'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                My Projects
                            </button>
                            <button
                                onClick={() => setActiveTab('bookmarks')}
                                className={`px-6 py-3 font-medium transition-all ${
                                    activeTab === 'bookmarks'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                Bookmarked
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 glass-card animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {activeTab === 'progress' && (
                                <div className="space-y-8">
                                    {progressByStatus.IN_PROGRESS.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold mb-4 text-text-primary">In Progress</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {progressByStatus.IN_PROGRESS.map((item: ProjectProgress) => (
                                                    <ProjectCard key={item.id} project={item.project} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {progressByStatus.COMPLETED.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold mb-4 text-text-primary">Completed</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {progressByStatus.COMPLETED.map((item: ProjectProgress) => (
                                                    <ProjectCard key={item.id} project={item.project} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {progressByStatus.ON_HOLD.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold mb-4 text-text-primary">On Hold</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {progressByStatus.ON_HOLD.map((item: ProjectProgress) => (
                                                    <ProjectCard key={item.id} project={item.project} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {progress.length === 0 && (
                                        <div className="text-center py-16">
                                            <p className="text-text-muted text-lg mb-6">No projects started yet</p>
                                            <Link href="/projects" className="btn-primary">
                                                Browse Projects
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'bookmarks' && (
                                <>
                                    {bookmarks.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {bookmarks.map((item: Bookmark) => (
                                                <ProjectCard key={item.id} project={item.project} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <p className="text-text-muted text-lg mb-6">No bookmarked projects yet</p>
                                            <Link href="/projects" className="btn-primary">
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
        </ProtectedRoute>
    );
}
