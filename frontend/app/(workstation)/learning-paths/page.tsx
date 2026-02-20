'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  domains: string[];
  projectIds: string[];
  estimatedTime: number;
  skills: string[];
}

interface Recommendation {
  completedProjects: number;
  recommendedDifficulty: string;
  topDomain: string;
  topSkills: string[];
}

export default function LearningPathsPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [recommendations, setRecommendations] = useState<LearningPath[]>([]);
  const [insights, setInsights] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchPaths = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning-paths`);
      if (res.ok) {
        const data = await res.json();
        setPaths(data.paths);
      }
    } catch (error) {
      console.error('Fetch paths error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning-paths/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations);
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Fetch recommendations error:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-20">
      {/* Editorial Header - Standard Professional Way */}
      <div className="relative">
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-12 bg-primary"></span>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Learning Paths</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[0.9] mb-8 uppercase">
            Learning<br />
            <span className="text-primary text-gradient">Paths</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
            Guided learning journeys with curated sequences of projects that progressively build your skills and expertise.
          </p>
        </div>
      </div>

      {/* Logic Explanation Section - Standard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-secondary/30 rounded-3xl border border-border/50">
        <div className="space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined font-black">psychology</span>
          </div>
          <h4 className="text-lg font-bold text-foreground">Personalized Logic</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our AI analyzes your completed projects to identify skill gaps and suggest the most efficient path for your growth.
          </p>
        </div>
        <div className="space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined font-black">trending_up</span>
          </div>
          <h4 className="text-lg font-bold text-foreground">Progressive Difficulty</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each path starts with fundamental concepts and scales to complex, real-world system designs as you advance.
          </p>
        </div>
        <div className="space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined font-black">workspace_premium</span>
          </div>
          <h4 className="text-lg font-bold text-foreground">Skill Validation</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete a series of projects in a path to earn domain-specific achievements and prove your professional competence.
          </p>
        </div>
      </section>

      {/* Recommendations */}
      {user && (recommendations.length > 0 || insights) ? (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-foreground text-white p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-0"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <span className="px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                  Intelligence Feed
                </span>
              </div>
              
              <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter">
                Based on your <span className="text-primary italic font-serif normal-case">Activity.</span>
              </h2>

              {insights && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                  {[
                    { label: 'Completed', val: insights.completedProjects, sub: 'Projects done', icon: 'check_circle' },
                    { label: 'Next Level', val: insights.recommendedDifficulty, sub: 'Optimal focus', icon: 'speed' },
                    { label: 'Top Domain', val: insights.topDomain || 'Pending', sub: 'Your specialty', icon: 'hub' },
                    { label: 'Best Match', val: recommendations.length > 0 ? recommendations[0].title.split(' ')[0] : 'None', sub: 'Recommended start', icon: 'star' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm group hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-4 text-white/40 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">0{i+1}</span>
                      </div>
                      <div className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">{stat.val}</div>
                      <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-[9px] font-bold text-primary/80 italic lowercase tracking-wider mt-2">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              )}

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommendations.map(path => (
                    <div key={path.id} className="bg-white p-8 rounded-3xl group/card flex flex-col h-full hover:scale-[1.02] transition-all">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-6">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20">
                            {path.difficulty}
                          </span>
                          <span className="material-symbols-outlined text-primary text-2xl">bolt</span>
                        </div>
                        <h3 className="text-xl font-black text-foreground group-hover/card:text-primary transition-colors mb-4 tracking-tight leading-tight">
                          {path.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-3">
                          {path.description}
                        </p>
                      </div>
                      <div className="pt-6 border-t border-border mt-auto space-y-6">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">inventory_2</span> {path.projectIds.length} modules</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span> {path.estimatedTime}h total</span>
                        </div>
                        <Link href={`/learning-paths/${path.id}`} className="w-full flex items-center justify-center gap-2 bg-foreground text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors">
                          Start Path <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-white/60 font-medium italic">Complete 1 project to unlock smart recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Global Directory */}
      <section className="animate-in fade-in duration-1000">
        <div className="flex items-center gap-6 mb-12">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">
            All Learning <span className="text-primary italic font-serif normal-case">Paths</span>
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
        </div>

        {paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paths.map(path => (
              <div key={path.id} className="bg-white border border-border p-8 rounded-3xl hover:border-primary/30 transition-all group/card flex flex-col h-full hover:bg-secondary">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${path.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        path.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                      {path.difficulty}
                    </span>
                    <span className="material-symbols-outlined text-muted-foreground text-2xl group-hover/card:text-primary transition-colors">auto_stories</span>
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-4 tracking-tight leading-tight group-hover/card:text-primary transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-3">
                    {path.description}
                  </p>
                </div>
                <div className="pt-6 border-t border-border mt-auto space-y-6">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-sm">view_module</span> {path.projectIds.length} Steps</span>
                    <span className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-sm">timer</span> ~{path.estimatedTime}H</span>
                  </div>
                  <Link href={`/learning-paths/${path.id}`} className="btn-secondary w-full flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-black">
                    Details <span className="material-symbols-outlined text-sm group-hover/card:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-border rounded-3xl">
            <div className="size-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">explore</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Paths coming soon...</h3>
            <p className="text-muted-foreground">Our curriculum experts are currently building new guided journeys for you.</p>
          </div>
        )}
      </section>

      {/* Footer Branding */}
      <div className="py-20 text-center border-t border-border">
          <p className="text-xs font-black text-primary uppercase tracking-[0.5em] mb-4">Project Hub Academy</p>
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Learning Paths &copy; 2026 Professional Curriculum
          </div>
      </div>
    </div>
  );
}
