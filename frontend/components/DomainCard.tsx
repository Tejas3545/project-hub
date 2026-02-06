import Link from 'next/link';
import { Domain } from '@/types';

interface DomainCardProps {
    domain: Domain;
}

export default function DomainCard({ domain }: DomainCardProps) {
    // Combine both GitHub projects and regular projects
    const githubCount = domain._count?.githubProjects || 0;
    const regularCount = domain._count?.projects || 0;
    const projectCount = githubCount + regularCount;

    return (
        <Link href={`/domains/${domain.slug}/github`} className="block group h-full">
            <div className="relative h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary-light/10 hover:-translate-y-1">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/0 to-primary-light/0 group-hover:from-primary-dark/5 group-hover:to-primary-light/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                
                <div className="relative z-10">
                    {/* Header with title and count */}
                    <div className="flex items-start justify-between mb-4 gap-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary-light transition-colors duration-300 leading-tight">
                            {domain.name}
                        </h3>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-dark/20 rounded-lg shrink-0">
                            <span className="text-lg font-bold text-primary-light">{projectCount}</span>
<span className="text-xs text-gray-400 uppercase tracking-wider">Projects</span>
                        </div>
                    </div>

                    {/* Description */}
                    {domain.description && (
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 min-h-[3rem]">
                            {domain.description}
                        </p>
                    )}

                    {/* Bottom section with explore link */}
                    <div className="pt-4">
                        <div className="flex items-center text-gray-400 group-hover:text-primary-light font-medium text-sm transition-colors duration-300">
                            <span className="mr-2">Explore projects</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
