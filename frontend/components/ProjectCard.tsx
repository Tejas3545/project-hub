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

const difficultyColors = {
    EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/30',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30',
    HARD: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-700/30',
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

    if (!project || !project.id) {
        return (
            <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-destructive">Invalid project data</p>
            </div>
        );
    }

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        if (user) {
            checkBookmarkStatus();
            checkLikeStatus();
        }
        loadLikesCount();
        loadCommentsCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, project.id]);

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
            <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-lg hover-lift hover:border-primary/30 h-full flex flex-col">
                {featuredScreenshot && (
                    <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                        <Image
                            src={featuredScreenshot}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${difficultyColors[project.difficulty]}`}>
                                {project.difficulty}
                            </span>
                        </div>
                        {project.screenshots && project.screenshots.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-card px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs border border-border shadow-sm">\n                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{project.screenshots.length}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors flex-1">
                            {project.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            {user && (
                                <button
                                    onClick={handleBookmarkClick}
                                    disabled={isLoading}
                                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${isBookmarked
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark project'}
                                >
                                    <svg
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                        fill={isBookmarked ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                        />
                                    </svg>
                                </button>
                            )}
                            {!featuredScreenshot && (
                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${difficultyColors[project.difficulty]}`}>
                                    {project.difficulty}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-3 flex-grow">
                        {project.problemStatement}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-muted-foreground text-sm">
                        <button
                            onClick={handleLikeClick}
                            disabled={!user || isLoading}
                            className={`flex items-center gap-1.5 transition-colors ${user ? 'hover:text-destructive cursor-pointer' : 'cursor-default'} ${isLiked ? 'text-destructive' : ''}`}
                            title={user ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
                        >
                            <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{likesCount}</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>{commentsCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{project.minTime}-{project.maxTime}h</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-3 sm:pt-4 border-t border-border mt-auto">
                        {project.skillFocus.slice(0, 3).map((skill) => (
                            <span key={skill} className="text-xs px-2.5 py-1 rounded bg-muted text-foreground border border-border">
                                {skill}
                            </span>
                        ))}
                        {project.skillFocus.length > 3 && (
                            <span className="text-xs px-2.5 py-1 rounded bg-muted text-muted-foreground border border-border">
                                +{project.skillFocus.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
