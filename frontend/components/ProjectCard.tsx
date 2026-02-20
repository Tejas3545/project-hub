'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types';
import { userApi, socialApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface ProjectCardProps {
    project: Project;
}

const difficultyColors: Record<string, string> = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HARD: 'bg-red-50 text-red-700 border-red-200',
};

const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
    const cached = apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
    }
    apiCache.delete(key);
    return null;
}

function setCache(key: string, data: unknown): void {
    apiCache.set(key, { data, timestamp: Date.now() });
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const { user } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);
    const hasFetchedRef = useRef(false);

    const isValidProject = project && project.id;

    useEffect(() => {
        if (!isValidProject) return;
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        if (user) {
            checkBookmarkStatus();
            checkLikeStatus();
        }
        loadLikesCount();
        loadCommentsCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, project?.id, isValidProject]);

    if (!isValidProject) {
        return (
            <div className="rounded-xl p-6 border border-border bg-white">
                <p className="text-red-500">Invalid project data</p>
            </div>
        );
    }

    const checkBookmarkStatus = async () => {
        if (!user) return;
        try {
            const cacheKey = `bookmark-${project.id}`;
            const cached = getCached<{ bookmarked: boolean }>(cacheKey);
            if (cached) {
                setIsBookmarked(cached.bookmarked);
                return;
            }

            const result = await userApi.checkBookmark(project.id);
            setIsBookmarked(result.bookmarked);
            setCache(cacheKey, result);
        } catch {
            // Silently fail - user may not be authenticated
        }
    };

    const checkLikeStatus = async () => {
        if (!user) return;
        try {
            const cacheKey = `like-status-${project.id}`;
            const cached = getCached<{ liked: boolean }>(cacheKey);
            if (cached) {
                setIsLiked(cached.liked);
                return;
            }

            const result = await socialApi.getProjectLikeStatus(project.id);
            setIsLiked(result.liked);
            setCache(cacheKey, result);
        } catch {
            // Silently fail - user may not be authenticated
        }
    };

    const loadLikesCount = async () => {
        try {
            const cacheKey = `likes-count-${project.id}`;
            const cached = getCached<{ count: number }>(cacheKey);
            if (cached) {
                setLikesCount(cached.count || 0);
                return;
            }

            const result = await socialApi.getProjectLikesCount(project.id);
            setLikesCount(result.count || 0);
            setCache(cacheKey, result);
        } catch (error) {
            // Silently fail
        }
    };

    const loadCommentsCount = async () => {
        try {
            const cacheKey = `comments-count-${project.id}`;
            const cached = getCached<{ total: number }>(cacheKey);
            if (cached) {
                setCommentsCount(cached.total || 0);
                return;
            }

            const result = await socialApi.getComments(project.id, 1, 1);
            const total = result.total || result.comments?.length || 0;
            setCommentsCount(total);
            setCache(cacheKey, { total });
        } catch (error) {
            // Silently fail
        }
    };

    const handleBookmarkClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return;

        setIsLoading(true);
        try {
            const result = await userApi.toggleBookmark(project.id);
            setIsBookmarked(result.bookmarked);
            apiCache.delete(`bookmark-${project.id}`);
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return;

        setIsLoading(true);
        try {
            const result = await socialApi.toggleProjectLike(project.id);
            setIsLiked(result.liked);
            setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
            apiCache.delete(`like-status-${project.id}`);
            apiCache.delete(`likes-count-${project.id}`);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const featuredScreenshot = project.screenshots && project.screenshots.length > 0
        ? project.screenshots[0]
        : null;

    return (
        <Link href={`/projects/${project.id}`} className="block group h-full">
            <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 h-full flex flex-col border border-border shadow-sm">
                {featuredScreenshot && (
                    <div className="relative w-full aspect-video overflow-hidden">
                        <Image
                            src={featuredScreenshot}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${difficultyColors[project.difficulty]}`}>
                                {project.difficulty}
                            </span>
                        </div>
                        {project.screenshots && project.screenshots.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs border border-border text-foreground/80">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{project.screenshots.length}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-5 flex flex-col flex-1 relative">
                    {!featuredScreenshot && (
                        <div className="absolute top-0 right-0 p-5">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${difficultyColors[project.difficulty]}`}>
                                {project.difficulty}
                            </span>
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-3 gap-3">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex-1 leading-tight">
                            {project.title}
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-grow leading-relaxed">
                        {project.problemStatement}
                    </p>

                    <div className="flex items-center gap-3 mb-4 text-muted-foreground text-xs font-medium border-t border-border pt-4">
                        <div className="flex items-center gap-1.5 text-primary">
                            <span className="material-symbols-outlined text-sm">language</span>
                            <span>{project.domain?.name || 'General'}</span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-border"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>{project.minTime}-{project.maxTime}h</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                        <button
                            onClick={handleLikeClick}
                            disabled={!user || isLoading}
                            className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${isLiked ? 'text-red-500 hover:text-red-400' : ''}`}
                        >
                            <span className="material-symbols-outlined text-sm">favorite</span>
                            <span className="text-xs font-bold">{likesCount}</span>
                        </button>
                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <span className="material-symbols-outlined text-sm">chat_bubble</span>
                            <span className="text-xs font-bold">{commentsCount}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {project.skillFocus.slice(0, 2).map((skill) => (
                            <span key={skill} className="pill-badge text-[11px] bg-secondary text-muted-foreground border border-border">
                                {skill}
                            </span>
                        ))}
                        {project.skillFocus.length > 2 && (
                            <span className="pill-badge text-[11px] bg-secondary text-muted-foreground border border-border">
                                +{project.skillFocus.length - 2}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
