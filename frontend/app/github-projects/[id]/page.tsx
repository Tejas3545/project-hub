'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { GitHubProject } from '@/types';

export default function GitHubProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [project, setProject] = useState<GitHubProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const loadProject = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github-projects/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProject(data);
                }
            } catch (error) {
                console.error('Failed to load project:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [id]);

    const handleDownload = async () => {
        if (!project || !user) {
            router.push('/login');
            return;
        }
        
        try {
            setIsDownloading(true);

            const response = await fetch(project.downloadUrl);
            if (!response.ok) {
                throw new Error('Failed to download project');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.repoName}-${project.defaultBranch}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github-projects/${project.id}/track-download`, {
                    method: 'POST',
                });
            } catch (trackingError) {
                console.error('Failed to track download:', trackingError);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download project. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'Beginner';
            case 'MEDIUM': return 'Intermediate';
            case 'HARD': return 'Advanced';
            default: return difficulty;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'difficulty-easy';
            case 'MEDIUM': return 'difficulty-medium';
            case 'HARD': return 'difficulty-hard';
            default: return 'badge-secondary';
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
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-text-primary mb-4">Project Not Found</h1>
                    <Link href="/" className="text-primary-light hover:text-primary">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl relative">
            {/* Breadcrumb */}
            <Link
                href={project.domain ? `/domains/${project.domain.slug}` : '/'}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-light transition-colors mb-8 group"
            >
                <svg aria-hidden="true" className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to {project.domain?.name || 'Projects'}</span>
            </Link>

            {/* Project Header */}
            <div className="glass-card p-10 mb-8 glow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        {project.author && (
                            <div className="mb-4">
                                <span className="text-sm text-text-muted">by {project.author}</span>
                            </div>
                        )}
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
                            {project.title}
                        </h1>
                        <p className="text-text-secondary leading-relaxed">
                            {project.description}
                        </p>
                    </div>
                    <span className={`badge ${getDifficultyColor(project.difficulty)}`}>
                        {getDifficultyLabel(project.difficulty)}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-text-secondary mb-6">
                    {project.language && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary-light"></div>
                            <span className="font-medium">{project.language}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <svg aria-hidden="true" className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium">{project.stars.toLocaleString()} stars</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg aria-hidden="true" className="w-5 h-5 text-accent-warm" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{project.forks.toLocaleString()} forks</span>
                    </div>
                    {project.downloadCount > 0 && (
                        <div className="flex items-center gap-2">
                            <svg aria-hidden="true" className="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="font-medium">{project.downloadCount.toLocaleString()} downloads</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="px-6 py-3 bg-gradient-to-r from-primary-light to-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 border border-white/15 shadow-lg"
                    >
                        <span className="flex items-center gap-2">
                            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {isDownloading ? 'Downloading...' : 'Download Source Code'}
                        </span>
                    </button>
                    {project.liveUrl && (
                        user ? (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-accent-warm/20 text-accent-warm rounded-lg font-medium hover:bg-accent-warm/30 transition-colors border border-accent-warm/30"
                            >
                                <span className="flex items-center gap-2">
                                    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Live Demo
                                </span>
                            </a>
                        ) : (
                            <button
                                onClick={() => router.push('/login')}
                                className="px-6 py-3 bg-accent-warm/10 text-accent-warm rounded-lg font-medium hover:bg-accent-warm/20 transition-colors border border-accent-warm/30"
                            >
                                <span className="flex items-center gap-2">
                                    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Live Demo
                                </span>
                            </button>
                        )
                    )}
                </div>
                {!user && (
                    <p className="mt-2 text-sm text-text-muted">
                        Sign in to download the project or access the live demo.
                    </p>
                )}
            </div>

            {/* Real-World Solution Framework - Case Study */}
            {project.caseStudy && (
                <section className="mb-10">
                    <div className="glass-card p-10 border-l-4 border-primary shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <svg aria-hidden="true" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-3 tracking-tight">The Case Study</h2>
                                <p className="text-base text-primary-light font-medium uppercase tracking-wider">Real-World Story</p>
                            </div>
                        </div>
                        <div className="pl-21">
                            <p className="text-lg text-text-secondary leading-[1.8] whitespace-pre-wrap font-light">
                                {project.caseStudy}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Problem Statement */}
            {project.problemStatement && (
                <section className="mb-10">
                    <div className="glass-card p-10 border-l-4 border-accent-warm shadow-2xl hover:shadow-accent-warm/20 transition-all duration-300">
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <svg aria-hidden="true" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-3 tracking-tight">Problem Statement</h2>
                                <p className="text-base text-orange-400 font-medium uppercase tracking-wider">The Challenge to Solve</p>
                            </div>
                        </div>
                        <div className="pl-21">
                            <p className="text-lg text-text-secondary leading-[1.8] whitespace-pre-wrap font-light">
                                {project.problemStatement}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Solution Description */}
            {project.solutionDescription && (
                <section className="mb-10">
                    <div className="glass-card p-10 border-l-4 border-green-500 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 bg-gradient-to-br from-green-500/5 via-transparent to-transparent">
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <svg aria-hidden="true" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-3 tracking-tight">Solution Description</h2>
                                <p className="text-base text-green-400 font-medium uppercase tracking-wider">How This Project Solves It</p>
                            </div>
                        </div>
                        <div className="pl-21">
                            <p className="text-lg text-text-secondary leading-[1.8] whitespace-pre-wrap font-light">
                                {project.solutionDescription}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
                <section className="mb-10">
                    <div className="glass-card p-10 border-l-4 border-purple-500 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent">
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <svg aria-hidden="true" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-3 tracking-tight">Tech Stack</h2>
                                <p className="text-base text-purple-400 font-medium uppercase tracking-wider">Technologies Used</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-21">
                            {project.techStack.map((tech: string, idx: number) => (
                                <div key={idx} className="group flex items-center gap-4 p-5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-200">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 shrink-0 group-hover:scale-125 transition-transform"></div>
                                    <span className="text-text-primary text-base font-medium group-hover:text-purple-300 transition-colors">{tech}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Prerequisites */}
            {user && project.prerequisites && project.prerequisites.length > 0 && (
                <section className="mb-10">
                    <div className="glass-card p-10 border-l-4 border-blue-500 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <svg aria-hidden="true" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-3 tracking-tight">Prerequisites</h2>
                                <p className="text-base text-blue-400 font-medium uppercase tracking-wider">What You Need to Know</p>
                            </div>
                        </div>
                        <ul className="space-y-4 pl-21">
                            {project.prerequisites.map((prereq: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-4 group">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 flex items-center justify-center shrink-0 mt-1 group-hover:scale-110 group-hover:border-blue-400 transition-all">
                                        <svg aria-hidden="true" className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-text-secondary text-base leading-[1.7] font-light group-hover:text-text-primary transition-colors">{prereq}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* Deliverables */}
            {user && project.deliverables && project.deliverables.length > 0 && (
                <section className="mb-10">
                    <div className="glass-card p-10 border-l-4 border-indigo-500 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300">
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <svg aria-hidden="true" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-3 tracking-tight">Project Deliverables</h2>
                                <p className="text-base text-indigo-400 font-medium uppercase tracking-wider">What You&apos;ll Submit</p>
                            </div>
                        </div>
                        <ul className="space-y-5 pl-21">
                            {project.deliverables.map((deliverable: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-5 group">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                                        <span className="text-lg font-bold text-white">{idx + 1}</span>
                                    </div>
                                    <span className="text-text-secondary text-base leading-[1.7] font-light flex-1 pt-2 group-hover:text-text-primary transition-colors">{deliverable}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* Supposed Deadline */}
            {user && project.supposedDeadline && (
                <section className="mb-10">
                    <div className="glass-card p-10 border-l-4 border-yellow-500 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-transparent">
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <svg aria-hidden="true" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-3 tracking-tight">Supposed Deadline</h2>
                                <p className="text-base text-yellow-400 font-medium uppercase tracking-wider">Realistic Completion Timeframe</p>
                            </div>
                        </div>
                        <div className="pl-21">
                            <p className="text-2xl text-text-primary font-semibold tracking-wide">
                                {project.supposedDeadline}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Topics */}
            {user && project.topics && project.topics.length > 0 && (
                <section>
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-display font-bold mb-4 text-text-primary">
                            Project Topics
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {project.topics.map((topic: string) => (
                                <span key={topic} className="badge badge-secondary">
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
