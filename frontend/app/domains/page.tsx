'use client';

import { useEffect, useState } from 'react';
import { domainApi } from '@/lib/api';
import DomainCard from '@/components/DomainCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DomainsPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDomains() {
      try {
        const data = await domainApi.getAll();
        setDomains(data);
      } catch (err) {
        console.error('Failed to fetch domains:', err);
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
    <main className="min-h-screen bg-background relative">
      {/* Decorative gradient backgrounds */}
      <div className="fixed top-20 right-10 w-96 h-96 gradient-blue-purple opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-80 h-80 gradient-purple-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <section className="pt-12 pb-8 px-6 sm:px-8 max-w-6xl mx-auto relative">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-accent text-primary text-sm font-medium mb-4 border border-primary/20">
            {totalProjects > 0 ? `${totalProjects.toLocaleString()}+ projects across ${domains.length} domains` : 'All Domains'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient-cyan-blue mb-4 tracking-tight">
            Explore Domains
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a domain to explore industry-grade project challenges designed by professionals.
            Each domain contains real-world projects with downloadable source code.
          </p>
        </div>
      </section>

      {/* Domain Cards Grid */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-20 relative">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-52 bg-blue-accent rounded-xl animate-pulse border border-border/30" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive text-lg">{error}</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No domains found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
