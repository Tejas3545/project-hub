'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import CommentSection from '@/components/CommentSection';
import { useAuth } from '@/lib/AuthContext';
import { socialApi } from '@/lib/api';

interface ProjectEngagementProps {
  projectId: string;
  className?: string;
}

export default function ProjectEngagement({ projectId, className = '' }: ProjectEngagementProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);

  const loadEngagement = useCallback(async () => {
    try {
      const [likes, comments] = await Promise.all([
        socialApi.getProjectLikesCount(projectId) as Promise<{ count?: number }>,
        socialApi.getComments(projectId, 1, 1) as Promise<{ total?: number; comments?: Array<unknown> }>,
      ]);

      setLikesCount(likes.count || 0);
      setCommentsCount(comments.total || comments.comments?.length || 0);
    } catch {
      setLikesCount(0);
      setCommentsCount(0);
    }
  }, [projectId]);

  const loadLikeStatus = useCallback(async () => {
    if (!user) {
      setIsLiked(false);
      return;
    }

    try {
      const result = await socialApi.getProjectLikeStatus(projectId) as { liked?: boolean };
      setIsLiked(!!result.liked);
    } catch {
      setIsLiked(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    loadEngagement();
  }, [loadEngagement]);

  useEffect(() => {
    loadLikeStatus();
  }, [loadLikeStatus]);

  const handleToggleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoadingLike(true);
    try {
      const result = await socialApi.toggleProjectLike(projectId) as { liked?: boolean; count?: number };
      setIsLiked(!!result.liked);
      setLikesCount(result.count ?? 0);
    } catch (error) {
      console.error('Failed to toggle project like:', error);
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <section className={className}>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Project discussion</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ask questions, leave feedback, and bookmark useful ideas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleLike}
            disabled={loadingLike}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              isLiked
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-border bg-secondary text-foreground hover:border-primary/30 hover:text-primary'
            } ${loadingLike ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-base">favorite</span>
            {likesCount}
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground">
            <span className="material-symbols-outlined text-base">chat_bubble</span>
            {commentsCount}
          </div>
        </div>
      </div>

      <CommentSection projectId={projectId} onCountChange={setCommentsCount} />
    </section>
  );
}
