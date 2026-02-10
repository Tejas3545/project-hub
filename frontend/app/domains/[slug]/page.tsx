'use client';

import { use, useEffect, useState } from 'react';
import { domainApi } from '@/lib/api';
import Link from 'next/link';
import GitHubProjectsList from '@/components/GitHubProjectsList';
import { Domain } from '@/types';

export default function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [domain, setDomain] = useState<Domain | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadDomain = async () => {
            try {
                const data = await domainApi.getBySlug(slug);
                setDomain(data);
            } catch (error) {
                console.error('Failed to load domain:', error);
            } finally {
                setLoading(false);
            }
        };
        loadDomain();
    }, [slug]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-muted rounded mb-8"></div>
                    <div className="h-32 bg-muted rounded-xl mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!domain) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Domain not found</h2>
                    <Link href="/" className="text-primary hover:text-primary/80">
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to all domains</span>
            </Link>

            {/* Domain Header */}
            <div className="relative bg-card border border-border rounded-xl p-10 mb-12 shadow-sm overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-blue-purple opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-purple-cyan opacity-5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-accent border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                        Domain
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-cyan-blue tracking-tight">
                        {domain.name}
                    </h1>
                    {domain.description && (
                        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mb-8">
                            {domain.description}
                        </p>
                    )}

                    {/* Project Count by Difficulty */}
                    {domain.projectCountsByDifficulty && (
                        <div className="mt-8 pt-8 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Projects by Difficulty
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center justify-between p-4 bg-success-accent rounded-lg border border-green-500/20">
                                    <span className="text-muted-foreground font-medium">Easy</span>
                                    <span className="badge difficulty-easy text-lg font-bold">
                                        {domain.projectCountsByDifficulty.EASY}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-accent rounded-lg border border-yellow-500/20">
                                    <span className="text-muted-foreground font-medium">Medium</span>
                                    <span className="badge difficulty-medium text-lg font-bold">
                                        {domain.projectCountsByDifficulty.MEDIUM}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-red-500/20">
                                    <span className="text-muted-foreground font-medium">Hard</span>
                                    <span className="badge difficulty-hard text-lg font-bold">
                                        {domain.projectCountsByDifficulty.HARD}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Projects Manager (Filters + Grid) - GitHubProjects */}
            <div className="mt-8">
                <GitHubProjectsList domainSlug={slug} />
            </div>
        </div>
    );
}
