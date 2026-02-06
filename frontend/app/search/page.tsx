'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') || '';
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            searchProjects(query);
        } else {
            setProjects([]);
            setLoading(false);
        }
    }, [query]);

    const searchProjects = async (searchQuery: string) => {
        setLoading(true);
        try {
            const results = await projectApi.getAll({ search: searchQuery });
            setProjects(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-display font-bold gradient-text mb-8">
                    Search Projects
                </h1>

                <div className="mb-8">
                    <SearchBar placeholder="Search by title, problem, context..." />
                </div>

                {query && (
                    <div className="mb-6">
                        <p className="text-text-secondary">
                            {loading ? 'Searching...' : (
                                <>
                                    Found <span className="text-primary font-semibold">{projects.length}</span>
                                    {' '}result{projects.length !== 1 ? 's' : ''} for
                                    {' '}<span className="text-text-primary font-semibold">&ldquo;{query}&rdquo;</span>
                                </>
                            )}
                        </p>
                    </div>
                )}

                {!loading && projects.length > 0 && (
                    <div className="space-y-6">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="block glass-card p-6 hover:glow transition-all"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <h3 className="text-2xl font-display font-bold text-text-primary hover:text-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${project.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                                            project.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {project.difficulty}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                                    <span className="text-primary">{project.domain?.name || 'Unknown Domain'}</span>
                                    <span>•</span>
                                    <span>{project.minTime}-{project.maxTime} hours</span>
                                </div>

                                <p className="text-text-secondary line-clamp-2">
                                    {project.industryContext}
                                </p>

                                <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                                    <span>View Project</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && query && projects.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-text-primary mb-2">No results found</h3>
                        <p className="text-text-secondary mb-6">
                            Try different keywords or browse by domain
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            Browse Domains
                        </Link>
                    </div>
                )}

                {!query && !loading && (
                    <div className="glass-card p-12 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Start Searching</h3>
                        <p className="text-text-secondary">
                            Enter keywords to find relevant projects
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
