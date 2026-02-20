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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading domain context...</p>
                </div>
            </div>
        );
    }

    if (!domain) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white border border-border p-8 max-w-md w-full text-center rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">error</span>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Domain not found</h2>
                    <Link href="/domains" className="text-primary hover:text-primary transition-colors font-bold uppercase text-xs tracking-widest">
                        Back to all domains
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8">
            {/* Breadcrumb replacement / Back button */}
            <Link href="/domains" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group font-bold uppercase text-[10px] tracking-widest">
                <span className="material-symbols-outlined text-sm transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span>All Domains</span>
            </Link>

            {/* Domain Header */}
            <div className="bg-white border border-border p-10 rounded-2xl mb-12 relative overflow-hidden animate-fade-in-up">
                <div className="relative z-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-secondary border border-border text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        Domain
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
                        {domain.name}
                    </h1>
                    {domain.description && (
                        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mb-10">
                            {domain.description}
                        </p>
                    )}

                    {/* Project Count by Difficulty */}
                    {domain.projectCountsByDifficulty && (
                        <div className="pt-8 border-t border-border">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">
                                Difficulty Levels
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DifficultyCard label="Easy" count={domain.projectCountsByDifficulty.EASY || 0} color="emerald-500" />
                                <DifficultyCard label="Medium" count={domain.projectCountsByDifficulty.MEDIUM || 0} color="amber-500" />
                                <DifficultyCard label="Hard" count={domain.projectCountsByDifficulty.HARD || 0} color="rose-500" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Projects Manager */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-foreground">Projects</h2>
                    <div className="h-px flex-1 bg-border mx-8 hidden md:block"></div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Browse & start</span>
                </div>
                <GitHubProjectsList domainSlug={slug} />
            </div>
        </div>
    );
}

function DifficultyCard({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className={`p-4 bg-secondary/50 rounded-xl border border-border flex items-center justify-between group hover:border-${color}/30 transition-colors`}>
            <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest text-${color}`}>{label}</span>
                <span className="text-2xl font-black text-foreground">{count}</span>
            </div>
            <span className={`material-symbols-outlined text-3xl text-${color} opacity-10 group-hover:opacity-30 transition-opacity`}>api</span>
        </div>
    )
}
