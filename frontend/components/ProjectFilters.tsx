'use client';

import { useState } from 'react';
import type React from 'react';

interface FilterState {
    difficulty: string[];
    minTime: number;
    maxTime: number;
    skills: string[];
    domains: string[];
}

interface ProjectFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    availableSkills?: string[];
    availableDomains?: { id: string; name: string }[];
}

export default function ProjectFilters({
    onFilterChange,
    availableSkills = [],
    availableDomains = []
}: ProjectFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        difficulty: [],
        minTime: 0,
        maxTime: 100,
        skills: [],
        domains: [],
    });

    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange(updated);
    };

    const handleDifficultyToggle = (difficulty: string) => {
        const newDifficulty = filters.difficulty.includes(difficulty)
            ? filters.difficulty.filter(d => d !== difficulty)
            : [...filters.difficulty, difficulty];
        updateFilters({ difficulty: newDifficulty });
    };

    const handleDomainToggle = (domainId: string) => {
        const newDomains = filters.domains.includes(domainId)
            ? filters.domains.filter(id => id !== domainId)
            : [...filters.domains, domainId];
        updateFilters({ domains: newDomains });
    };

    return (
        <aside className="lg:sticky lg:top-24 flex flex-col gap-8 flex-shrink-0">
            {/* Domains */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Domain</h3>
                <div className="space-y-3">
                    {availableDomains.map((domain) => (
                        <label key={domain.id} className="flex items-center gap-3 group cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.domains.includes(domain.id)}
                                onChange={() => handleDomainToggle(domain.id)}
                                className="rounded border-border bg-white text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className={`text-sm transition-colors ${filters.domains.includes(domain.id) ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                {domain.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Difficulty */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                    {['EASY', 'MEDIUM', 'HARD'].map((level) => {
                        const isActive = filters.difficulty.includes(level);
                        return (
                            <button
                                key={level}
                                onClick={() => handleDifficultyToggle(level)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${isActive
                                        ? 'bg-accent border-primary text-primary'
                                        : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                                    }`}
                            >
                                {level}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Technology Search / Tags */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                    {availableSkills.slice(0, 15).map((skill) => {
                        const isActive = filters.skills.includes(skill);
                        return (
                            <button
                                key={skill}
                                onClick={() => {
                                    const newSkills = isActive
                                        ? filters.skills.filter(s => s !== skill)
                                        : [...filters.skills, skill];
                                    updateFilters({ skills: newSkills });
                                }}
                                className={`pill-badge text-[11px] font-medium transition-all border ${isActive
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-secondary border-border text-muted-foreground hover:border-foreground/20'
                                    }`}
                            >
                                {skill}
                                {isActive && <span className="material-symbols-outlined text-[10px] ml-1">close</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slider */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Time Commitment</h3>
                <div className="space-y-4 px-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                            <span className="text-sm font-bold text-primary">{filters.minTime}h</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">to</span>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-bold text-primary">{filters.maxTime === 100 ? '100+' : filters.maxTime}h</span>
                            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        </div>
                    </div>
                    
                    {/* Dual Range Slider - CSS variables for dynamic positioning */}
                    {/* @ts-expect-error - Dynamic CSS variables required for slider state */}
                    <div 
                        className="relative h-12 flex items-center"
                        // Dynamic CSS variables for slider positioning
                        {...{style: {
                            '--slider-left': `${filters.minTime}%`,
                            '--slider-width': `${filters.maxTime - filters.minTime}%`
                        }}}
                    >
                        {/* Track Background */}
                        <div className="absolute w-full h-2 bg-secondary rounded-full"></div>
                        
                        {/* Active Range - Positioned using CSS variables from globals.css */}
                        <div className="slider-range-indicator absolute h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-150"></div>
                        
                        {/* Min Handle */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={filters.minTime}
                            onChange={(e) => {
                                const newMin = parseInt(e.target.value);
                                if (newMin < filters.maxTime) {
                                    updateFilters({ minTime: newMin });
                                }
                            }}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
                            aria-label="Minimum time commitment in hours"
                        />
                        
                        {/* Max Handle */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={filters.maxTime}
                            onChange={(e) => {
                                const newMax = parseInt(e.target.value);
                                if (newMax > filters.minTime) {
                                    updateFilters({ maxTime: newMax });
                                }
                            }}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
                            aria-label="Maximum time commitment in hours"
                        />
                    </div>
                    
                    {/* Range Labels */}
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-0.5">
                        <span>0h</span>
                        <span>25h</span>
                        <span>50h</span>
                        <span>75h</span>
                        <span>100+h</span>
                    </div>
                </div>
            </div>

            {(filters.difficulty.length > 0 || filters.domains.length > 0 || filters.skills.length > 0) && (
                <button
                    onClick={() => {
                        const cleared = { difficulty: [], minTime: 0, maxTime: 100, skills: [], domains: [] };
                        setFilters(cleared);
                        onFilterChange(cleared);
                    }}
                    className="mt-4 text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Clear All Filters
                </button>
            )}
        </aside>
    );
}
