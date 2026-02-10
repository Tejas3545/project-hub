'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { projectApi, githubProjectApi } from '@/lib/api';
import { Project, GitHubProject } from '@/types';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

type UnifiedResult = {
    type: 'project';
    data: Project;
} | {
    type: 'github';
    data: GitHubProject;
};

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') || '';
    const [results, setResults] = useState<UnifiedResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (query.trim()) {
            searchAllProjects(query.trim());
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query]);

    const searchAllProjects = async (searchQuery: string) => {
        setLoading(true);
        try {
            // Search BOTH regular projects and GitHub projects in parallel
            const [regularProjects, githubResult] = await Promise.allSettled([
                projectApi.getAll({ search: searchQuery }),
                githubProjectApi.search(searchQuery, 1, 100),
            ]);

            const unified: UnifiedResult[] = [];

            // Add regular projects
            if (regularProjects.status === 'fulfilled' && Array.isArray(regularProjects.value)) {
                regularProjects.value.forEach((p: Project) => {
                    unified.push({ type: 'project', data: p });
                });
            }

            // Add GitHub projects
            if (githubResult.status === 'fulfilled' && githubResult.value?.projects) {
                githubResult.value.projects.forEach((p: GitHubProject) => {
                    unified.push({ type: 'github', data: p });
                });
            }

            setResults(unified);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            {/* Decorative Background */}
            <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-blue-purple opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-purple-cyan opacity-10 rounded-full blur-3xl"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                <h1 className="text-4xl font-bold text-gradient-cyan-blue mb-2">
                    Search Projects
                </h1>
                <p className="text-muted-foreground mb-8">
                    Search across all domains — find projects by title, description, skills, or keywords
                </p>

                <div className="mb-8">
                    <SearchBar placeholder="Search by title, skills, technology, domain..." />
                </div>

                {query && (
                    <div className="mb-6">
                        <p className="text-muted-foreground">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Searching across all projects...
                                </span>
                            ) : (
                                <>
                                    Found <span className="text-foreground font-semibold">{results.length}</span>
                                    {' '}result{results.length !== 1 ? 's' : ''} for
                                    {' '}<span className="text-foreground font-semibold">&ldquo;{query}&rdquo;</span>
                                </>
                            )}
                        </p>
                    </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                    <div className="space-y-4">
                        {results.map((result) => {
                            const id = result.data.id;
                            const isExpanded = expandedId === id;
                            const isGitHub = result.type === 'github';
                            const project = result.data;

                            return (
                                <div
                                    key={`${result.type}-${id}`}
                                    className="bg-card border border-border/30 rounded-xl overflow-hidden hover:border-primary/30 transition-all"
                                >
                                    {/* Header - Always visible */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-accent text-cyan-600 dark:text-cyan-300">
                                                        {(result.data as any).domain?.name || 'Project'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                        project.difficulty === 'EASY' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                        project.difficulty === 'MEDIUM' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                                        'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                                    }`}>
                                                        {project.difficulty === 'EASY' ? 'Beginner' : project.difficulty === 'MEDIUM' ? 'Intermediate' : 'Advanced'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground">
                                                    {project.title}
                                                </h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-md text-xs font-semibold shrink-0 ${
                                                project.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' :
                                                project.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50' :
                                                'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                                            }`}>
                                                {project.difficulty === 'EASY' ? 'Beginner' : project.difficulty === 'MEDIUM' ? 'Intermediate' : 'Advanced'}
                                            </span>
                                        </div>

                                        {/* Brief description */}
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                            {isGitHub
                                                ? (project as GitHubProject).description || (project as GitHubProject).caseStudy || ''
                                                : (project as Project).industryContext || (project as Project).caseStudy || ''
                                            }
                                        </p>

                                        {/* Quick info row */}
                                        <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                                            {isGitHub && (
                                                <>
                                                    {(project as GitHubProject).stars > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                            {(project as GitHubProject).stars.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {(project as GitHubProject).language && (
                                                        <span className="px-2 py-0.5 rounded bg-muted text-xs">{(project as GitHubProject).language}</span>
                                                    )}
                                                </>
                                            )}
                                            {!isGitHub && (
                                                <span>{(project as Project).minTime}-{(project as Project).maxTime} hours</span>
                                            )}
                                            {project.techStack && project.techStack.length > 0 && (
                                                <div className="flex gap-1 flex-wrap">
                                                    {project.techStack.slice(0, 4).map((tech, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded bg-blue-accent text-xs text-blue-600 dark:text-blue-300">{tech}</span>
                                                    ))}
                                                    {project.techStack.length > 4 && (
                                                        <span className="px-2 py-0.5 rounded bg-muted text-xs">+{project.techStack.length - 4}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleExpand(id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-accent text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                                            >
                                                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                                {isExpanded ? 'Collapse Details' : 'View All Details'}
                                            </button>
                                            <Link
                                                href={isGitHub ? `/github-projects/${id}` : `/projects/${id}`}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-blue-purple text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                            >
                                                Open Full Page
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-border/30 bg-muted/20">
                                            <div className="p-6 space-y-6">

                                                {/* Section 1: Case Study / Real-World Context */}
                                                {(isGitHub ? (project as GitHubProject).caseStudy : (project as Project).caseStudy) && (
                                                    <DetailSection
                                                        icon="📖"
                                                        title="Case Study / Real-World Context"
                                                        color="blue"
                                                    >
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            {isGitHub ? (project as GitHubProject).caseStudy : (project as Project).caseStudy}
                                                        </p>
                                                    </DetailSection>
                                                )}

                                                {/* Section 2: Problem Statement */}
                                                {(project as any).problemStatement && (
                                                    <DetailSection
                                                        icon="🎯"
                                                        title="Problem Statement"
                                                        color="purple"
                                                    >
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            {(project as any).problemStatement}
                                                        </p>
                                                    </DetailSection>
                                                )}

                                                {/* Section 3: Solution Description */}
                                                {(project as any).solutionDescription && (
                                                    <DetailSection
                                                        icon="💡"
                                                        title="Solution Description"
                                                        color="cyan"
                                                    >
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            {(project as any).solutionDescription}
                                                        </p>
                                                    </DetailSection>
                                                )}

                                                {/* Section 4: Prerequisites */}
                                                {renderPrerequisites(result)}

                                                {/* Section 5: Tech Stack & Skills */}
                                                {renderTechAndSkills(result)}

                                                {/* Section 6: Deliverables */}
                                                {renderDeliverables(result)}

                                                {/* Section 7: Source Code & Links */}
                                                {renderSourceAndLinks(result)}

                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* No results */}
                {!loading && query && results.length === 0 && (
                    <div className="bg-card border border-border/30 rounded-xl p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-accent flex items-center justify-center">
                            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
                        <p className="text-muted-foreground mb-6">
                            No projects matched &ldquo;{query}&rdquo;. Try different keywords or browse by domain.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 gradient-blue-purple text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            Browse Domains
                        </Link>
                    </div>
                )}

                {/* Empty state - no query */}
                {!query && !loading && (
                    <div className="bg-card border border-border/30 rounded-xl p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-accent flex items-center justify-center">
                            <svg className="w-10 h-10 text-purple-500 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Search All Projects</h3>
                        <p className="text-muted-foreground mb-2">
                            Enter keywords to find projects across all domains
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Try: &ldquo;machine learning&rdquo;, &ldquo;web development&rdquo;, &ldquo;cyber security&rdquo;, &ldquo;Python&rdquo;
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---- Helper Components ---- */

function DetailSection({ icon, title, color, children }: {
    icon: string;
    title: string;
    color: 'blue' | 'purple' | 'cyan' | 'green' | 'amber';
    children: React.ReactNode;
}) {
    const bgMap = {
        blue: 'bg-blue-accent',
        purple: 'bg-purple-accent',
        cyan: 'bg-cyan-accent',
        green: 'bg-success-accent',
        amber: 'bg-amber-50 dark:bg-amber-900/20',
    };

    return (
        <div className={`rounded-lg ${bgMap[color]} p-4`}>
            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <span>{icon}</span> {title}
            </h4>
            {children}
        </div>
    );
}

function renderPrerequisites(result: UnifiedResult) {
    if (result.type === 'github') {
        const gp = result.data as GitHubProject;
        const prereqs = gp.prerequisites;
        if (!prereqs || prereqs.length === 0) return null;
        return (
            <DetailSection icon="📋" title="Prerequisites" color="amber">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    {prereqs.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
            </DetailSection>
        );
    } else {
        const p = result.data as Project;
        if (!p.prerequisites || p.prerequisites.length === 0) return null;
        return (
            <DetailSection icon="📋" title="Prerequisites" color="amber">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    {p.prerequisites.map((pr, i) => <li key={i}>{pr}</li>)}
                </ul>
            </DetailSection>
        );
    }
}

function renderTechAndSkills(result: UnifiedResult) {
    const techStack = result.data.techStack || [];
    const skills = result.type === 'project'
        ? (result.data as Project).skillFocus || []
        : (result.data as GitHubProject).technicalSkills || [];

    if (techStack.length === 0 && skills.length === 0) return null;

    return (
        <DetailSection icon="🛠️" title="Tech Stack & Skills" color="cyan">
            <div className="space-y-3">
                {techStack.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-foreground mb-1.5">Technologies</p>
                        <div className="flex flex-wrap gap-2">
                            {techStack.map((t, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 text-xs font-medium">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {skills.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-foreground mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DetailSection>
    );
}

function renderDeliverables(result: UnifiedResult) {
    const deliverables = result.type === 'project'
        ? (result.data as Project).deliverables || []
        : (result.data as GitHubProject).deliverables || [];

    if (deliverables.length === 0) return null;

    return (
        <DetailSection icon="📦" title="Deliverables" color="green">
            <ul className="space-y-1.5 text-muted-foreground text-sm">
                {deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {d}
                    </li>
                ))}
            </ul>
        </DetailSection>
    );
}

function renderSourceAndLinks(result: UnifiedResult) {
    if (result.type === 'github') {
        const gp = result.data as GitHubProject;
        const hasLinks = gp.liveUrl || gp.downloadUrl;
        if (!hasLinks) return null;

        return (
            <DetailSection icon="🔗" title="Source Code & Links" color="blue">
                <div className="flex flex-wrap gap-3">
                    {gp.downloadUrl && (
                        <a
                            href={gp.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-blue-purple text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Source Code
                        </a>
                    )}
                    {gp.liveUrl && (
                        <a
                            href={gp.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success-accent text-green-600 dark:text-green-300 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-900/50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Live Preview
                        </a>
                    )}
                </div>
            </DetailSection>
        );
    } else {
        // Regular project - show link to full page
        return (
            <DetailSection icon="🔗" title="Project Resources" color="blue">
                <p className="text-muted-foreground text-sm mb-3">
                    View the full project page for complete setup guide, evaluation criteria, and more.
                </p>
                <Link
                    href={`/projects/${result.data.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-blue-purple text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Full Project
                </Link>
            </DetailSection>
        );
    }
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
