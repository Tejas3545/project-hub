'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { userApi } from '@/lib/api';
import { ArrowLeft, BookOpen, Zap, Award, Clock, CheckCircle2, Lightbulb, Users } from 'lucide-react';

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
  prerequisitesText?: string;
  estimatedMinTime?: number;
  estimatedMaxTime?: number;
  deliverables?: string[];
  optionalExtensions?: string;
  evaluationCriteria?: string;
  introduction?: string;
  technicalSkills?: string[];
  toolsUsed?: string[];
  conceptsUsed?: string[];
}

export default function GitHubProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<GitHubProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github-projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          setError('Project not found');
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-red-400 text-lg">{error || 'Project not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColor = {
    EASY: 'bg-green-500/20 text-green-400 border-green-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    HARD: 'bg-red-500/20 text-red-400 border-red-500/50',
  }[project.difficulty] || 'bg-slate-500/20 text-slate-400 border-slate-500/50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl font-bold text-center flex-1 mr-8 line-clamp-1">{project.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
              <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 rounded-lg border font-semibold ${difficultyColor}`}>
                  {project.difficulty}
                </div>
                {project.subDomain && (
                  <div className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/50 font-semibold">
                    {project.subDomain}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          {project.estimatedMinTime && project.estimatedMaxTime && (
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 w-fit px-4 py-2 rounded-lg border border-slate-700">
              <Clock size={18} className="text-blue-400" />
              <span className="font-semibold">{project.estimatedMinTime}–{project.estimatedMaxTime} hours estimated</span>
            </div>
          )}
        </div>

        {/* 7 Mandatory Sections */}
        <div className="space-y-8">
          {/* 1. Introduction */}
          {project.introduction && (
            <section className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-slate-300 text-lg leading-relaxed">{project.introduction}</p>
            </section>
          )}

          {/* 2. Real-World Context / Case Study */}
          {project.caseStudy && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-amber-400" size={24} />
                <h2 className="text-2xl font-bold">Real-World Context</h2>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed">{project.caseStudy}</p>
            </section>
          )}

          {/* 3. Domain & Sub-domain */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-blue-400" size={24} />
              <h2 className="text-2xl font-bold">Domain & Specialization</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase mb-2">Domain</p>
                <p className="text-lg text-slate-200">{project.domain?.name || 'General'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase mb-2">Sub-Domain</p>
                <p className="text-lg text-slate-200">{project.subDomain || 'Specialized'}</p>
              </div>
            </div>
          </section>

          {/* 4. Difficulty Level */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold">Difficulty & Prerequisites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase mb-3">Difficulty Level</p>
                <div className={`px-6 py-3 rounded-lg border font-bold text-center ${difficultyColor}`}>
                  {project.difficulty}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase mb-3">Estimated Time</p>
                <div className="px-6 py-3 rounded-lg border border-slate-600 font-bold text-center text-slate-200">
                  {project.estimatedMinTime}–{project.estimatedMaxTime} hours
                </div>
              </div>
            </div>
          </section>

          {/* 5. Problem Statement */}
          {project.problemStatement && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="text-yellow-400" size={24} />
                <h2 className="text-2xl font-bold">Problem Statement</h2>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed">{project.problemStatement}</p>
            </section>
          )}

          {/* 6. Solution Description / What to Build */}
          {project.solutionDescription && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-green-400" size={24} />
                <h2 className="text-2xl font-bold">What You&apos;ll Build</h2>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed">{project.solutionDescription}</p>
            </section>
          )}

          {/* 7. Prerequisites & Requirements */}
          {project.prerequisitesText && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-indigo-400" size={24} />
                <h2 className="text-2xl font-bold">Prerequisites & Requirements</h2>
              </div>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-6">{project.prerequisitesText}</div>

              {/* Skills Tags */}
              {project.technicalSkills && project.technicalSkills.length > 0 && (
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase mb-3">Required Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technicalSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Deliverables */}
          {project.deliverables && project.deliverables.length > 0 && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-green-400" size={24} />
                <h2 className="text-2xl font-bold">Deliverables</h2>
              </div>
              <ul className="space-y-2">
                {project.deliverables.map((deliverable, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{deliverable}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Evaluation Criteria */}
          {project.evaluationCriteria && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <div className="flex items-center gap-3 mb-4">
                <Award className="text-cyan-400" size={24} />
                <h2 className="text-2xl font-bold">Evaluation Criteria</h2>
              </div>
              <div className="bg-slate-900/50 rounded p-4 border border-slate-700 text-slate-300 whitespace-pre-wrap">
                {project.evaluationCriteria}
              </div>
            </section>
          )}

          {/* Optional Extensions */}
          {project.optionalExtensions && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="text-orange-400" size={24} />
                <h2 className="text-2xl font-bold">Advanced Extensions (Optional)</h2>
              </div>
              <div className="bg-slate-900/50 rounded p-4 border border-slate-700 text-slate-300">
                {project.optionalExtensions}
              </div>
            </section>
          )}

          {/* Technical Stack */}
          {(project.toolsUsed && project.toolsUsed.length > 0) || (project.conceptsUsed && project.conceptsUsed.length > 0) ? (
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
              <h2 className="text-2xl font-bold mb-6">Technical Stack & Concepts</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.toolsUsed && project.toolsUsed.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm font-semibold uppercase mb-3">Tools & Frameworks</p>
                    <div className="flex flex-wrap gap-2">
                      {project.toolsUsed.map((tool, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/50"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.conceptsUsed && project.conceptsUsed.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm font-semibold uppercase mb-3">Key Concepts</p>
                    <div className="flex flex-wrap gap-2">
                      {project.conceptsUsed.map((concept, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/50"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <button
              onClick={async () => {
                if (!user) {
                  router.push('/login');
                  return;
                }
                // Save progress to database so workspace can track started projects
                try {
                  await userApi.updateGithubProgress(project.id, { status: 'IN_PROGRESS' });
                } catch (err) {
                  console.error('Failed to save progress:', err);
                }
                router.push(`/workspace/${project.id}?type=github`);
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              {user ? 'Start This Project' : 'Sign In to Start'}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
