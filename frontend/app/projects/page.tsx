'use client';

import { useState, useEffect, useMemo } from 'react';
import { projectApi } from '@/lib/api';
import ProjectCard from '@/components/ProjectCard';
import ProjectFilters from '@/components/ProjectFilters';
import { Project } from '@/types';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
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
            // Fetch all projects initially
            // We'll do client-side filtering for 19 projects for instant UI feedback
            const allProjects = await projectApi.getAll({});
            setProjects(allProjects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract all unique skills from projects for filter
    const availableSkills = useMemo(() => {
        const skills = new Set<string>();
        projects.forEach(p => {
            p.skillFocus.forEach(s => skills.add(s));
        });
        return Array.from(skills).sort();
    }, [projects]);

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Difficulty filter
            if (filters.difficulty.length > 0 && !filters.difficulty.includes(project.difficulty)) {
                return false;
            }

            // Time filter
            if (project.minTime < filters.minTime || project.maxTime > filters.maxTime) {
                return false;
            }

            // Skills filter (match ANY selected skill)
            if (filters.skills.length > 0) {
                const hasSkill = project.skillFocus.some(skill => filters.skills.includes(skill));
                if (!hasSkill) return false;
            }

            return true;
        });
    }, [projects, filters]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="mb-8 sm:mb-12 text-center fade-in-up">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-3 sm:mb-4 px-4">
                    Explore <span className="gradient-text">All Projects</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto px-4">
                    Browse our collection of industry-grade projects. Filter by difficulty, time commitment, and skills to find your perfect challenge.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 fade-in-up [animation-delay:0.1s]">
                    <ProjectFilters
                        onFilterChange={setFilters}
                        availableSkills={availableSkills}
                    />
                </div>

                {/* Projects Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 glass-card animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 sm:mb-6 flex items-center justify-between px-2">
                                <p className="text-sm sm:text-base text-text-secondary">
                                    Showing <span className="text-primary font-bold">{filteredProjects.length}</span> projects
                                </p>
                            </div>

                            {filteredProjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 fade-in-up [animation-delay:0.2s]">
                                    {filteredProjects.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card p-8 sm:p-12 text-center fade-in-up">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">No projects found</h3>
                                    <p className="text-sm sm:text-base text-text-secondary">
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
