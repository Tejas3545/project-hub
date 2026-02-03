'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { userApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface ProjectCardProps {
    project: Project;
}

const difficultyStyles = {
    EASY: 'difficulty-easy',
    MEDIUM: 'difficulty-medium',
    HARD: 'difficulty-hard',
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const { user } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkBookmarkStatus();
        }
    }, [user, project.id]);

    const checkBookmarkStatus = async () => {
        try {
            const result = await userApi.checkBookmark(project.id);
            setIsBookmarked(result.bookmarked);
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
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Link href={`/projects/${project.id}`} className="block group h-full">
            <div className="pro-card p-5 sm:p-6 h-full flex flex-col bg-[#0F0F0F] rounded-lg border-none hover:bg-[#141414] transition-all duration-300">
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-primary transition-colors flex-1 break-words">
                        {project.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                        {user && (
                            <button
                                onClick={handleBookmarkClick}
                                disabled={isLoading}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                                    isBookmarked 
                                        ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' 
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
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
                        <span className={`badge ${difficultyStyles[project.difficulty]} text-xs font-bold`}>
                            {project.difficulty}
                        </span>
                    </div>
                </div>

                <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {project.problemStatement}
                </p>

                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border-card mt-auto">
                    <div className="flex items-center text-text-muted text-sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{project.minTime}-{project.maxTime} hours</span>
                    </div>

                    <div className="flex gap-2">
                        {project.skillFocus.slice(0, 2).map((skill) => (
                            <span key={skill} className="text-xs px-2.5 py-1 rounded bg-bg-secondary text-text-secondary border border-border-card">
                                {skill}
                            </span>
                        ))}
                        {project.skillFocus.length > 2 && (
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-text-muted border border-white/10">
                                +{project.skillFocus.length - 2}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
