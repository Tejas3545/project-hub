'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { projectApi } from '@/lib/api';
import ProjectCard from '@/components/ProjectCard';
import ProjectFilters from '@/components/ProjectFilters';
import SearchBar from '@/components/SearchBar';
import { Project } from '@/types';

function ProjectsContent() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        difficulty: [] as string[],
        minTime: 0,
        maxTime: 100,
        skills: [] as string[],
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const allProjects = await projectApi.getAll({});
            setProjects(allProjects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const availableSkills = useMemo(() => {
        const skills = new Set<string>();
        projects.forEach(p => {
            p.skillFocus.forEach(s => skills.add(s));
        });
        return Array.from(skills).sort();
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = project.title.toLowerCase().includes(query);
                const matchesDomain = project.domain?.name.toLowerCase().includes(query);
                const matchesSkills = project.skillFocus.some(skill => 
                    skill.toLowerCase().includes(query)
                );
                const matchesDescription = project.problemStatement?.toLowerCase().includes(query);
                
                if (!matchesTitle && !matchesDomain && !matchesSkills && !matchesDescription) {
                    return false;
                }
            }

            if (filters.difficulty.length > 0 && !filters.difficulty.includes(project.difficulty)) {
                return false;
            }

            if (project.minTime < filters.minTime || project.maxTime > filters.maxTime) {
                return false;
            }

            if (filters.skills.length > 0) {
                const hasSkill = project.skillFocus.some(skill => filters.skills.includes(skill));
                if (!hasSkill) return false;
            }

            return true;
        });
    }, [projects, filters, searchQuery]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
            {/* Decorative gradient backgrounds */}
            <div className="fixed top-20 right-10 w-96 h-96 gradient-blue-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-10 w-80 h-80 gradient-purple-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mb-8 sm:mb-12 text-center relative">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4 text-gradient-blue-purple">
                    Explore All Projects
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 mb-6">
                    Browse our collection of industry-grade projects. Filter by difficulty, time commitment, and skills to find your perfect challenge.
                </p>
                
                <div className="max-w-2xl mx-auto px-4">
                    <SearchBar 
                        placeholder="Search by title, domain, or skills..."
                        onSearch={setSearchQuery}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="lg:col-span-1">
                    <ProjectFilters
                        onFilterChange={setFilters}
                        availableSkills={availableSkills}
                    />
                </div>

                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-blue-accent border border-border/30 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 sm:mb-6 flex items-center justify-between px-2">
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    Showing <span className="text-foreground font-bold">{filteredProjects.length}</span> projects
                                </p>
                            </div>

                            {filteredProjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {filteredProjects.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-card border border-border rounded-lg p-8 sm:p-12 text-center">
                                    <div className="flex justify-center mb-4">
                                        <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.6-4.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">No projects found</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground">
                                        Try adjusting your filters to find more results.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <ProjectsContent />
        </Suspense>
    );
}
