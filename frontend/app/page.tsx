'use client';

import Link from 'next/link';
import { domainApi } from '@/lib/api';
import DomainCard from '@/components/DomainCard';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Rocket, Target, CheckCircle2, ChevronDown, Code, Layers, Shield, Zap } from 'lucide-react';
import type { Domain } from '@/types';

export default function HomePage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDomains() {
      try {
        setError('');
        const data = await domainApi.getAll();
        setDomains(data);
      } catch (error) {
        console.error('Failed to fetch domains:', error);
        setError('Failed to load domains. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchDomains();
  }, []);

  const totalProjects = domains.reduce((sum, d) => {
    const gh = d._count?.githubProjects || 0;
    const reg = d._count?.projects || 0;
    return sum + gh + reg;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        {/* Background Decoratives */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Colorful Animated Glows */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-accent rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-accent rounded-full blur-3xl animate-pulse-slower"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-accent rounded-full blur-3xl animate-pulse animate-duration-5000"></div>
          
          {/* Floating Code Snippets */}
          <div className="absolute top-[15%] left-[8%] text-primary/40 font-mono text-sm animate-float hidden lg:block">
            const learn = () =&gt; {"{...}"}
          </div>
          <div className="absolute top-[35%] left-[5%] text-cyan-500/40 font-mono text-sm animate-float animation-delay-1000 hidden lg:block">
            function build() {"{}"}
          </div>
          <div className="absolute bottom-[30%] left-[10%] text-purple-500/40 font-mono text-sm animate-float animation-delay-2000 hidden lg:block">
            if (project === awesome)
          </div>
          <div className="absolute top-[18%] right-[12%] text-primary/40 font-mono text-sm animate-float animation-delay-1500 hidden lg:block">
            while (building) {"{...}"}
          </div>
          <div className="absolute top-[48%] right-[6%] text-cyan-500/40 font-mono text-sm animate-float animation-delay-500 hidden lg:block">
            return success;
          </div>
          <div className="absolute bottom-[22%] right-[15%] text-purple-500/40 font-mono text-sm animate-float animation-delay-2500 hidden lg:block">
            deploy &amp;&amp; celebrate
          </div>
          
          <div className="absolute inset-0 opacity-[0.03] hero-grid-bg"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8">
          {/* Student Pill */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-accent border border-primary/20 backdrop-blur-sm text-primary text-xs sm:text-sm font-medium">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Join {totalProjects > 0 ? `${totalProjects.toLocaleString()}+` : ''} curated industry projects</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center text-foreground mb-6 tracking-tight leading-[1.1]">
            Stop Watching Tutorials.
            <br />
            <span className="text-gradient-blue-purple">
              Start Building.
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-center text-muted-foreground text-lg sm:text-xl leading-relaxed mb-10">
            Real projects with clear deliverables, structured guidance, and evaluation criteria — designed by industry professionals for students who want to build things that matter.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="group text-base px-8 py-6 rounded-xl gradient-blue-purple shadow-lg glow-blue hover:shadow-xl hover:scale-105 transition-all border-0">
              <Link href="/search" className="gap-2 text-white">
                Browse Projects
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl border hover:border-primary/50 hover:bg-blue-accent transition-all">
              <Link href="/domains">
                Explore Domains
              </Link>
            </Button>
          </div>

          {/* Stats Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 pt-12 border-t border-border max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-1">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">{totalProjects > 0 ? `${totalProjects.toLocaleString()}+` : '...'}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Projects</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">{domains.length || '...'}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Domains</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">3</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Difficulty Levels</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Free to access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Industry-grade projects</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Complete specifications</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-muted/30 border-y border-border py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Why Choose Project Hub?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Everything you need to go from student to confident builder.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Structured Learning Paths',
                description: 'Each project comes with clear problem statements, deliverables, prerequisites, and evaluation criteria — no guessing what to build next.',
              },
              {
                icon: Target,
                title: 'Industry-Grade Challenges',
                description: 'Real-world case studies designed by industry professionals. Build projects that mirror actual production systems, not toy examples.',
              },
              {
                icon: Rocket,
                title: 'Portfolio-Ready Results',
                description: 'Every project is designed to be showcase-worthy. Complete specifications, technical skills mapping, and estimated timelines help you deliver quality.',
              },
            ].map((feature, i) => (
              <div key={i} className="group relative flex flex-col items-start p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 bg-card">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="relative text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="relative text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
            Explore Domains
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Choose Your Domain
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Structured project challenges designed by industry professionals
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading domains...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive">{error}</div>
        ) : domains.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No domains available yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-muted/30 border-y border-border py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Three Steps to Start Building
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              From choosing a project to building something real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a Domain', desc: 'Choose from Web Development, AI, Machine Learning, Data Science, or Cybersecurity.' },
              { step: '02', title: 'Choose a Project', desc: 'Filter by difficulty level and find a project that matches your skills and interests.' },
              { step: '03', title: 'Start Building', desc: 'Follow the structured spec with deliverables, evaluation criteria, and timeline guidance.' },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-6">
                <div className="text-5xl font-bold text-primary/15 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Clean Antintern-Inspired Design */}
      <section className="py-24 px-4 sm:px-8 bg-background">
        <div className="max-w-5xl mx-auto">
          {/* Main CTA Card */}
          <div className="border border-border rounded-2xl p-12 sm:p-16 bg-card shadow-sm">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
                <Rocket className="w-4 h-4" />
                <span>Start Your Journey</span>
              </div>
              
              {/* Heading */}
              <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight font-display">
                Ready to Start Building?
              </h2>
              
              {/* Description */}
              <p className="text-base sm:text-xl text-muted-foreground mb-10 leading-relaxed">
                Each project comes with complete specifications, skill requirements,
                and evaluation criteria to guide your learning journey.
              </p>
              
              {/* CTA Buttons - CONSISTENT STYLING */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button asChild size="lg" className="text-base px-10 py-7 rounded-xl shadow-xs hover:shadow-lg transition-all hover:scale-105">
                  <Link href="/search" className="gap-3">
                    <Zap className="w-5 h-5" />
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-10 py-7 rounded-xl shadow-xs">
                  <Link href="/domains" className="gap-2">
                    Browse Domains
                  </Link>
                </Button>
              </div>
            </div>

            {/* Trust Indicators - Clean Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-border">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Code className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Real Projects</p>
                  <p className="text-xs text-muted-foreground mt-1">Production-ready code</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Layers className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Clear Structure</p>
                  <p className="text-xs text-muted-foreground mt-1">Step-by-step guidance</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Industry Standards</p>
                  <p className="text-xs text-muted-foreground mt-1">Best practices included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}