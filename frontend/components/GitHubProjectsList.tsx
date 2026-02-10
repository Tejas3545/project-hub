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

  // Available languages (you can fetch this from API)
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

      // Handle response with proper fallbacks
      setProjects(data.projects || []);
      setTotal(data.pagination?.total || 0);
      setCurrentPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Set safe defaults on error
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
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">
            {total} Projects Available
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:border-primary'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-all ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:border-primary'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="difficulty-filter" className="block text-sm font-medium text-muted-foreground mb-2">
              Difficulty
            </label>
            <div className="relative">
              <select
                id="difficulty-filter"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value="" className="bg-card text-foreground">All Levels</option>
                <option value="EASY" className="bg-card text-foreground">Easy</option>
                <option value="MEDIUM" className="bg-card text-foreground">Medium</option>
                <option value="HARD" className="bg-card text-foreground">Hard</option>
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
            <label htmlFor="language-filter" className="block text-sm font-medium text-muted-foreground mb-2">
              Language
            </label>
            <div className="relative">
              <select
                id="language-filter"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value="" className="bg-card text-foreground">All Languages</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang} className="bg-card text-foreground">
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
            <label htmlFor="sort-filter" className="block text-sm font-medium text-muted-foreground mb-2">
              Sort By
            </label>
            <div className="relative">
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value="stars" className="bg-card text-foreground">Most Stars</option>
                <option value="forks" className="bg-card text-foreground">Most Forks</option>
                <option value="downloadCount" className="bg-card text-foreground">Most Downloaded</option>
                <option value="lastUpdated" className="bg-card text-foreground">Recently Updated</option>
                <option value="createdAt" className="bg-card text-foreground">Recently Added</option>
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
          <div className="mt-4 flex flex-wrap gap-2">
            {difficulty && (
              <button
                onClick={() => setDifficulty('')}
                className="flex items-center gap-2 px-3 py-1 bg-primary/15 text-primary border border-primary/30 rounded-full text-sm hover:bg-primary/25 transition-colors"
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
                className="flex items-center gap-2 px-3 py-1 bg-primary/15 text-primary border border-primary/30 rounded-full text-sm hover:bg-primary/25 transition-colors"
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
                className="flex items-center gap-2 px-3 py-1 bg-primary/15 text-primary border border-primary/30 rounded-full text-sm hover:bg-primary/25 transition-colors"
              >
                <span>Search: {search}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Projects Grid/List */}
      {!loading && projects.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {projects.map((project) => (
            <GitHubProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && projects.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-foreground mb-2">No Projects Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground hover:bg-muted/80 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border border-border text-foreground hover:bg-muted/80 hover:border-primary'
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
            className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground hover:bg-muted/80 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
