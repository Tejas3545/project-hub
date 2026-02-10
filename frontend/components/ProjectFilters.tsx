'use client';

import { useState } from 'react';

interface FilterState {
    difficulty: string[];
    minTime: number;
    maxTime: number;
    skills: string[];
}

interface ProjectFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    availableSkills?: string[];
}

export default function ProjectFilters({ onFilterChange, availableSkills = [] }: ProjectFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        difficulty: [],
        minTime: 0,
        maxTime: 100,
        skills: [],
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

    const handleClearFilters = () => {
        const cleared: FilterState = {
            difficulty: [],
            minTime: 0,
            maxTime: 100,
            skills: [],
        };
        setFilters(cleared);
        onFilterChange(cleared);
    };

    const hasActiveFilters =
        filters.difficulty.length > 0 ||
        filters.minTime > 0 ||
        filters.maxTime < 100 ||
        filters.skills.length > 0;

    return (
        <div className="lg:sticky lg:top-24 space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Difficulty Filter */}
            <div className="p-5 border border-border rounded-lg bg-card">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-4">
                    Difficulty
                </label>
                <div className="space-y-3">
                    {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.difficulty.includes(level)}
                                onChange={() => handleDifficultyToggle(level)}
                                className="h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                                {level.charAt(0) + level.slice(1).toLowerCase()}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Time Range Filter */}
            <div className="p-5 border border-border rounded-lg bg-card">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-4">
                    Time Commitment
                </label>
                <div className="space-y-4">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>{filters.minTime}h</span>
                        <span>{filters.maxTime === 100 ? '100+' : filters.maxTime}h</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase tracking-wide">Min Hours</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                aria-label="Minimum hours"
                                value={filters.minTime}
                                onChange={(e) => updateFilters({ minTime: parseInt(e.target.value) })}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase tracking-wide">Max Hours</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                aria-label="Maximum hours"
                                value={filters.maxTime}
                                onChange={(e) => updateFilters({ maxTime: parseInt(e.target.value) })}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Filter */}
            <div className="p-5 border border-border rounded-lg bg-card">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-4">
                    Skills
                </label>
                {!availableSkills || availableSkills.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No skills available</p>
                ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableSkills.map((skill) => (
                            <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.skills.includes(skill)}
                                    onChange={() => {
                                        const newSkills = filters.skills.includes(skill)
                                            ? filters.skills.filter(s => s !== skill)
                                            : [...filters.skills, skill];
                                        updateFilters({ skills: newSkills });
                                    }}
                                    className="h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                                    {skill}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Filters Count */}
            {hasActiveFilters && (
                <div className="pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">
                            {[
                                ...filters.difficulty,
                                filters.minTime > 0 ? 'min time' : null,
                                filters.maxTime < 100 ? 'max time' : null,
                                ...filters.skills,
                            ].filter(Boolean).length}
                        </span>
                        {' '}active filter{filters.difficulty.length + filters.skills.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
}
