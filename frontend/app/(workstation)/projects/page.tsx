'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { githubProjectApi, domainApi, userApi } from '@/lib/api';
import GitHubProjectCard from '@/components/GitHubProjectCard';
import ProjectFilters from '@/components/ProjectFilters';
import SearchBar from '@/components/SearchBar';
import { GitHubProject } from '@/types';

const PAGE_SIZE = 24;

interface Domain {
    id: string;
    name: string;
    slug: string;
}

function ProjectsContent() {
    const [projects, setProjects] = useState<GitHubProject[]>([]);
    const [allDomains, setAllDomains] = useState<{ id: string; name: string; slug: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        difficulty: [] as string[],
        minTime: 0,
        maxTime: 100,
        skills: [] as string[],
        domains: [] as string[],
    });
    const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        domainApi.getAll()
            .then(domains => setAllDomains(domains.map((d: Domain) => ({ id: d.id, name: d.name, slug: d.slug }))))
            .catch(console.error);
    }, []);

    const fetchProjects = useCallback(async (pageNum: number, append: boolean = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const result = await githubProjectApi.getAll({
                page: pageNum,
                limit: PAGE_SIZE,
                search: searchQuery.trim() || undefined,
                difficulty: filters.difficulty.length === 1 ? filters.difficulty[0] : undefined,
                domainId: filters.domains.length === 1 ? filters.domains[0] : undefined,
            });

            const fetched = (result.projects || []) as GitHubProject[];
            setProjects(prev => append ? [...prev, ...fetched] : fetched);
            setTotalPages(result.pagination.totalPages);
            setTotalCount(result.pagination.total);
            setPage(pageNum);

            // Batch-fetch bookmark status for the loaded projects (single DB query)
            if (fetched.length > 0) {
                const ids = fetched.map(p => p.id);
                userApi.checkBookmarksBatch(ids).then(map => {
                    setBookmarkMap(prev => ({ ...prev, ...map }));
                }).catch(() => { });
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, filters.difficulty, filters.domains]);

    useEffect(() => {
        fetchProjects(1, false);
    }, [fetchProjects]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
                    fetchProjects(page + 1, true);
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [page, totalPages, loadingMore, fetchProjects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Difficulty filter
            if (filters.difficulty.length > 1 && !filters.difficulty.includes(project.difficulty)) return false;
            
            // Domain filter
            if (filters.domains.length > 1 && !filters.domains.includes(project.domainId)) return false;

            // Time commitment filter - Real-time responsive filtering
            const projectMinTime = project.estimatedMinTime || 0;
            const projectMaxTime = project.estimatedMaxTime || 100;
            
            // Check if project's time range overlaps with selected range
            // Project is shown if ANY part of its time range falls within the filter range
            const projectStartsBeforeFilterEnds = projectMinTime <= filters.maxTime;
            const projectEndsAfterFilterStarts = projectMaxTime >= filters.minTime;
            
            if (!(projectStartsBeforeFilterEnds && projectEndsAfterFilterStarts)) {
                return false;
            }

            // Skills filter
            if (filters.skills.length > 0) {
                const projectSkills = [...(project.technicalSkills || []), ...(project.techStack || [])];
                if (!projectSkills.some(skill => filters.skills.includes(skill))) return false;
            }
            
            return true;
        });
    }, [projects, filters]);

    useEffect(() => {
        if (progressRef.current && totalCount > 0) {
            const percentage = Math.min(100, (filteredProjects.length / totalCount) * 100);
            progressRef.current.style.width = `${percentage}%`;
        }
    }, [filteredProjects.length, totalCount]);

    const availableSkills = useMemo(() => {
        const skills = new Set<string>();
        projects.forEach(p => {
            (p.technicalSkills || []).forEach(s => skills.add(s));
            (p.techStack || []).forEach(s => skills.add(s));
        });
        return Array.from(skills).sort();
    }, [projects]);

    const handleSearch = (query: string) => setSearchQuery(query);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                            <span>Open Projects</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                            Project Library
                        </h1>
                        <p className="text-muted-foreground text-base max-w-2xl">
                            Explore hundreds of real-world project briefs across multiple domains and difficulty levels.
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mb-6">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            <div className="flex gap-8">
                {/* Filters Sidebar */}
                <div className="hidden lg:block w-72 flex-shrink-0">
                    <div className="sticky top-6">
                        <ProjectFilters
                            onFilterChange={setFilters}
                            availableSkills={availableSkills}
                            availableDomains={allDomains}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-muted-foreground">
                                {totalCount} projects total
                            </span>
                            <span className="h-4 w-px bg-border"></span>
                            <span className="text-sm font-semibold text-primary">
                                {filteredProjects.length} shown
                            </span>
                        </div>
                    </div>

                    {loading && page === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {filteredProjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredProjects.map((project) => (
                                        <GitHubProjectCard key={project.id} project={project} initialBookmarked={bookmarkMap[project.id]} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-secondary rounded-2xl p-16 text-center border border-dashed border-border">
                                    <span className="material-symbols-outlined text-5xl text-muted-foreground mb-4">search_off</span>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">No projects found</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        No projects match your current filters. Try adjusting your search criteria.
                                    </p>
                                </div>
                            )}

                            {/* Load More */}
                            <div ref={sentinelRef} className="mt-12 flex flex-col items-center gap-4 py-8">
                                {page < totalPages && (
                                    <button
                                        onClick={() => fetchProjects(page + 1, true)}
                                        disabled={loadingMore}
                                        className="px-6 py-3 bg-white border border-border rounded-xl font-semibold hover:bg-secondary transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loadingMore ? 'Loading...' : 'Load More Projects'}
                                        <span className="material-symbols-outlined text-sm">expand_more</span>
                                    </button>
                                )}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-1 w-48 bg-muted rounded-full overflow-hidden">
                                        <div
                                            ref={progressRef}
                                            className="h-full bg-primary transition-all duration-500 w-0"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {filteredProjects.length} / {totalCount} projects loaded
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function WorkstationProjectsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <ProjectsContent />
        </Suspense>
    );
}
