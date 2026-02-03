'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { GitHubProject } from '@/types';

export default function GitHubProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
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
        if (!project) return;
        
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
                        <div className="flex items-center gap-3 mb-4">
                            <span className="badge badge-primary">GitHub Project</span>
                            {project.author && (
                                <span className="text-sm text-text-muted">by {project.author}</span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
                            {project.title}
                        </h1>
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
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Source Code
                            </>
                        )}
                    </button>
                    
                    <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-text-primary font-medium rounded-lg border border-white/10 hover:border-primary/50 transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        View on GitHub
                    </a>

                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-warm/20 hover:bg-accent-warm/30 text-accent-warm font-medium rounded-lg border border-accent-warm/50 transition-all duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Live Demo
                        </a>
                    )}
                </div>
            </div>

            {/* Project Introduction */}
            {project.introduction && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-primary-light to-primary rounded-full"></div>
                            <span className="text-text-primary">Project Introduction</span>
                        </h2>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {project.introduction}
                        </p>
                    </div>
                </section>
            )}

            {/* Project Description */}
            <section className="mb-8">
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                        About This Project
                    </h2>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {project.description}
                    </p>
                </div>
            </section>

            {/* Implementation & Framework */}
            {project.implementation && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-accent-warm to-primary rounded-full"></div>
                            <span className="text-text-primary">Implementation & Framework</span>
                        </h2>
                        <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {project.implementation}
                        </div>
                    </div>
                </section>
            )}

            {/* Technical Skills & Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Technical Skills */}
                {project.technicalSkills && project.technicalSkills.length > 0 && (
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-display font-bold mb-6 text-text-primary">
                            Technical Skills Used
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {project.technicalSkills.map((skill, index) => (
                                <span key={index} className="badge badge-primary">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tools Used */}
                {project.toolsUsed && project.toolsUsed.length > 0 && (
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-display font-bold mb-6 text-text-primary">
                            Tools & Platforms
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {project.toolsUsed.map((tool, index) => (
                                <span key={index} className="badge badge-secondary">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Concepts Used */}
            {project.conceptsUsed && project.conceptsUsed.length > 0 && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                            Programming Concepts
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {project.conceptsUsed.map((concept, index) => (
                                <span key={index} className="px-4 py-2 bg-gradient-to-r from-primary-light/20 to-primary/20 text-primary-light rounded-lg border border-primary/30 font-medium">
                                    {concept}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                            Technology Stack
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {project.techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-gradient-to-r from-accent-warm/20 to-accent-warm/10 text-accent-warm rounded-lg border border-accent-warm/30 font-medium"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Topics/Tags */}
            {project.topics && project.topics.length > 0 && (
                <section className="mb-8">
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                            Topics & Tags
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {project.topics.map((topic, index) => (
                                <span key={index} className="px-3 py-1 bg-white/5 text-text-secondary rounded-full text-sm border border-white/10">
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Source Code Information */}
            {project.sourceCode && (
                <section>
                    <div className="glass-card p-8 border-2 border-primary/20 glow">
                        <h2 className="text-2xl font-display font-bold mb-6 text-text-primary">
                            Source Code Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.sourceCode.hasReadme && (
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-text-secondary">Includes README.md</span>
                                </div>
                            )}
                            {project.sourceCode.hasRequirements && (
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-text-secondary">Includes Dependencies File</span>
                                </div>
                            )}
                            {project.sourceCode.fileSize && (
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                                    <svg className="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-text-secondary">
                                        Size: {(project.sourceCode.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                            )}
                            {project.sourceCode.repositoryUrl && (
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                                    <svg className="w-5 h-5 text-primary-light" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    <a href={project.sourceCode.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-primary transition-colors">
                                        View Repository
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
