'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { domainApi } from '@/lib/api';
import { Domain } from '@/types';
import { ArrowRight, BookOpen, Rocket, Users, CheckCircle2, Code, FolderGit2, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await domainApi.getAll();
        const sorted = data.sort((a: Domain, b: Domain) => {
          const countA = (a._count?.projects || 0) + (a._count?.githubProjects || 0);
          const countB = (b._count?.projects || 0) + (b._count?.githubProjects || 0);
          return countB - countA;
        });
        setDomains(sorted);
      } catch (error) {
        console.error('Failed to fetch domains', error);
      }
    };
    fetchDomains();
  }, []);

  const getDomainIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('web') || n.includes('front') || n.includes('back')) return 'code';
    if (n.includes('ai') || n.includes('intelligence') || n.includes('neural')) return 'psychology';
    if (n.includes('ml') || n.includes('machine') || n.includes('learning')) return 'settings_suggest';
    if (n.includes('data') || n.includes('science')) return 'database';
    if (n.includes('security') || n.includes('cyber') || n.includes('hack')) return 'shield';
    if (n.includes('game')) return 'sports_esports';
    if (n.includes('mobile') || n.includes('app') || n.includes('android') || n.includes('ios')) return 'smartphone';
    if (n.includes('cloud') || n.includes('devops') || n.includes('aws')) return 'cloud';
    return 'layers';
  };

  return (
    <main className="relative overflow-hidden bg-white selection:bg-primary/20">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center py-24 px-4 sm:px-8">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eff6ff] text-primary text-sm font-medium mb-8 border border-primary/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Build real projects, grow real skills
          </div>

          {/* Heading */}
          <h1 className="mb-6 tracking-tight">
            Stop Watching Tutorials.
            <br />
            <span className="text-gradient">Start Building.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#64748b] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover curated, real-world projects across every domain. Track your progress, build your portfolio, and stand out to recruiters.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projects" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              Explore Projects
              <ArrowRight className="w-5 h-5" />
            </Link>
            {!user ? (
              <Link href="/login" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
                Sign In
              </Link>
            ) : (
              <Link href="/dashboard" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
                Open Dashboard
              </Link>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16 pt-8 border-t border-[#e2e8f0]">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#020817]">500+</p>
              <p className="text-sm text-[#64748b] mt-1">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#020817]">10+</p>
              <p className="text-sm text-[#64748b] mt-1">Domains</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#020817]">Free</p>
              <p className="text-sm text-[#64748b] mt-1">To Use</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-[#64748b]">
              <div className="p-1 rounded-full bg-[#eff6ff] text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Open Source Projects</span>
            </div>
            <div className="flex items-center gap-2 text-[#64748b]">
              <div className="p-1 rounded-full bg-[#eff6ff] text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Progress Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-[#64748b]">
              <div className="p-1 rounded-full bg-[#eff6ff] text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">No Credit Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Domain Categories ─── */}
      <section className="w-full bg-[#f9fafb] py-20 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Section Header */}
          <div className="section-header">
            <div className="pill-badge mb-4 mx-auto">Popular Domains</div>
            <h2 className="mb-4">
              Explore by <span className="text-gradient">Domain</span>
            </h2>
            <p className="text-[#64748b] text-base sm:text-lg leading-relaxed">
              Pick a technical domain that matches your interests and dive into curated projects.
            </p>
          </div>

          {/* Domain Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {domains.length > 0 ? (
              domains.slice(0, 5).map((domain) => (
                <Link
                  key={domain.id}
                  href={`/projects?domainId=${domain.id}`}
                  className="group relative flex flex-col gap-6 p-8 rounded-2xl border border-[#e2e8f0] bg-white hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                >
                  {/* Hover bg */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

                  {/* Icon */}
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-2xl">{getDomainIcon(domain.name)}</span>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#020817] mb-1 group-hover:text-primary transition-colors duration-300 tracking-tight">
                      {domain.name}
                    </h3>
                    <p className="text-sm text-[#64748b]">
                      {((domain._count?.projects || 0) + (domain._count?.githubProjects || 0))} projects
                    </p>
                  </div>

                  {/* Arrow link */}
                  <div className="flex items-center text-primary font-medium text-sm gap-0 group-hover:gap-2 transition-all duration-300 mt-auto">
                    <span>Browse</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </Link>
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-8 rounded-2xl border border-[#e2e8f0] bg-white animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-[#f1f5f9] mb-6"></div>
                  <div className="h-5 bg-[#f1f5f9] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#f1f5f9] rounded w-1/2"></div>
                </div>
              ))
            )}
          </div>

          {/* View All */}
          <div className="text-center mt-12">
            <Link href="/domains" className="btn-secondary text-sm px-6 py-2.5">
              View All Domains
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="w-full py-20 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="section-header">
            <div className="pill-badge mb-4 mx-auto">Platform Features</div>
            <h2 className="mb-4">
              Why Choose <span className="text-gradient">Project Hub</span>?
            </h2>
            <p className="text-[#64748b] text-base sm:text-lg leading-relaxed">
              Everything you need to learn by doing — from discovering projects to tracking your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: FolderGit2,
                title: 'Curated Projects',
                description: 'Browse hundreds of real-world projects sourced from GitHub, organized by domain, difficulty, and tech stack.',
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                description: 'Track your journey through each project — mark milestones, set deadlines, and watch your portfolio grow.',
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Submit your own projects, comment on others, and climb the leaderboard as you complete more challenges.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-start p-8 rounded-2xl border border-[#e2e8f0] hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 bg-white"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-primary/30">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#020817] mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="w-full bg-[#f9fafb] py-20 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="section-header">
            <div className="pill-badge mb-4 mx-auto">How It Works</div>
            <h2 className="mb-4">
              Four Simple <span className="text-gradient">Steps</span>
            </h2>
            <p className="text-[#64748b] text-base sm:text-lg leading-relaxed">
              From picking a domain to building a standout portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-5xl mx-auto">
            {[
              { id: '01', title: 'Pick a Domain', desc: 'Choose from web, AI/ML, mobile, security, and more.' },
              { id: '02', title: 'Select a Project', desc: 'Browse curated projects that match your level.' },
              { id: '03', title: 'Build & Track', desc: 'Work on the project while tracking your progress.' },
              { id: '04', title: 'Grow Your Portfolio', desc: 'Completed projects become proof of your skills.' },
            ].map((step) => (
              <div key={step.id} className="relative group">
                <div className="text-6xl font-bold text-[#e2e8f0] group-hover:text-primary/20 transition-colors duration-300 mb-4 font-mono">
                  {step.id}
                </div>
                <h3 className="text-lg font-semibold text-[#020817] mb-2 group-hover:text-primary transition-colors duration-300 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative w-full py-24 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-2xl shadow-primary/30">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="mb-6">
            Ready to Start <span className="text-gradient">Building</span>?
          </h2>
          <p className="text-[#64748b] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of developers who are learning by building real projects.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? '/dashboard' : '/login'} className="btn-primary text-base px-10 py-4 w-full sm:w-auto">
              {user ? 'Go to Dashboard' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/projects" className="btn-secondary text-base px-10 py-4 w-full sm:w-auto">
              Browse Projects
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto h-px bg-[#e2e8f0] mt-12 mb-8"></div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-[#64748b]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-[#eff6ff] text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-[#eff6ff] text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">No account required to browse</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-[#eff6ff] text-primary">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Community supported</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
