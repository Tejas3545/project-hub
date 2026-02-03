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
        <div className="lg:sticky lg:top-24 space-y-8 pr-4 min-h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-widest pl-1">
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-text-muted hover:text-primary transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Difficulty Filter */}
            <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.02]">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                    Difficulty
                </label>
                <div className="space-y-3">
                    {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.difficulty.includes(level)}
                                    onChange={() => handleDifficultyToggle(level)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/10 bg-black/40 checked:border-indigo-500 checked:bg-indigo-500 transition-all hover:border-indigo-400"
                                />
                                <svg
                                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-400 group-hover:text-white transition-colors text-sm font-medium">
                                {level.charAt(0) + level.slice(1).toLowerCase()}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Time Range Filter */}
            <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.02]">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                    Time Commitment
                </label>
                <div className="space-y-6 px-1">
                    <div className="flex justify-between text-xs font-medium text-gray-400">
                        <span>{filters.minTime}h</span>
                        <span>{filters.maxTime === 100 ? '100+' : filters.maxTime}h</span>
                    </div>

                    {/* Dual Range CSS Trick or simpler approach - keeping it simple but styled for now */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Min Hours</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.minTime}
                                onChange={(e) => updateFilters({ minTime: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Max Hours</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.maxTime}
                                onChange={(e) => updateFilters({ maxTime: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Filter */}
            <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.02]">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                    Skills
                </label>
                {!availableSkills || availableSkills.length === 0 ? (
                    <p className="text-xs text-gray-500">No skills available</p>
                ) : (
                    <div className="space-y-3">
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                            {availableSkills.map((skill) => (
                                <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.skills.includes(skill)}
                                            onChange={() => {
                                                const newSkills = filters.skills.includes(skill)
                                                    ? filters.skills.filter(s => s !== skill)
                                                    : [...filters.skills, skill];
                                                updateFilters({ skills: newSkills });
                                            }}
                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/10 bg-black/40 checked:border-indigo-500 checked:bg-indigo-500 transition-all hover:border-indigo-400"
                                        />
                                        <svg
                                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-400 group-hover:text-white transition-colors text-sm">
                                        {skill}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Active Filters Count */}
            {hasActiveFilters && (
                <div className="pt-4 border-t border-white/5">
                    <div className="text-sm text-text-secondary">
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
