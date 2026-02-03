'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { projectApi, userApi } from '@/lib/api';
import Link from 'next/link';
import { Project, ProjectProgress } from '@/types';

const difficultyStyles: Record<'EASY' | 'MEDIUM' | 'HARD', string> = {
    EASY: 'difficulty-easy',
    MEDIUM: 'difficulty-medium',
    HARD: 'difficulty-hard',
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [progress, setProgress] = useState<ProjectProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            const [projectData, progressData] = await Promise.all([
                projectApi.getById(id),
                user ? userApi.getProjectProgress(id).catch(() => null) : Promise.resolve(null),
            ]);
            setProject(projectData);
            setProgress(progressData);
        } catch (error) {
            console.error('Failed to load project:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleProgressUpdate = async (status: string, notes?: string) => {
        if (!user) return;
        setSaving(true);
        try {
            const updated = await userApi.updateProgress(id, { status, notes });
            setProgress(updated);
        } catch (error) {
            console.error('Failed to update progress:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="h-64 glass-card animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!project) {
        return <div className="container mx-auto px-4 py-12">Project not found</div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
            {/* Breadcrumb */}
            <Link
                href={project.domain ? `/domains/${project.domain.slug}` : '/'}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-light transition-colors mb-8 group"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to {project.domain?.name || 'Projects'}</span>
            </Link>

            {/* Project Header */}
            <div className="glass-card p-10 mb-8 glow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <div className="badge badge-primary mb-4">
                            Project Brief
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
                            {project.title}
                        </h1>
                    </div>
                    <span className={`badge ${difficultyStyles[project.difficulty]}`}>
                        {project.difficulty}
                    </span>
                </div>

                <div className="flex flex-wrap gap-6 text-text-secondary">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{project.minTime}-{project.maxTime} hours</span>
                    </div>
                    {project.domain && (
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="font-medium">
                                {project.domain.name}
                                {project.subDomain && ` • ${project.subDomain}`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Tracker (if logged in) */}
            {user && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                            My Progress
                        </h2>
                        
                        <div className="space-y-6">
                            {/* Status Selector */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-3">
                                    Project Status
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { value: 'NOT_STARTED', label: 'Not Started', color: 'gray' },
                                        { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
                                        { value: 'COMPLETED', label: 'Completed', color: 'green' },
                                        { value: 'ON_HOLD', label: 'On Hold', color: 'yellow' },
                                    ].map(({ value, label, color }) => (
                                        <button
                                            key={value}
                                            onClick={() => handleProgressUpdate(value, progress?.notes)}
                                            disabled={saving}
                                            className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                                progress?.status === value
                                                    ? `bg-${color}-500/20 text-${color}-400 border-2 border-${color}-500/50`
                                                    : 'bg-white/5 text-text-muted hover:bg-white/10 border-2 border-transparent'
                                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Progress Info */}
                            {progress && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                                    {progress.startedAt && (
                                        <div>
                                            <p className="text-xs text-text-muted mb-1">Started</p>
                                            <p className="text-sm font-medium text-text-primary">
                                                {new Date(progress.startedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {progress.completedAt && (
                                        <div>
                                            <p className="text-xs text-text-muted mb-1">Completed</p>
                                            <p className="text-sm font-medium text-text-primary">
                                                {new Date(progress.completedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-text-muted mb-1">Last Updated</p>
                                        <p className="text-sm font-medium text-text-primary">
                                            {new Date(progress.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-3">
                                    Notes & Reflections
                                </label>
                                <textarea
                                    value={progress?.notes || ''}
                                    onChange={(e) => {
                                        if (progress) {
                                            setProgress({ ...progress, notes: e.target.value });
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (progress?.status) {
                                            handleProgressUpdate(progress.status, e.target.value);
                                        }
                                    }}
                                    placeholder="Keep track of your learning journey, challenges faced, and key takeaways..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                                <p className="text-xs text-text-muted mt-2">
                                    Notes are automatically saved when you click away
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Industry Context */}
            <section className="mb-8">
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-primary-light to-primary rounded-full"></div>
                        <span className="text-text-primary">Industry Context</span>
                    </h2>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {project.industryContext}
                    </p>
                </div>
            </section>

            {/* Problem Statement */}
            <section className="mb-8">
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-accent-warm to-primary rounded-full"></div>
                        <span className="text-text-primary">Problem Statement</span>
                    </h2>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {project.problemStatement}
                    </p>
                </div>
            </section>

            {/* Project Scope */}
            <section className="mb-8">
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                        What You&apos;ll Build
                    </h2>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {project.scope}
                    </p>
                </div>
            </section>

            {/* Prerequisites & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass-card p-8">
                    <h2 className="text-xl font-display font-bold mb-6 text-text-primary">
                        Prerequisites
                    </h2>
                    <ul className="space-y-3">
                        {project.prerequisites.map((prereq: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3 text-text-secondary">
                                <svg className="w-5 h-5 text-primary-light mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{prereq}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card p-8">
                    <h2 className="text-xl font-display font-bold mb-6 text-text-primary">
                        Skills You&apos;ll Practice
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {project.skillFocus.map((skill: string) => (
                            <span key={skill} className="badge badge-primary">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deliverables */}
            <section className="mb-8">
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                        Project Deliverables
                    </h2>
                    <ul className="space-y-4">
                        {project.deliverables.map((deliverable: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-4">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-light/20 to-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-sm font-bold text-primary-light">{idx + 1}</span>
                                </div>
                                <span className="text-text-secondary leading-relaxed">{deliverable}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Advanced Extensions */}
            {project.advancedExtensions && (
                <section className="mb-8">
                    <div className="glass-card p-8 border-2 border-accent-warm/20 glow">
                        <div className="flex items-center gap-3 mb-6">
                            <svg className="w-6 h-6 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h2 className="text-2xl font-display font-bold text-text-primary">
                                Advanced Extensions
                            </h2>
                        </div>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {project.advancedExtensions}
                        </p>
                    </div>
                </section>
            )}

            {/* Evaluation Criteria */}
            {project.evaluationCriteria && (
                <section>
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                            Evaluation Criteria
                        </h2>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {project.evaluationCriteria}
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}
