'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { userApi } from '@/lib/api';
import { ArrowLeft, BookOpen, Play, Pause, RotateCcw, Download, ExternalLink, CheckCircle2, Clock, Target, FileText, Save } from 'lucide-react';
import Link from 'next/link';

interface WorkspaceProject {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  subDomain?: string;
  domainName?: string;
  repoUrl?: string;
  downloadUrl?: string;
  liveUrl?: string;
  deliverables?: string[];
  evaluationCriteria?: string;
  estimatedMinTime?: number;
  estimatedMaxTime?: number;
  technicalSkills?: string[];
  caseStudy?: string;
  problemStatement?: string;
  solutionDescription?: string;
}

interface WorkspaceState {
  timeSpent: number;
  notes: string;
  checklist: boolean[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  startedAt: string;
}

function WorkspaceContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isGithub = searchParams.get('type') === 'github';
  const { user } = useAuth();
  const [project, setProject] = useState<WorkspaceProject | null>(null);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Notes & checklist
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<boolean[]>([]);
  const [status, setStatus] = useState<'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'>('IN_PROGRESS');
  const [saveMessage, setSaveMessage] = useState('');

  // Load saved state from DB
  const loadState = useCallback(async () => {
    if (!isGithub) return;
    try {
      const saved = await userApi.getGithubSingleProgress(id as string);
      if (saved && saved.status !== 'NOT_STARTED') {
        setTimeSpent(saved.timeSpent || 0);
        setNotes(saved.notes || '');
        setChecklist(saved.checklist || []);
        setStatus(saved.status || 'IN_PROGRESS');
      }
    } catch (err) {
      console.warn('Failed to load workspace state (may be first visit):', err);
    }
  }, [id, isGithub]);

  // Save state to DB
  const saveState = useCallback(async () => {
    if (!isGithub) return;
    try {
      await userApi.updateGithubProgress(id as string, {
        timeSpent,
        notes,
        checklist,
        status,
      });

      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('Save failed');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  }, [timeSpent, notes, checklist, status, id, isGithub]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTimerRunning || notes.length > 0) {
        saveState();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [saveState, isTimerRunning, notes]);

  // Timer tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const endpoint = isGithub
          ? `${process.env.NEXT_PUBLIC_API_URL}/github-projects/${id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`;

        const token = localStorage.getItem('accessToken');
        const res = await fetch(endpoint, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          const proj = isGithub ? data : data.project || data;

          setProject({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            difficulty: proj.difficulty,
            subDomain: proj.subDomain,
            domainName: proj.domain?.name,
            repoUrl: proj.repoUrl,
            downloadUrl: proj.downloadUrl,
            liveUrl: proj.liveUrl,
            deliverables: proj.deliverables || [],
            evaluationCriteria: proj.evaluationCriteria,
            estimatedMinTime: proj.estimatedMinTime || proj.minTime,
            estimatedMaxTime: proj.estimatedMaxTime || proj.maxTime,
            technicalSkills: proj.technicalSkills || [],
            caseStudy: proj.caseStudy,
            problemStatement: proj.problemStatement,
            solutionDescription: proj.solutionDescription,
          });

          // Initialize checklist from deliverables
          if (proj.deliverables?.length) {
            // Checklist will be synced from DB via loadState
            // Only set default if loadState doesn't set it
            setChecklist(prev => {
              if (prev.length === proj.deliverables.length) return prev;
              return new Array(proj.deliverables.length).fill(false);
            });
          }
        }
      } catch (error) {
        console.error('Fetch project error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    // Only load user-specific state if user is authenticated
    if (user) {
      loadState();
    }
  }, [id, isGithub, loadState, user]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = checklist.filter(Boolean).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h2>
          <Link href="/domains" className="text-primary hover:text-primary/80">
            Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access your workspace.</p>
          <Link href="/login" className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 inline-block">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/projects/${id}`}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Project</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' :
              status === 'ON_HOLD' ? 'bg-yellow-500/10 text-amber-600 border-amber-500/20' :
              'bg-primary/10 text-primary border-primary/20'
            }`}>
              {status.replace('_', ' ')}
            </span>
            {saveMessage && (
              <span className="text-emerald-600 text-sm animate-pulse">{saveMessage}</span>
            )}
            <button
              onClick={saveState}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-muted rounded-lg text-sm transition border border-border"
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 relative">
        {/* Project Header */}
        <div className="bg-primary rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="flex items-start justify-between flex-wrap gap-4 relative">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-white" />
                <span className="text-white text-sm font-semibold">Project Workspace</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight text-white drop-shadow-sm">{project.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors ${
                  project.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30' :
                  project.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-200 border-amber-500/30' :
                  'bg-red-400/10 text-red-200 border-red-500/30'
                }`}>
                  {project.difficulty}
                </span>
                {project.subDomain && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20">
                    {project.subDomain}
                  </span>
                )}
                {project.domainName && project.domainName !== project.subDomain && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white border border-white/30">
                    {project.domainName}
                  </span>
                )}
              </div>
            </div>
            {/* Quick action links */}
            <div className="flex items-center gap-3 relative">
              {project.downloadUrl && (
                <a
                  href={project.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-sm rounded-xl text-sm font-bold transition-all duration-200 border border-white/20 hover:border-white shadow-sm hover:shadow-md"
                >
                  <Download size={18} />
                  Download
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-sm rounded-xl text-sm font-bold transition-all duration-200 border border-white/20 hover:border-white shadow-sm hover:shadow-md"
                >
                  <ExternalLink size={18} />
                  Demo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Timer + Status + Progress */}
          <div className="space-y-6">
            {/* Timer Card */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Time Tracker
              </h3>
              <div className="text-center mb-4">
                <div className="text-5xl font-mono font-bold text-primary mb-2 tracking-wider">
                  {formatTime(timeSpent)}
                </div>
                {project.estimatedMinTime && project.estimatedMaxTime && (
                  <p className="text-muted-foreground text-sm">
                    Estimated: {project.estimatedMinTime}–{project.estimatedMaxTime}h
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsTimerRunning(!isTimerRunning);
                    if (!isTimerRunning && status !== 'IN_PROGRESS') {
                      setStatus('IN_PROGRESS');
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    isTimerRunning
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 border border-red-600'
                      : 'bg-primary text-white shadow-lg shadow-primary/20 border border-primary'
                  }`}
                >
                  {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset timer to 0? This cannot be undone.')) {
                      setTimeSpent(0);
                      setIsTimerRunning(false);
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-muted border border-border rounded-xl text-sm font-bold text-foreground transition-all shadow-sm"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target size={20} className="text-purple-600" />
                Project Status
              </h3>
              <div className="space-y-2">
                {(['IN_PROGRESS', 'COMPLETED', 'ON_HOLD'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus(s);
                      if (s === 'COMPLETED') setIsTimerRunning(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border transition text-sm font-semibold ${
                      status === s
                        ? s === 'COMPLETED' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600' :
                          s === 'ON_HOLD' ? 'bg-yellow-500/10 border-amber-500/20 text-amber-600' :
                          'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {s === 'IN_PROGRESS' && '▶ In Progress'}
                    {s === 'COMPLETED' && '✓ Completed'}
                    {s === 'ON_HOLD' && '⏸ On Hold'}
                  </button>
                ))}
              </div>
            </div>

            {/* Deliverables Checklist */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  Deliverables
                </h3>
                <p className="text-muted-foreground text-sm mb-4">{completedCount}/{totalCount} completed ({progressPercent}%)</p>
                {/* Progress bar */}
                <progress
                  className="w-full h-2 mb-4 [&]:appearance-none [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-green-500 [&::-webkit-progress-value]:transition-all [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-green-500"
                  value={progressPercent}
                  max={100}
                  aria-label="Deliverables progress"
                >
                  {progressPercent}%
                </progress>
                <div className="space-y-2">
                  {project.deliverables.map((item, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                        checklist[idx] ? 'bg-emerald-50 border border-emerald-500/20' : 'hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checklist[idx] || false}
                        onChange={() => {
                          const updated = [...checklist];
                          updated[idx] = !updated[idx];
                          setChecklist(updated);
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-border text-green-500 focus:ring-green-500"
                      />
                      <span className={`text-sm ${
                        checklist[idx] ? 'text-emerald-600 line-through' : 'text-foreground'
                      }`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Skills */}
            {project.technicalSkills && project.technicalSkills.length > 0 && (
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technicalSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs border border-purple-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Notes + Project Brief */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notes Editor */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText size={20} className="text-amber-600" />
                  Notes &amp; Journal
                </h3>
                <span className="text-xs text-muted-foreground">{notes.length} characters</span>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={'Write your notes, progress updates, code snippets, questions, blockers...\n\nTip: Use this space to document your learning journey, track what you\'ve done, and plan next steps.'}
                className="w-full h-64 bg-background border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground resize-y focus:outline-none focus:border-primary transition text-sm font-mono leading-relaxed"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={saveState}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold transition shadow-sm hover:opacity-90"
                >
                  <Save size={14} />
                  Save Notes
                </button>
              </div>
            </div>

            {/* Project Quick Reference */}
            {(project.problemStatement || project.solutionDescription) && (
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Quick Reference</h3>
                <div className="space-y-4">
                  {project.problemStatement && (
                    <div>
                      <h4 className="text-sm font-bold text-amber-600 uppercase mb-2">Problem Statement</h4>
                      <p className="text-foreground text-sm leading-relaxed">{project.problemStatement}</p>
                    </div>
                  )}
                  {project.solutionDescription && (
                    <div>
                      <h4 className="text-sm font-bold text-emerald-600 uppercase mb-2">What to Build</h4>
                      <p className="text-foreground text-sm leading-relaxed">{project.solutionDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evaluation Criteria */}
            {project.evaluationCriteria && (
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  Evaluation Criteria
                </h3>
                <div className="bg-background rounded-lg p-4 border border-border text-foreground text-sm whitespace-pre-wrap">
                  {project.evaluationCriteria}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}
