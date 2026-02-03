'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GitHubProject } from '@/types';

interface GitHubProjectCardProps {
  project: GitHubProject;
}

export default function GitHubProjectCard({ project }: GitHubProjectCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsDownloading(true);

      // Track download analytics
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github-projects/${project.id}/track-download`, {
        method: 'POST',
      });

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
      case 'EASY': return 'difficulty-easy';
      case 'MEDIUM': return 'difficulty-medium';
      case 'HARD': return 'difficulty-hard';
      default: return 'badge-secondary';
    }
  };

  return (
    <>
      <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Content - Clickable Area */}
        <Link href={`/github-projects/${project.id}`} className="block">
          <div className="relative p-6 pb-0">
            {/* Header with Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                  {project.title}
                </h3>
              </div>
              <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                project.difficulty === 'EASY' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : project.difficulty === 'MEDIUM'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}>
                {project.difficulty}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {project.techStack.slice(0, 4).map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 rounded-lg border border-purple-500/30"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="px-3 py-1 text-xs font-medium text-gray-500">
                    +{project.techStack.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-5 text-sm">
              {project.language && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                  <span>{project.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-400">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{project.stars.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{project.forks.toLocaleString()}</span>
              </div>
              {project.downloadCount > 0 && (
                <div className="flex items-center gap-1.5 text-gray-400">
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
        <div className="relative p-6 pt-0">
          <div className="flex gap-3">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

            {/* Live Demo Button */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium rounded-xl border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300"
                title="View live demo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">Demo</span>
              </a>
            )}

            {/* GitHub Link */}
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300"
              title="View on GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
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
