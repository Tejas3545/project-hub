import Link from 'next/link';
import { Domain } from '@/types';

interface DomainCardProps {
    domain: Domain;
}

export default function DomainCard({ domain }: DomainCardProps) {
    const githubCount = domain._count?.githubProjects || 0;
    const regularCount = domain._count?.projects || 0;
    const projectCount = githubCount + regularCount;

    // SVG icons per domain
    const getDomainIcon = (slug: string) => {
        const iconClass = 'w-6 h-6 text-primary';
        switch (slug) {
            case 'web-development':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3.6 9h16.8M3.6 15h16.8" />
                        <path d="M12 3c2.2 2.6 3.4 5.6 3.4 9s-1.2 6.4-3.4 9c-2.2-2.6-3.4-5.6-3.4-9s1.2-6.4 3.4-9z" />
                    </svg>
                );
            case 'artificial-intelligence':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <rect x="5" y="5" width="14" height="14" rx="2" />
                        <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
                        <rect x="9" y="9" width="6" height="6" rx="1" />
                    </svg>
                );
            case 'machine-learning':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M3 20h18" />
                        <path d="M5 17l4-5 3 3 4-6 3 4" strokeLinejoin="round" />
                        <circle cx="5" cy="17" r="1" fill="currentColor" />
                        <circle cx="9" cy="12" r="1" fill="currentColor" />
                        <circle cx="12" cy="15" r="1" fill="currentColor" />
                        <circle cx="16" cy="9" r="1" fill="currentColor" />
                        <circle cx="19" cy="13" r="1" fill="currentColor" />
                    </svg>
                );
            case 'data-science':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M3 3v18h18" />
                        <rect x="7" y="10" width="3" height="8" rx="0.5" />
                        <rect x="12" y="6" width="3" height="12" rx="0.5" />
                        <rect x="17" y="13" width="3" height="5" rx="0.5" />
                    </svg>
                );
            case 'cybersecurity':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M12 2l8 4v6c0 5.25-3.5 10-8 12-4.5-2-8-6.75-8-12V6l8-4z" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                );
            default:
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                );
        }
    };

    return (
        <Link href={`/domains/${domain.slug}`} className="block group h-full">
            <div className="h-full bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 hover:-translate-y-1">
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        {getDomainIcon(domain.slug)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {domain.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-lg font-bold text-primary">{projectCount}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Projects</span>
                        </div>
                    </div>
                </div>

                {domain.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 min-h-[3rem]">
                        {domain.description}
                    </p>
                )}

                <div className="pt-4 border-t border-border">
                    <div className="flex items-center text-muted-foreground group-hover:text-primary font-medium text-sm transition-colors">
                        <span className="mr-2">Explore projects</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
