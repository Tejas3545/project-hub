'use client';

import { useState, useEffect } from 'react';
import { Domain } from '@/types';

export interface FilterState {
    domains: string[];
    difficulty: string[];
    timeRange: { min: number; max: number } | null;
    search: string;
}

interface AdvancedFilterProps {
    onFilterChange: (filters: FilterState) => void;
    domains?: Domain[];
    initialFilters?: Partial<FilterState>;
}

export default function AdvancedFilter({ onFilterChange, domains = [], initialFilters }: AdvancedFilterProps) {
    const [filters, setFilters] = useState<FilterState>({
        domains: initialFilters?.domains || [],
        difficulty: initialFilters?.difficulty || [],
        timeRange: initialFilters?.timeRange || null,
        search: initialFilters?.search || '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);

    const timeRanges = [
        { label: 'Quick (1-5 hours)', min: 1, max: 5 },
        { label: 'Short (5-10 hours)', min: 5, max: 10 },
        { label: 'Medium (10-20 hours)', min: 10, max: 20 },
        { label: 'Long (20-40 hours)', min: 20, max: 40 },
        { label: 'Extended (40+ hours)', min: 40, max: 1000 },
    ];

    const difficulties = ['EASY', 'MEDIUM', 'HARD'];

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const toggleDomain = (domainId: string) => {
        setFilters(prev => ({
            ...prev,
            domains: prev.domains.includes(domainId)
                ? prev.domains.filter(id => id !== domainId)
                : [...prev.domains, domainId]
        }));
    };

    const toggleDifficulty = (difficulty: string) => {
        setFilters(prev => ({
            ...prev,
            difficulty: prev.difficulty.includes(difficulty)
                ? prev.difficulty.filter(d => d !== difficulty)
                : [...prev.difficulty, difficulty]
        }));
    };

    const setTimeRange = (range: { min: number; max: number } | null) => {
        setFilters(prev => ({
            ...prev,
            timeRange: range
        }));
        setShowTimeDropdown(false);
    };

    const clearFilters = () => {
        setFilters({
            domains: [],
            difficulty: [],
            timeRange: null,
            search: '',
        });
    };

    const activeFiltersCount = 
        filters.domains.length + 
        filters.difficulty.length + 
        (filters.timeRange ? 1 : 0);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search projects by title or keywords..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-lg text-muted-foreground transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="font-medium">
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </span>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm">Clear all</span>
                    </button>
                )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-6 animate-fadeIn">
                    {/* Domain Filter */}
                    {domains.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Domains
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {domains.map((domain) => (
                                    <button
                                        key={domain.id}
                                        onClick={() => toggleDomain(domain.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                                            filters.domains.includes(domain.id)
                                                ? 'bg-primary/10 text-primary border-2 border-primary/30'
                                                : 'bg-secondary text-muted-foreground hover:bg-muted border-2 border-transparent'
                                        }`}
                                    >
                                        {domain.name}
                                        {domain._count && domain._count.projects > 0 && (
                                            <span className="ml-2 text-xs opacity-70">
                                                ({domain._count.projects})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Difficulty Filter */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Difficulty
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {difficulties.map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => toggleDifficulty(diff)}
                                    className={`px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                                        filters.difficulty.includes(diff)
                                            ? diff === 'EASY' 
                                                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-300'
                                                : diff === 'MEDIUM'
                                                ? 'bg-amber-50 text-amber-600 border-2 border-amber-300'
                                                : 'bg-rose-50 text-rose-600 border-2 border-rose-300'
                                            : 'bg-secondary text-muted-foreground hover:bg-muted border-2 border-transparent'
                                    }`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Range Filter */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Time Commitment
                        </h3>
                        <div className="relative">
                            <button
                                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                                className={`w-full px-4 py-3 rounded-lg font-medium transition-all text-left flex items-center justify-between ${
                                    filters.timeRange
                                        ? 'bg-primary/10 text-primary border-2 border-primary/30'
                                        : 'bg-secondary text-muted-foreground hover:bg-muted border-2 border-transparent'
                                }`}
                            >
                                <span>
                                    {filters.timeRange
                                        ? `${filters.timeRange.min}-${filters.timeRange.max === 1000 ? '+' : filters.timeRange.max} hours`
                                        : 'Any duration'}
                                </span>
                                <svg className={`w-5 h-5 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showTimeDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl z-10 overflow-hidden">
                                    <button
                                        onClick={() => setTimeRange(null)}
                                        className="w-full px-4 py-3 text-left text-muted-foreground hover:bg-muted transition-colors border-b border-border"
                                    >
                                        Any duration
                                    </button>
                                    {timeRanges.map((range) => (
                                        <button
                                            key={range.label}
                                            onClick={() => setTimeRange({ min: range.min, max: range.max })}
                                            className={`w-full px-4 py-3 text-left transition-colors border-b border-border last:border-b-0 ${
                                                filters.timeRange?.min === range.min && filters.timeRange?.max === range.max
                                                    ? 'bg-primary/5 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
