'use client';

import Link from 'next/link';
import { Domain } from '@/types';

interface DomainCardProps {
    domain: Domain;
}

export default function DomainCard({ domain }: DomainCardProps) {
    const githubCount = domain._count?.githubProjects || 0;
    const regularCount = domain._count?.projects || 0;
    const projectCount = githubCount + regularCount;

    const getDomainIcon = (slug: string) => {
        switch (slug) {
            case 'web-development': return 'globe';
            case 'artificial-intelligence': return 'neuroscience';
            case 'machine-learning': return 'insights';
            case 'data-science': return 'monitoring';
            case 'cybersecurity': return 'shield_person';
            default: return 'architecture';
        }
    };

    return (
        <Link href={`/domains/${domain.slug}`} className="block group h-full">
            <div className="h-full bg-white rounded-xl border border-border shadow-sm p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-md relative overflow-hidden flex flex-col">
                <div className="flex flex-col h-full">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-all duration-300">
                        <span className="material-symbols-outlined text-xl">{getDomainIcon(domain.slug)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {domain.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                            {projectCount} Challenges
                        </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1 line-clamp-2">
                        {domain.description || 'Explore modular architectural briefs focused on high-performance system delivery within this domain.'}
                    </p>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                            Explore
                        </span>
                        <span className="material-symbols-outlined text-base text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
