'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { userApi } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface GitHubProject {
  id: string;
  title: string;
  description?: string;
  repoUrl?: string;
  liveUrl?: string;
  difficulty: string;
  subDomain?: string;
  domain?: { name: string; slug: string };
  caseStudy?: string;
  problemStatement?: string;
  solutionDescription?: string;
  prerequisites?: string[];
  prerequisitesText?: string;
  estimatedMinTime?: number;
  estimatedMaxTime?: number;
  supposedDeadline?: string;
  deliverables?: string[];
  optionalExtensions?: string;
  evaluationCriteria?: string;
  requirements?: string[];
  requirementsText?: string;
  introduction?: string;
  implementation?: string;
  technicalSkills?: string[];
  toolsUsed?: string[];
  conceptsUsed?: string[];
  downloadUrl: string;
  language?: string;
  author?: string;
  techStack?: string[];
  topics?: string[];
  sourceCode?: {
    downloadUrl: string;
    fileSize?: number;
    hasReadme: boolean;
    hasRequirements: boolean;
  };
}

export default function GitHubProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<GitHubProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github-projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  // Check bookmark status
  useEffect(() => {
    if (user && id) {
      userApi.checkBookmark(id)
        .then((res) => setIsBookmarked(!!res?.bookmarked))
        .catch(() => { });
    }
  }, [user, id]);

  const handleToggleBookmark = async () => {
    if (!user) { router.push('/login'); return; }
    setBookmarkLoading(true);
    try {
      const res = await userApi.toggleBookmark(id);
      setIsBookmarked(res.bookmarked);
    } catch (err) { console.error('Failed to toggle bookmark:', err); }
    finally { setBookmarkLoading(false); }
  };

  /**
   * Extract GitHub owner/repo from a repo URL and fetch the README via GitHub API.
   * Decodes the base64-encoded content returned by the API.
   */
  const handleShowReadme = useCallback(async () => {
    if (!project?.repoUrl) return;
    if (readmeContent) { setReadmeOpen(true); return; } // Already fetched

    setReadmeOpen(true);
    setReadmeLoading(true);
    setReadmeError(null);

    try {
      // Extract owner/repo from URLs like https://github.com/owner/repo
      const match = project.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error('Invalid GitHub URL');
      const [, owner, repo] = match;

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, '')}/readme`, {
        headers: { Accept: 'application/vnd.github.v3.json' },
      });

      if (!res.ok) throw new Error(res.status === 404 ? 'No README found in this repository' : `GitHub API error (${res.status})`);

      const data = await res.json();
      // GitHub returns base64 with embedded newlines — strip them before decoding
      const cleanBase64 = data.content.replace(/\s/g, '');
      const decoded = atob(cleanBase64);
      // Handle UTF-8 properly
      const bytes = Uint8Array.from(decoded, (c: string) => c.charCodeAt(0));
      const text = new TextDecoder().decode(bytes);
      setReadmeContent(text);
      setReadmeError(null);
    } catch (err) {
      setReadmeError(err instanceof Error ? err.message : 'Failed to load README');
      setReadmeContent(null);
    } finally {
      setReadmeLoading(false);
    }
  }, [project?.repoUrl, readmeContent]);

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setReadmeOpen(false); };
    if (readmeOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [readmeOpen]);

  const getDifficultyConfig = (diff: string) => {
    switch (diff) {
      case 'EASY': return { label: 'Beginner', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'MEDIUM': return { label: 'Intermediate', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'HARD': return { label: 'Advanced', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
      default: return { label: diff, color: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-500' };
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading project...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center p-6">
      <span className="material-symbols-outlined text-5xl text-muted-foreground">folder_off</span>
      <h2 className="text-2xl font-bold text-foreground">Project Not Found</h2>
      <button onClick={() => router.back()} className="text-primary hover:underline text-sm font-medium">← Return to Explore</button>
    </div>
  );

  const difficulty = getDifficultyConfig(project.difficulty);
  const allTech = [...(project.techStack || []), ...(project.technicalSkills || [])];
  const uniqueTech = [...new Set(allTech)];

  return (
    <div className="min-h-screen text-foreground pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back */}
        <nav className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Explore
          </button>
        </nav>

        {/* ─── HERO SECTION ─── */}
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${difficulty.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} />
                  {difficulty.label}
                </span>
                {project.domain?.name && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    {project.domain.name}
                  </span>
                )}
                {project.subDomain && (
                  <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
                    {project.subDomain}
                  </span>
                )}
                <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {project.supposedDeadline
                    ? project.supposedDeadline
                    : (project.estimatedMinTime && project.estimatedMaxTime
                      ? `${project.estimatedMinTime}–${project.estimatedMaxTime}h`
                      : 'Self-paced')}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight tracking-tight">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {project.author && (
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">person</span>
                    {project.author}
                  </span>
                )}
                {project.language && (
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">code</span>
                    {project.language}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick-action bar */}
          <div className="mt-6 flex flex-wrap gap-3">
            {(project.downloadUrl || project.sourceCode?.downloadUrl) && (
              <a href={project.sourceCode?.downloadUrl || project.downloadUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-500/15 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold transition-all active:scale-95">
                <span className="material-symbols-outlined text-lg">download</span>Download Source Code
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-semibold transition-all active:scale-95">
                <span className="material-symbols-outlined text-lg">open_in_new</span>Live Demo
              </a>
            )}
          </div>
        </header>

        {/* ─── MAIN CONTENT GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column — 7 Documentation Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Case Study */}
            <section className="relative bg-gradient-to-br from-indigo-500/10 to-background border border-indigo-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-indigo-300 rounded-l-2xl" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600">auto_stories</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 01</span>
                  <h3 className="text-lg font-bold text-foreground -mt-0.5">The Case Study</h3>
                </div>
              </div>
              <blockquote className="text-foreground/80 leading-relaxed text-base md:text-[1.05rem] italic">
                &ldquo;{project.caseStudy || project.description || 'No case study available.'}&rdquo;
              </blockquote>
            </section>

            {/* Section 2: Problem Statement */}
            <section className="relative bg-gradient-to-br from-rose-500/10 to-background border border-rose-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-500 to-rose-300 rounded-l-2xl" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600">psychology</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Section 02</span>
                  <h3 className="text-lg font-bold text-foreground -mt-0.5">The Problem Statement</h3>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed text-base whitespace-pre-wrap">
                {project.problemStatement || project.description || 'No problem statement defined.'}
              </p>
            </section>

            {/* Section 3: Solution Description */}
            <section className="relative bg-gradient-to-br from-emerald-500/10 to-background border border-emerald-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-emerald-300 rounded-l-2xl" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600">lightbulb</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Section 03</span>
                  <h3 className="text-lg font-bold text-foreground -mt-0.5">Solution Description</h3>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed text-base whitespace-pre-wrap">
                {project.solutionDescription || project.introduction || project.description || 'No solution description available.'}
              </p>
            </section>

            {/* Section 4: Prerequisites */}
            <section className="relative bg-gradient-to-br from-amber-500/10 to-background border border-amber-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-amber-300 rounded-l-2xl" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600">school</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Section 04</span>
                  <h3 className="text-lg font-bold text-foreground -mt-0.5">Prerequisites</h3>
                </div>
              </div>
              {project.prerequisitesText && (
                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap mb-4">{project.prerequisitesText}</p>
              )}
              {(project.prerequisites && project.prerequisites.length > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.prerequisites.map((req, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-background/80 rounded-xl border border-amber-500/20/60">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-amber-600 text-xs">check</span>
                      </div>
                      <span className="text-sm text-foreground/80 font-medium">{req}</span>
                    </div>
                  ))}
                </div>
              ) : !project.prerequisitesText && (
                <p className="text-muted-foreground text-sm italic">
                  {project.language ? `Basic knowledge of ${project.language} is recommended.` : 'No specific prerequisites. General programming knowledge recommended.'}
                </p>
              )}
            </section>

            {/* Section 5: Tech Stack & Tools */}
            <section className="relative bg-gradient-to-br from-sky-500/10 to-background border border-sky-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-500 to-sky-300 rounded-l-2xl" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/100/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sky-600">terminal</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">Section 05</span>
                  <h3 className="text-lg font-bold text-foreground -mt-0.5">Tech Stack & Tools</h3>
                </div>
              </div>
              {uniqueTech.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueTech.map(tech => (
                      <span key={tech} className="px-3 py-1.5 bg-background border border-sky-200 text-sky-700 text-xs font-semibold rounded-lg shadow-sm">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
              {project.toolsUsed && project.toolsUsed.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tools & Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {project.toolsUsed.map(tool => (
                      <span key={tool} className="px-3 py-1.5 bg-background border border-border text-foreground/70 text-xs font-medium rounded-lg">{tool}</span>
                    ))}
                  </div>
                </div>
              )}
              {project.conceptsUsed && project.conceptsUsed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Concepts Applied</p>
                  <div className="flex flex-wrap gap-2">
                    {project.conceptsUsed.map(c => (
                      <span key={c} className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-600 text-xs font-medium rounded-lg">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {uniqueTech.length === 0 && (!project.toolsUsed || project.toolsUsed.length === 0) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Topics</p>
                  {project.topics && project.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.topics.map(topic => (
                        <span key={topic} className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-600 text-xs font-medium rounded-lg">{topic}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No tech stack or topics specified.</p>
                  )}
                </div>
              )}
            </section>

            {/* Section 6: Deliverables */}
            <section className="relative bg-gradient-to-br from-violet-500/10 to-background border border-violet-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-500 to-violet-300 rounded-l-2xl" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-violet-600">task_alt</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">Section 06</span>
                  <h3 className="text-lg font-bold text-foreground -mt-0.5">Deliverables</h3>
                </div>
              </div>
              {(project.deliverables && project.deliverables.length > 0) ? (
                <div className="space-y-3">
                  {project.deliverables.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-background/80 rounded-xl border border-violet-500/20/60 hover:border-violet-200 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                        <span className="text-violet-600 text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <span className="text-sm text-foreground font-medium leading-relaxed flex-1">{item}</span>
                      <span className="material-symbols-outlined text-violet-300 text-sm mt-0.5">check_circle</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-4 bg-background/80 rounded-xl border border-violet-500/20/60 hover:border-violet-200 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                      <span className="text-violet-600 text-xs font-bold">01</span>
                    </div>
                    <span className="text-sm text-foreground font-medium leading-relaxed flex-1">Clone the repository and explore the source code.</span>
                    <span className="material-symbols-outlined text-violet-300 text-sm mt-0.5">check_circle</span>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-background/80 rounded-xl border border-violet-500/20/60 hover:border-violet-200 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                      <span className="text-violet-600 text-xs font-bold">02</span>
                    </div>
                    <span className="text-sm text-foreground font-medium leading-relaxed flex-1">Follow the README instructions to setup the project locally.</span>
                    <span className="material-symbols-outlined text-violet-300 text-sm mt-0.5">check_circle</span>
                  </div>
                </div>
              )}
            </section>

            {/* Section 7: Deadline */}
            <section className="relative bg-gradient-to-br from-orange-500/10 to-background border border-orange-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-orange-300 rounded-l-2xl" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600">timer</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Section 07</span>
                  <h3 className="text-lg font-bold text-foreground -mt-0.5">Supposed Deadline</h3>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 px-5 py-3 bg-background border border-orange-200 rounded-xl">
                  <span className="material-symbols-outlined text-orange-500 text-2xl">event</span>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Expected Duration</p>
                    <p className="text-lg font-bold text-foreground">
                      {project.supposedDeadline
                        ? project.supposedDeadline
                        : (project.estimatedMinTime && project.estimatedMaxTime
                          ? `${project.estimatedMinTime}–${project.estimatedMaxTime} Hours`
                          : 'Self-paced')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-background border border-border rounded-xl">
                  <span className="material-symbols-outlined text-muted-foreground text-2xl">hourglass_top</span>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Time Range</p>
                    <p className="text-lg font-bold text-foreground">
                      {project.estimatedMinTime && project.estimatedMaxTime
                        ? `${project.estimatedMinTime}–${project.estimatedMaxTime} Hours`
                        : 'Variable'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Optional: Technical Requirements */}
            {((project.requirements && project.requirements.length > 0) || project.requirementsText) && (
              <section className="bg-background border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-foreground/60">checklist</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Technical Requirements</h3>
                </div>
                {project.requirementsText && (
                  <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap mb-4">{project.requirementsText}</p>
                )}
                {project.requirements && project.requirements.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                        <span className="text-sm text-foreground/80 font-medium">{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Optional: Implementation */}
            {project.implementation && (
              <section className="bg-background border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-foreground/60">architecture</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Implementation / Framework</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">{project.implementation}</p>
              </section>
            )}

            {/* Optional: Evaluation Criteria */}
            {project.evaluationCriteria && (
              <section className="bg-background border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-foreground/60">grade</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Evaluation Criteria</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">{project.evaluationCriteria}</p>
              </section>
            )}

            {/* Optional: Bonus Challenge */}
            {project.optionalExtensions && (
              <section className="bg-gradient-to-br from-primary/5 to-white border border-primary/20 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">extension</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Bonus Challenge</h3>
                    <p className="text-xs text-muted-foreground">Optional extensions for advanced students</p>
                  </div>
                </div>
                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">{project.optionalExtensions}</p>
              </section>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              {/* Quick Actions */}
              <div className="bg-background border border-border rounded-2xl p-6 shadow-sm space-y-5">
                <button
                  onClick={() => router.push(`/workspace/${project.id}?type=github`)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  Start Project
                </button>
                <button
                  onClick={handleToggleBookmark}
                  disabled={bookmarkLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all ${isBookmarked ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary border-border text-foreground hover:border-primary/30'
                    }`}
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                  {isBookmarked ? 'Bookmarked' : 'Save for Later'}
                </button>
                {(project.downloadUrl || project.sourceCode?.downloadUrl) && (
                  <>
                    <div className="h-px bg-border" />
                    <a href={project.sourceCode?.downloadUrl || project.downloadUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-500/15 text-emerald-700 border border-emerald-200 font-semibold text-sm transition-all">
                      <span className="material-symbols-outlined text-lg">download</span>Download Source Code
                    </a>
                  </>
                )}
              </div>

              {/* Metadata */}
              <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">Project Info</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Domain</span>
                    <span className="text-sm font-semibold text-foreground">{project.domain?.name || '—'}</span>
                  </div>
                  {project.subDomain && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sub-domain</span>
                      <span className="text-sm font-semibold text-foreground">{project.subDomain}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Difficulty</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficulty.color}`}>{difficulty.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-semibold text-foreground">
                      {project.supposedDeadline
                        ? project.supposedDeadline
                        : (project.estimatedMinTime && project.estimatedMaxTime
                          ? `${project.estimatedMinTime}–${project.estimatedMaxTime}h`
                          : 'Self-paced')}
                    </span>
                  </div>
                  {project.language && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Language</span>
                      <span className="px-2.5 py-0.5 bg-secondary rounded text-xs font-medium text-foreground">{project.language}</span>
                    </div>
                  )}
                  {project.author && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Author</span>
                      <span className="text-sm font-semibold text-foreground">{project.author}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Source Code */}
              {project.sourceCode && (
                <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">Source Code Details</h4>
                  <div className="space-y-3">
                    {project.sourceCode.fileSize && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">File Size</span>
                        <span className="text-sm font-semibold text-foreground">{(project.sourceCode.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">README.md</span>
                      <span className={`material-symbols-outlined text-base ${project.sourceCode.hasReadme ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {project.sourceCode.hasReadme ? 'check_circle' : 'cancel'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Dependencies</span>
                      <span className={`material-symbols-outlined text-base ${project.sourceCode.hasRequirements ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {project.sourceCode.hasRequirements ? 'check_circle' : 'cancel'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">Links</h4>
                <div className="space-y-2">

                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 -mx-1 rounded-xl border border-border hover:bg-secondary/50 transition-colors group">
                      <svg className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <div className="flex-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Open in GitHub
                      </div>
                      <span className="material-symbols-outlined text-sm text-muted-foreground ml-auto">open_in_new</span>
                    </a>
                  )}

                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 -mx-1 rounded-xl hover:bg-secondary transition-colors group">
                      <span className="material-symbols-outlined text-muted-foreground group-hover:text-foreground">language</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary">Live Demo</span>
                      <span className="material-symbols-outlined text-sm text-muted-foreground ml-auto">open_in_new</span>
                    </a>
                  )}
                  {(project.downloadUrl || project.sourceCode?.downloadUrl) && (
                    <a href={project.sourceCode?.downloadUrl || project.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 -mx-1 rounded-xl hover:bg-secondary transition-colors group">
                      <span className="material-symbols-outlined text-muted-foreground group-hover:text-foreground">folder_zip</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary">Download ZIP</span>
                      <span className="material-symbols-outlined text-sm text-muted-foreground ml-auto">download</span>
                    </a>
                  )}

                  {project.repoUrl && (
                    <button
                      onClick={handleShowReadme}
                      className="flex items-center gap-3 p-3 -mx-1 rounded-xl border border-border hover:bg-secondary/50 transition-colors group w-full text-left"
                    >
                      <span className="material-symbols-outlined text-muted-foreground group-hover:text-foreground transition-colors">description</span>
                      <span className="flex-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">View README</span>
                      <span className="material-symbols-outlined text-sm text-muted-foreground">visibility</span>
                    </button>
                  )}
                </div>
              </div>

              {/* README Modal */}
              {readmeOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-8">
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReadmeOpen(false)} />
                  {/* Modal */}
                  <div className="relative w-full max-w-4xl max-h-[85vh] bg-background rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">description</span>
                        <h3 className="text-lg font-bold text-foreground">README.md</h3>
                        <span className="text-xs text-muted-foreground">— {project.title}</span>
                      </div>
                      <button
                        onClick={() => setReadmeOpen(false)}
                        className="size-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                      {readmeLoading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                          <div className="size-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
                          <p className="text-sm text-muted-foreground">Fetching README from GitHub…</p>
                        </div>
                      )}
                      {readmeError && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                          <span className="material-symbols-outlined text-4xl text-muted-foreground">error_outline</span>
                          <p className="text-sm text-muted-foreground">{readmeError}</p>
                        </div>
                      )}
                      {readmeContent && !readmeLoading && (
                        <div className="prose prose-sm max-w-none
                          prose-headings:text-foreground prose-headings:border-b prose-headings:border-border prose-headings:pb-2 prose-headings:mb-4
                          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                          prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground
                          prose-blockquote:text-muted-foreground prose-blockquote:border-border
                          prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-xl
                          prose-code:text-primary prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                          prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                          prose-img:rounded-xl prose-img:border prose-img:border-transparent prose-img:inline prose-img:m-0
                          prose-table:border prose-table:border-border prose-th:bg-secondary/50
                          prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-muted-foreground
                          prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:text-foreground
                          prose-li:marker:text-primary
                        ">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              img: ({ node, ...props }) => {
                                // Fix relative image URLs to point to GitHub raw content
                                let src = props.src as string;
                                if (src && typeof src === 'string' && !src.startsWith('http') && !src.startsWith('data:')) {
                                  let baseRawUrl = project?.repoUrl?.replace('github.com', 'raw.githubusercontent.com').replace(/\.git$/, '');
                                  if (baseRawUrl) {
                                    // GitHub raw URLs need a branch name. Assuming 'master' or 'main' usually works, 
                                    // but we can just use HEAD which resolves to the default branch.
                                    src = `${baseRawUrl}/HEAD/${src.replace(/^\.\//, '')}`;
                                  }
                                }
                                return <img {...props} src={src} className="rounded-xl border border-transparent inline m-0" />;
                              }
                            }}
                          >
                            {readmeContent}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
