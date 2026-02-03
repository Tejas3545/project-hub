import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Redirect directly to GitHub projects page
    redirect(`/domains/${slug}/github`);
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-light transition-colors mb-8 group">
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to all domains</span>
            </Link>

            {/* Domain Header */}
            <div className="glass-card p-10 mb-12 glow">
                <div className="badge badge-primary mb-6">
                    Domain
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 gradient-text">
                    {domain.name}
                </h1>
                {domain.description && (
                    <p className="text-xl text-text-secondary max-w-3xl leading-relaxed mb-8">
                        {domain.description}
                    </p>
                )}

                {/* GitHub Projects Button */}
                <div className="mb-8">
                    <Link
                        href={`/domains/${slug}/github`}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        <span>Explore 100+ GitHub Open Source Projects</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                {/* Project Count by Difficulty */}
                {domain.projectCountsByDifficulty && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
                            Projects by Difficulty
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/10">
                                <span className="text-text-secondary font-medium">Easy</span>
                                <span className="badge difficulty-easy text-lg font-bold">
                                    {domain.projectCountsByDifficulty.EASY}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/10">
                                <span className="text-text-secondary font-medium">Medium</span>
                                <span className="badge difficulty-medium text-lg font-bold">
                                    {domain.projectCountsByDifficulty.MEDIUM}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/10">
                                <span className="text-text-secondary font-medium">Hard</span>
                                <span className="badge difficulty-hard text-lg font-bold">
                                    {domain.projectCountsByDifficulty.HARD}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Projects Manager (Filters + Grid) */}
            <div className="mt-8">
                <DomainProjectsManager projects={domain.projects || []} />
            </div>
        </div>
    );
}
