'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GitHubProject } from '@/types';
import { useAuth } from '@/lib/AuthContext';

interface GitHubProjectCardProps {
  project: GitHubProject;
}

export default function GitHubProjectCard({ project }: GitHubProjectCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);


  // Demo URL: use liveUrl if available
  const demoUrl = (project.liveUrl && project.liveUrl.trim() !== '') ? project.liveUrl : null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setIsDownloading(true);

      // Track download analytics (non-blocking)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_API_URL is not configured for download tracking');
      } else {
        try {
          const trackingResponse = await fetch(`${apiUrl}/github-projects/${project.id}/track-download`, {
            method: 'POST',
          });
          if (!trackingResponse.ok) {
            console.error(`Download tracking failed with status ${trackingResponse.status} for project ${project.id}`);
          }
        } catch (trackingError) {
          console.error(`Download tracking error for project ${project.id}:`, trackingError);
        }
      }

      // Trigger download using the real GitHub ZIP URL
      const link = document.createElement('a');
      link.href = project.downloadUrl;
      link.download = `${project.repoName}-${project.defaultBranch}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download project. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/30';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30';
      case 'HARD': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-700/30';
      default: return 'bg-muted text-muted-foreground border border-border';
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-border transition-all duration-300 h-full flex flex-col bg-card hover:shadow-lg hover-lift hover:border-primary/30">

        {/* Content - Clickable Area */}
        <Link href={`/github-projects/${project.id}`} className="block">
          <div className="relative p-6 pb-0">
            {/* Header with Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                   {project.title}
                </h3>
              </div>
              <span className={`ml-4 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getDifficultyColor(project.difficulty)}`}>
                {project.difficulty === 'EASY' ? 'BEGINNER' : project.difficulty === 'MEDIUM' ? 'INTERMEDIATE' : 'ADVANCED'}
              </span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {project.techStack.slice(0, 4).map((tech, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 text-xs font-medium bg-muted text-foreground rounded-md border border-border"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    +{project.techStack.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-5 text-sm">
              {project.language && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                  <span>{project.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{project.stars.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{project.forks.toLocaleString()}</span>
              </div>
              {project.downloadCount > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{project.downloadCount}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
        {/* Action Buttons - Outside Link */}
        <div className="p-6 pt-0 mt-auto">
          <div className="flex gap-3">
            {/* Download / View Project Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-primary/50"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </>
              )}
            </button>

            {/* Live Demo Button - only shown if liveUrl is available */}
            {demoUrl && (user ? (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium text-sm border border-secondary/50"
                title="View live demo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">Demo</span>
              </a>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium text-sm border border-secondary/50"
                title="Sign in to view live demo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">Demo</span>
              </button>
            ))}
          </div>
          {!user && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Sign in to access full features.
            </p>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-bold text-lg">Download Started!</p>
              <p className="text-sm text-green-100">Check your downloads folder</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
