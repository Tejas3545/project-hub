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
    }, [id, user]);

    const handleDownload = async () => {
        if (!project || !user) {
            router.push('/login');
            return;
        }
        
        try {
            setIsDownloading(true);

            // Track download
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github-projects/${project.id}/track-download`, {
                method: 'POST',
            });

            // Trigger download
            const link = document.createElement('a');
            link.href = project.downloadUrl;
            link.download = `${project.repoName}-${project.defaultBranch}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to {project.domain?.name || 'Projects'}</span>
            </Link>

            {/* Project Header */}
            <div className="glass-card p-10 mb-8 glow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="badge badge-primary">GitHub Project</span>
                            {project.author && (
                                <span className="text-sm text-text-muted">by {project.author}</span>
                            )}
                        </div>
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
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium">{project.stars.toLocaleString()} stars</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent-warm" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{project.forks.toLocaleString()} forks</span>
                    </div>
                    {project.downloadCount > 0 && (
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        Sign in to download/live demo.
                    </p>
                )}
            </div>

            {/* Real-World Solution Framework - Case Study */}
            {project.caseStudy && (
                <section className="mb-8">
                    <div className="glass-card p-8 border-2 border-primary/20 glow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-light/20 to-primary/20 border border-primary/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">The Case Study</h2>
                                <p className="text-sm text-text-muted">Real-World Story</p>
                            </div>
                        </div>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {project.caseStudy}
                        </p>
                    </div>
                </section>
            )}

            {/* Problem Statement */}
            {project.problemStatement && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-warm/20 to-primary/20 border border-accent-warm/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">Problem Statement</h2>
                                <p className="text-sm text-text-muted">The Challenge to Solve</p>
                            </div>
                        </div>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {project.problemStatement}
                        </p>
                    </div>
                </section>
            )}

            {/* Solution Description */}
            {project.solutionDescription && (
                <section className="mb-8">
                    <div className="glass-card p-8 bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-primary/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">Solution Description</h2>
                                <p className="text-sm text-text-muted">How This Project Solves It</p>
                            </div>
                        </div>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {project.solutionDescription}
                        </p>
                    </div>
                </section>
            )}

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
                <section className="mb-8">
                    <div className="glass-card p-8 bg-gradient-to-br from-purple-500/5 to-transparent">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">Tech Stack</h2>
                                <p className="text-sm text-text-muted">Technologies Used</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.techStack.map((tech: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                    <span className="text-text-secondary font-medium">{tech}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Prerequisites */}
            {user && project.prerequisites && project.prerequisites.length > 0 && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h2 className="text-2xl font-display font-bold text-text-primary">Prerequisites</h2>
                        </div>
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
                </section>
            )}

            {/* Deliverables */}
            {user && project.deliverables && project.deliverables.length > 0 && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">Project Deliverables</h2>
                                <p className="text-sm text-text-muted">What You&apos;ll Submit</p>
                            </div>
                        </div>
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
            )}

            {/* Supposed Deadline */}
            {user && project.supposedDeadline && (
                <section className="mb-8">
                    <div className="glass-card p-8 border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">Supposed Deadline</h2>
                                <p className="text-sm text-text-muted">Realistic Completion Timeframe</p>
                            </div>
                        </div>
                        <p className="text-text-secondary text-lg font-medium">
                            {project.supposedDeadline}
                        </p>
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
