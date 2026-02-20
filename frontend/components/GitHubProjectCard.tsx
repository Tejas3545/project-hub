'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitHubProject } from '@/types';
import { userApi } from '@/lib/api';

interface GitHubProjectCardProps {
  project: GitHubProject;
  initialBookmarked?: boolean; // Accept pre-fetched bookmark status
  hrefRoot?: string;
}

export default function GitHubProjectCard({ project, initialBookmarked, hrefRoot = '/github-projects' }: GitHubProjectCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked ?? false);

  // Sync with parent if prop changes
  useEffect(() => {
    if (initialBookmarked !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsBookmarked(initialBookmarked);
    }
  }, [initialBookmarked]);

  useEffect(() => {
    // Only fetch individually if no batch result was passed
    if (initialBookmarked !== undefined) return;
    userApi.checkBookmark(project.id)
      .then((res: { bookmarked?: boolean }) => setIsBookmarked(!!res?.bookmarked))
      .catch(() => { });
  }, [project.id, initialBookmarked]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      await userApi.toggleBookmark(project.id);
    } catch {
      setIsBookmarked(prev); // revert on failure
    }
  };

  const difficultyColor: Record<string, string> = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HARD: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <Link href={`${hrefRoot}/${project.id}`} className="block group">
      <div className="bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-300 border border-border hover:border-primary/40 hover:-translate-y-1 relative h-full shadow-sm hover:shadow-xl">
        {/* Header strip */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={`pill-badge text-[11px] border ${difficultyColor[project.difficulty] || 'bg-muted text-muted-foreground border-border'}`}>
                {project.difficulty}
              </span>
              <span className="pill-badge text-[11px] bg-accent text-primary border border-primary/20">
                {project.domain?.name || 'General'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {project.title}
            </h3>
          </div>
          <button
            onClick={toggleBookmark}
            className="size-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all active:scale-95 flex-shrink-0"
          >
            <span className={`material-symbols-outlined text-lg ${isBookmarked ? 'symbol-filled' : ''}`}>
              bookmark
            </span>
          </button>
        </div>

        {/* Description */}
        <div className="px-6 pb-4">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-4 border-t border-border flex items-center justify-between bg-secondary/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="material-symbols-outlined text-sm text-primary/60">schedule</span>
              {project.estimatedMinTime}-{project.estimatedMaxTime}h
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="material-symbols-outlined text-sm text-primary/60">code</span>
              {project.language || 'Code'}
            </div>
          </div>

          <div className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
