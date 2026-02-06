'use client';

import Link from 'next/link';
import { domainApi } from '@/lib/api';
import DomainCard from '@/components/DomainCard';
import { Button } from '@/components/ui/neon-button';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchDomains() {
      try {
        const data = await domainApi.getAll();
        setDomains(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch domains:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // Initial fetch
    fetchDomains();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDomains();
    }, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Hero Section with Geometric Shapes */}
      <HeroGeometric
        badge="Industry-Grade Security"
        title1="System Secure."
        title2="Environment Hardened."
      />

      {/* Content below the hero */}
      <div className="relative z-10 -mt-16 sm:-mt-20 flex flex-col items-center justify-center gap-4 sm:gap-6 pb-8 sm:pb-12 lg:pb-20 px-4">
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6 lg:mb-8 text-center">
          Stop consuming endless tutorials. Start building industry-grade projects
          with structured guidance and real-world impact.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
          <Link href="/projects" className="w-full sm:w-auto">
            <Button className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto">Browse All Projects</Button>
          </Link>
        </div>
      </div>

      {/* Domains Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
        {/* Stats/Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-text-muted mb-16 sm:mb-20 lg:mb-24 uppercase tracking-widest font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary-light rounded-full"></div>
            <span>Curated Projects</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border-subtle"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent-warm rounded-full"></div>
            <span>Clear Deliverables</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border-subtle"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary-light rounded-full"></div>
            <span>Industry Standards</span>
          </div>
        </div>

        <section className="fade-in-up">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-text-primary mb-4 sm:mb-6 px-4">
              Choose Your Domain
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto px-4 mb-4">
              Select a domain to explore structured project challenges designed by industry professionals
            </p>
            {/* Live Update Indicator */}
            {lastUpdated && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates • Auto-refreshes every 30s</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center text-white">Loading domains...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20 lg:mb-24">
              {domains.map((domain, index) => (
                <div 
                  key={domain.id} 
                  className="fade-in-up"
                  data-animation-order={index}
                >
                  <DomainCard domain={domain} />
                </div>
              ))}
            </div>
          )}

          {!loading && domains.length === 0 && (
            <div className="text-center text-white/60 py-12">
              No domains available yet. Check back soon!
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="text-center fade-in-up">
          <div className="max-w-4xl mx-auto bg-surface-card rounded-2xl p-8 sm:p-12 lg:p-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-text-primary mb-4 sm:mb-6">
              Ready to Start Building?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary mb-6 sm:mb-8">
              Each project comes with complete specifications, industry context, skill requirements, and evaluation criteria to guide your learning journey.
            </p>
            <Link href="/projects">
              <Button className="h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
