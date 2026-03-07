'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitHubProject } from '@/types';
import { socialApi, userApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface GitHubProjectCardProps {
  project: GitHubProject;
  initialBookmarked?: boolean; // Accept pre-fetched bookmark status
  hrefRoot?: string;
}

export default function GitHubProjectCard({ project, initialBookmarked, hrefRoot = '/github-projects' }: GitHubProjectCardProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked ?? false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  const techPreview = [...new Set([...(project.techStack || []), ...(project.technicalSkills || [])])].slice(0, 3);
  const difficultyLabel: Record<string, string> = {
    EASY: 'Beginner',
    MEDIUM: 'Intermediate',
    HARD: 'Advanced',
    ADVANCED: 'Advanced',
    EXPERT: 'Advanced+',
  };

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

  useEffect(() => {
    const loadEngagement = async () => {
      try {
        const [likes, comments] = await Promise.all([
          socialApi.getProjectLikesCount(project.id) as Promise<{ count?: number }>,
          socialApi.getComments(project.id, 1, 1) as Promise<{ total?: number; comments?: Array<unknown> }>,
        ]);
        setLikesCount(likes.count || 0);
        setCommentsCount(comments.total || comments.comments?.length || 0);
      } catch {
        setLikesCount(0);
        setCommentsCount(0);
      }
    };

    loadEngagement();
  }, [project.id]);

  useEffect(() => {
    const loadLikeStatus = async () => {
      if (!user) {
        setIsLiked(false);
        return;
      }

      try {
        const result = await socialApi.getProjectLikeStatus(project.id) as { liked?: boolean };
        setIsLiked(!!result.liked);
      } catch {
        setIsLiked(false);
      }
    };

    loadLikeStatus();
  }, [project.id, user]);

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

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    try {
      const result = await socialApi.toggleProjectLike(project.id) as { liked?: boolean; count?: number };
      setIsLiked(!!result.liked);
      setLikesCount(result.count || 0);
    } catch {
      // ignore
    }
  };

  const difficultyColor: Record<string, string> = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HARD: 'bg-red-50 text-red-700 border-red-200',
    ADVANCED: 'bg-rose-50 text-rose-700 border-rose-200',
    EXPERT: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  };

  return (
    <Link href={`${hrefRoot}/${project.id}`} className="block group">
      <div className="bg-background rounded-2xl flex flex-col overflow-hidden transition-all duration-300 border border-border hover:border-primary/40 hover:-translate-y-1 relative h-full shadow-sm hover:shadow-xl">
        {/* Header strip */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={`pill-badge text-[11px] border ${difficultyColor[project.difficulty] || 'bg-muted text-muted-foreground border-border'}`}>
                {difficultyLabel[project.difficulty] || project.difficulty}
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
            {project.problemStatement || project.solutionDescription || project.description}
          </p>
        </div>

        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {techPreview.map((tech) => (
            <span key={tech} className="pill-badge text-[11px] bg-secondary text-muted-foreground border border-border">
              {tech}
            </span>
          ))}
          {project.subDomain && (
            <span className="pill-badge text-[11px] bg-primary/10 text-primary border border-primary/20">
              {project.subDomain}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-4 border-t border-border bg-secondary/50 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="material-symbols-outlined text-sm text-primary/60">schedule</span>
                {project.estimatedMinTime}-{project.estimatedMaxTime}h
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="material-symbols-outlined text-sm text-primary/60">code</span>
                {project.language || 'Code'}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="material-symbols-outlined text-sm text-primary/60">star</span>
                {Intl.NumberFormat('en', { notation: 'compact' }).format(project.stars || 0)}
              </div>
            </div>

            <div className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <button
              onClick={toggleLike}
              className={`inline-flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-foreground'}`}
            >
              <span className="material-symbols-outlined text-sm">favorite</span>
              {likesCount}
            </button>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="material-symbols-outlined text-sm">chat_bubble</span>
              {commentsCount}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
