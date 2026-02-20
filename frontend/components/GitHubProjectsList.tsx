'use client';

import { useState, useEffect, useCallback } from 'react';
import { GitHubProject } from '@/types';
import GitHubProjectCard from './GitHubProjectCard';

interface GitHubProjectsListProps {
  domainSlug: string;
}

export default function GitHubProjectsList({
  domainSlug
}: GitHubProjectsListProps) {
  const [projects, setProjects] = useState<GitHubProject[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [difficulty, setDifficulty] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('stars');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Available languages
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github-projects/languages`);
      const data = await response.json();
      setAvailableLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchProjects = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        order: 'desc'
      });

      if (difficulty) params.append('difficulty', difficulty);
      if (language) params.append('language', language);
      if (search) params.append('search', search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/github-projects/domain/${domainSlug}?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setProjects(data.projects || []);
      setTotal(data.pagination?.total || 0);
      setCurrentPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setTotal(0);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [domainSlug, difficulty, language, search, sortBy]);

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const handlePageChange = (page: number) => {
    fetchProjects(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Filters Section */}
      <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {total} Projects Available
            </h2>
            <p className="text-muted-foreground text-sm">
              Open source projects curated for this domain
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-secondary p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Keywords..."
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="filter-difficulty" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Difficulty
            </label>
            <div className="relative">
              <select
                id="filter-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="filter-language" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Language
            </label>
            <div className="relative">
              <select
                id="filter-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">All Languages</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="filter-sort" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Sort By
            </label>
            <div className="relative">
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="stars">Most Stars</option>
                <option value="forks">Most Forks</option>
                <option value="downloadCount">Most Downloaded</option>
                <option value="lastUpdated">Recently Updated</option>
                <option value="createdAt">Recently Added</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(difficulty || language || search) && (
          <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-border">
            {difficulty && (
              <button
                onClick={() => setDifficulty('')}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent text-primary border border-primary/20 rounded-lg text-sm hover:bg-primary/20 transition-colors"
              >
                <span>Difficulty: {difficulty}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {language && (
              <button
                onClick={() => setLanguage('')}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent text-primary border border-primary/20 rounded-lg text-sm hover:bg-primary/20 transition-colors"
              >
                <span>Language: {language}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent text-primary border border-primary/20 rounded-lg text-sm hover:bg-primary/20 transition-colors"
              >
                <span>Search: {search}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                setDifficulty('');
                setLanguage('');
                setSearch('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* Projects Grid/List */}
      {!loading && projects.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {projects.map((project) => (
            <GitHubProjectCard key={project.id} project={project} hrefRoot="/projects" />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && projects.length === 0 && (
        <div className="bg-white rounded-xl p-16 text-center border border-dashed border-border shadow-sm">
          <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Projects Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all flex items-center justify-center ${currentPage === pageNum
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
