'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { projectApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface PendingProject {
    id: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    problemStatement: string;
    domain?: {
        name: string;
    };
    screenshots?: string[];
    createdAt: string | Date;
    isPublished: boolean;
}

export default function AdminApprovalsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<PendingProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            router.push('/');
            return;
        }
        loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filter]);

    const loadProjects = async () => {
        try {
            let allProjects = await projectApi.getAll({});
            
            // Filter based on status
            if (filter === 'pending') {
                allProjects = allProjects.filter((p) => !p.isPublished);
            } else if (filter === 'approved') {
                allProjects = allProjects.filter((p) => p.isPublished);
            }

            const pendingProjects: PendingProject[] = allProjects.map((p: any) => ({
                ...p,
                createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString(),
            }));
            setProjects(pendingProjects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (projectId: string) => {
        if (!confirm('Approve this project for publication?')) return;
        
        setProcessingId(projectId);
        try {
            await projectApi.update(projectId, { isPublished: true });
            setProjects(prev => prev.filter(p => p.id !== projectId));
            // TODO: Send notification to user
        } catch (error) {
            console.error('Failed to approve project:', error);
            alert('Failed to approve project');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (projectId: string) => {
        const reason = prompt('Reason for rejection (will be sent to user):');
        if (!reason) return;

        setProcessingId(projectId);
        try {
            await projectApi.delete(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            // TODO: Send rejection notification with reason
        } catch (error) {
            console.error('Failed to reject project:', error);
            alert('Failed to reject project');
        } finally {
            setProcessingId(null);
        }
    };

    const difficultyColors = {
        EASY: 'text-green-400 bg-green-500/20',
        MEDIUM: 'text-yellow-400 bg-yellow-500/20',
        HARD: 'text-red-400 bg-red-500/20',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-text-secondary">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="text-text-secondary hover:text-primary transition-colors text-sm mb-4 inline-block"
                    >
                        ← Back to Admin
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold gradient-text mb-2">
                                Project Approvals
                            </h1>
                            <p className="text-text-secondary">
                                Review and approve community submissions
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'pending'
                                        ? 'bg-primary text-white'
                                        : 'bg-dark-card text-text-secondary hover:bg-dark-lighter'
                                }`}
                            >
                                Pending {filter === 'pending' && `(${projects.length})`}
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'approved'
                                        ? 'bg-primary text-white'
                                        : 'bg-dark-card text-text-secondary hover:bg-dark-lighter'
                                }`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'all'
                                        ? 'bg-primary text-white'
                                        : 'bg-dark-card text-text-secondary hover:bg-dark-lighter'
                                }`}
                            >
                                All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                {projects.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-text-primary mb-2">
                            {filter === 'pending' ? 'No pending submissions' : 'No projects found'}
                        </h3>
                        <p className="text-text-secondary">
                            {filter === 'pending' ? 'All submissions have been reviewed' : 'Try changing the filter'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {projects.map((project) => (
                            <div key={project.id} className="glass-card p-6">
                                <div className="flex gap-6">
                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0">
                                        {project.screenshots?.[0] ? (
                                            <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                                                <Image
                                                    src={project.screenshots[0]}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-40 h-40 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                <svg className="w-16 h-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-text-primary mb-1">
                                                    {project.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-text-muted">
                                                    <span className="flex items-center gap-1">
                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                         </svg>
                                                         {project.domain?.name || 'Unknown'}
                                                     </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${difficultyColors[project.difficulty]}`}>
                                                        {project.difficulty}
                                                    </span>
                                                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            {project.isPublished ? (
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-lg border border-green-500/30">
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-lg border border-yellow-500/30">
                                                    Pending Review
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-text-secondary mb-4 line-clamp-2">
                                            {project.problemStatement}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="px-4 py-2 bg-dark-card border border-dark-lighter rounded-lg text-text-primary hover:border-primary/50 transition-colors text-sm font-medium"
                                            >
                                                View Details
                                            </Link>

                                            {!project.isPublished && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(project.id)}
                                                        disabled={processingId === project.id}
                                                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {processingId === project.id ? 'Processing...' : 'Approve'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleReject(project.id)}
                                                        disabled={processingId === project.id}
                                                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
