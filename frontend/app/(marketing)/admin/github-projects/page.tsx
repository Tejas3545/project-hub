'use client';

import { useState, useEffect } from 'react';
import { githubProjectApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { GitHubProject } from '@/types';

type QaStatus = 'APPROVED' | 'NEEDS_REWORK' | 'REJECTED';
type QaFilter = QaStatus | 'PENDING';

interface ReviewModalProps {
    project: GitHubProject | null;
    status: QaStatus | null;
    onClose: () => void;
    onSubmit: (feedback: string) => void;
}

function ReviewModal({ project, status, onClose, onSubmit }: ReviewModalProps) {
    const [feedback, setFeedback] = useState('');

    if (!project || !status) return null;

    const config = {
        APPROVED: {
            title: 'Approve Project',
            color: 'text-emerald-600',
            btn: 'bg-emerald-600 shadow-emerald-500/20',
            placeholder: 'Optionally provide notes on why this project meets standards...'
        },
        NEEDS_REWORK: {
            title: 'Request Rework',
            color: 'text-amber-600',
            btn: 'bg-amber-600 shadow-amber-500/20',
            placeholder: 'Provide specific instructions on what needs to be improved...'
        },
        REJECTED: {
            title: 'Reject Project',
            color: 'text-red-600',
            btn: 'bg-red-600 shadow-red-500/20',
            placeholder: 'Provide details on why this project was rejected...'
        }
    }[status];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020817]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.color} mb-1 block`}>
                                QA Review Action
                            </span>
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
                                {config.title}
                            </h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                            <span className="material-symbols-outlined text-muted-foreground">close</span>
                        </button>
                    </div>

                    <div className="mb-8 p-4 bg-secondary/50 rounded-2xl border border-border">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Project</div>
                        <div className="text-sm font-bold text-foreground">{project.title}</div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                            Review Feedback
                        </label>
                        <textarea
                            autoFocus
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder={config.placeholder}
                            className="w-full h-40 bg-white border border-border rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none leading-relaxed"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSubmit(feedback)}
                            className={`py-4 text-xs font-black uppercase tracking-widest text-white rounded-2xl transition-all shadow-lg hover:opacity-90 active:scale-[0.98] ${config.btn}`}
                        >
                            Confirm {status.replace('_', ' ').toLowerCase()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GithubProjectQaPage() {
    const [projects, setProjects] = useState<GitHubProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<QaFilter>('PENDING');
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

    // Review Modal State
    const [reviewTarget, setReviewTarget] = useState<{ project: GitHubProject; status: QaStatus } | null>(null);

    useEffect(() => {
        loadProjects();
    }, [filter]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            // Fetch projects with the selected QA status using the now-updated API interface
            const response = await githubProjectApi.getAll({
                limit: 100,
                qaStatus: filter
            });

            setProjects(response.projects);

            // Update stats based on current view
            setStats(prev => ({
                ...prev,
                total: response.pagination.total
            }));
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: string, status: QaStatus, feedback: string) => {
        try {
            await githubProjectApi.review(id, {
                qaStatus: status,
                qaFeedback: feedback || 'Reviewed by Admin',
                reviewedBy: 'Admin' // Should come from auth context
            });
            // Remove from current list view
            setProjects(prev => prev.filter(p => p.id !== id));
            setReviewTarget(null);
        } catch (error) {
            alert('Review failed');
        }
    };

    return (
        <div className="min-h-screen p-8 bg-[#fdfdfd]">
            <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-8 bg-primary"></span>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Quality Assurance Protocol</span>
            <span className="h-px w-8 bg-primary"></span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.85] mb-8 uppercase">
            Review <span className="text-primary italic">Queue</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl font-medium leading-relaxed italic">
            Validating technical documentation, repository health, and submission quality for global releases.
          </p>

          <div className="flex items-center justify-center gap-2 p-1.5 bg-secondary rounded-[24px] mt-12 border border-border shadow-inner">
            {['PENDING', 'APPROVED', 'NEEDS_REWORK'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-10 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${filter === status ? 'bg-white text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            <AnimatePresence mode="popLayout">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className="bg-white rounded-[40px] border border-border shadow-sm p-1 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group relative"
                >
                  <div className="absolute top-12 right-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-[120px] font-thin">verified_user</span>
                  </div>

                  <div className="p-10 lg:p-14 flex flex-col lg:flex-row gap-12 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20">
                          {project.domain?.name || 'Uncategorized'}
                        </span>
                        <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-secondary text-muted-foreground border border-border">
                          {project.language || 'Manual Submission'}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors mb-4 leading-[0.9]">
                        {project.title}
                      </h3>

                      <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed mb-10 max-w-3xl italic line-clamp-3">
                        {project.description}
                      </p>

                      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-12">
                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Engagement Matrix</div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm font-black text-foreground">
                              <span className="material-symbols-outlined text-lg text-amber-500">star</span>
                              {project.stars || 0}
                            </div>
                            <div className="h-4 w-px bg-border"></div>
                            <div className="flex items-center gap-1.5 text-sm font-black text-foreground">
                              <span className="material-symbols-outlined text-lg text-primary">fork_left</span>
                              {project.forks || 0}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Source Validity</div>
                          <Link
                            href={`/github-projects/${project.id}`}
                            target="_blank"
                            className="flex items-center gap-2 text-xs font-black text-primary hover:underline group/link bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 transition-all hover:bg-primary/10"
                          >
                            Inspection Terminal <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">terminal</span>
                          </Link>
                        </div>
                      </div>

                      {/* QA Feedback History */}
                      {project.qaFeedback && (
                        <div className="mt-12 p-8 bg-secondary/40 rounded-3xl border border-border border-dashed relative overflow-hidden group/feedback">
                          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                            <span className="material-symbols-outlined text-6xl">history_edu</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Protocol Feedback</span>
                          </div>
                          <p className="text-base font-bold text-foreground leading-relaxed italic opacity-80">
                            &ldquo;{project.qaFeedback}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row lg:flex-col gap-4 shrink-0 w-full lg:w-56 mt-2">
                      <button
                        onClick={() => setReviewTarget({ project, status: 'APPROVED' })}
                        className="flex-1 lg:w-full py-5 bg-emerald-500 text-white rounded-[22px] shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-1 active:scale-95 transition-all text-[11px] font-black uppercase tracking-[0.2em]"
                      >
                        Approve Data
                      </button>
                      <button
                        onClick={() => setReviewTarget({ project, status: 'NEEDS_REWORK' })}
                        className="flex-1 lg:w-full py-5 bg-white text-amber-600 border border-amber-200 rounded-[22px] hover:bg-amber-50 hover:-translate-y-1 active:scale-95 transition-all text-[11px] font-black uppercase tracking-[0.2em]"
                      >
                        Issue Rework
                      </button>
                      <button
                        onClick={() => setReviewTarget({ project, status: 'REJECTED' })}
                        className="flex-1 lg:w-full py-5 bg-white text-red-500 border border-red-200 rounded-[22px] hover:bg-red-50 hover:-translate-y-1 active:scale-95 transition-all text-[11px] font-black uppercase tracking-[0.2em]"
                      >
                        Reject Entry
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

                {!loading && projects.length === 0 && (
                    <div className="text-center py-40 bg-white rounded-[40px] border border-dashed border-border flex flex-col items-center justify-center">
                        <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-muted-foreground/30">task_alt</span>
                        </div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Queue Clear</h3>
                        <p className="text-muted-foreground text-sm font-medium mt-2">All items for this status have been addressed.</p>
                    </div>
                )}
            </div>

            <ReviewModal
                project={reviewTarget?.project || null}
                status={reviewTarget?.status || null}
                onClose={() => setReviewTarget(null)}
                onSubmit={(feedback) => handleReview(reviewTarget!.project.id, reviewTarget!.status, feedback)}
            />
        </div>
    );
}
