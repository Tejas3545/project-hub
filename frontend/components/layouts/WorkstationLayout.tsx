'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { projectApi, socialApi } from '@/lib/api';

interface WorkstationLayoutProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

export default function WorkstationLayout({
  children,
  leftSidebar,
  rightSidebar,
  showLeftSidebar = true,
  showRightSidebar = true,
}: WorkstationLayoutProps) {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Left Sidebar - Navigation */}
      {showLeftSidebar && (
        <aside
          className={`
            bg-card border-r border-border transition-all duration-300 ease-in-out
            ${isLeftCollapsed ? 'w-16' : 'w-64'}
            hidden lg:flex flex-col
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            {!isLeftCollapsed && (
              <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Menu
              </h2>
            )}
            <button
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              aria-label={isLeftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${isLeftCollapsed ? 'rotate-180' : ''}`}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {leftSidebar || <DefaultLeftSidebar isCollapsed={isLeftCollapsed} />}
          </div>
        </aside>
      )}

      {/* Center Panel - Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="h-full">{children}</div>
      </main>

      {/* Right Sidebar - Quick Stats/Context */}
      {showRightSidebar && (
        <>
          {/* Floating toggle button when sidebar is collapsed */}
          {isRightCollapsed && (
            <button
              onClick={() => setIsRightCollapsed(false)}
              className="fixed right-4 top-20 z-40 p-2.5 bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-all text-muted-foreground hover:text-primary hidden xl:flex items-center gap-2"
              aria-label="Expand Quick Stats"
              title="Show Quick Stats"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
              <span className="text-xs font-medium">Stats</span>
            </button>
          )}
          <aside
            className={`
              bg-card border-l border-border transition-all duration-300 ease-in-out
              ${isRightCollapsed ? 'w-0' : 'w-80'}
              hidden xl:flex flex-col overflow-hidden
            `}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Quick Stats
              </h2>
              <button
                onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                aria-label={isRightCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightSidebar || <DefaultRightSidebar />}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function DefaultLeftSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: '/projects',
      label: 'Launchpad',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      ),
    },
    {
      href: '/submit-project',
      label: 'My Projects (Uploaded)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
          <path d="M16 8l-4-4-4 4" />
          <path d="M12 4v12" />
        </svg>
      ),
    },
    {
      href: '/workspace',
      label: 'Inventory',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: '/search',
      label: 'Explore',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="p-3 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-sm font-medium text-slate-600 dark:text-slate-400
            hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30
            transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? item.label : undefined}
        >
          {item.icon}
          {!isCollapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
}

function DefaultRightSidebar() {
  const [trendingProjects, setTrendingProjects] = useState<Array<{ id: string; title: string; likesCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      try {
        const allProjects = await projectApi.getAll();
        const top = allProjects.slice(0, 5);
        const withLikes = await Promise.all(
          top.map(async (p: any) => {
            try {
              const result = await socialApi.getProjectLikesCount(p.id);
              return { id: p.id, title: p.title, likesCount: result.count || 0 };
            } catch {
              return { id: p.id, title: p.title, likesCount: 0 };
            }
          })
        );
        withLikes.sort((a, b) => b.likesCount - a.likesCount);
        setTrendingProjects(withLikes.slice(0, 3));
      } catch {
        setTrendingProjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Top 3 Trending Projects */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Trending Projects
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : trendingProjects.length > 0 ? (
          <div className="space-y-2">
            {trendingProjects.map((project, idx) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{project.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{project.likesCount} likes</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No trending projects yet</p>
        )}
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800" />

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick Links
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/workspace" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors text-center group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-slate-400 group-hover:text-indigo-500 transition-colors mb-1">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            </svg>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Inventory</p>
          </Link>
          <Link href="/profile" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors text-center group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-slate-400 group-hover:text-indigo-500 transition-colors mb-1">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
