'use client';

import Link from 'next/link';
import GitHubProjectsList from '@/components/GitHubProjectsList';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GitHubProjectsPage() {
  const params = useParams();
  const domainSlug = params.slug as string;
  const [domain, setDomain] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDomain() {
      try {
        console.log('Domain slug from params:', domainSlug);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const url = `${apiUrl}/domains/slug/${domainSlug}`;
        console.log('Fetching domain from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Domain fetch failed:', response.status, errorText);
          console.error('Failed slug was:', domainSlug);
          throw new Error(`Failed to fetch domain: ${response.status}`);
        }
        
        const data = await response.json();
        setDomain(data);
      } catch (error) {
        console.error('Error fetching domain:', error);
        // Set a fallback domain to prevent UI break
        setDomain({ 
          name: domainSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: domainSlug 
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (domainSlug) {
      fetchDomain();
    }
  }, [domainSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-background-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-surface-card border border-border-default rounded-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Domain Not Found</h1>
            <Link
              href="/"
              className="text-primary-light hover:text-primary-DEFAULT transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-primary-light/50 transition-all duration-300 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Domains
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-primary mb-4">
            {domain.name}
          </h1>
          {domain.description && (
            <p className="text-base sm:text-lg text-text-secondary max-w-3xl">
              {domain.description}
            </p>
          )}
        </div>
        <GitHubProjectsList domainSlug={domainSlug} />
      </div>
    </div>
  );
}
