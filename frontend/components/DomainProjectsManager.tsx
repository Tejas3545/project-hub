'use client';

import { useState, useMemo } from 'react';
import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import ProjectFilters from './ProjectFilters';

interface DomainProjectsManagerProps {
    projects: Project[];
}

export default function DomainProjectsManager({ projects }: DomainProjectsManagerProps) {
    const [filteredProjects, setFilteredProjects] = useState(projects);

    const availableSkills = useMemo(() => {
        const skills = new Set<string>();
        projects.forEach(p => {
            if (Array.isArray(p.skillFocus)) {
                p.skillFocus.forEach(s => skills.add(s));
            }
        });
        return Array.from(skills).sort();
    }, [projects]);

    const handleFilterChange = (filters: { difficulty: string[]; maxTime: number; minTime: number; skills: string[] }) => {
        let result = [...projects];

        if (filters.difficulty.length > 0) {
            result = result.filter(p => filters.difficulty.includes(p.difficulty));
        }

        if (filters.maxTime < 100) {
            result = result.filter(p => p.maxTime <= filters.maxTime);
        }
        result = result.filter(p => p.minTime >= filters.minTime);

        if (filters.skills.length > 0) {
            result = result.filter(p =>
                Array.isArray(p.skillFocus) &&
                p.skillFocus.some(s => filters.skills.includes(s))
            );
        }

        setFilteredProjects(result);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            <aside className="w-full lg:w-80 shrink-0">
                <ProjectFilters onFilterChange={handleFilterChange} availableSkills={availableSkills} />
            </aside>
            <div className="flex-1 w-full">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                        Available Projects
                    </h2>
                    <div className="pill-badge">
                        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                    </div>
                </div>

                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredProjects.map((project, index) => (
                            <div key={project.id} className="fade-in-up stagger-delay" {...{ style: { '--delay': `${index * 0.1}s` } as React.CSSProperties }}>
                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-border shadow-sm p-12 text-center">
                        <p className="text-muted-foreground">
                            No projects match your filters. Try adjusting your criteria.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
