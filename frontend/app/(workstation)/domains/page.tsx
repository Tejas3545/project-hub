'use client';

import { useEffect, useState } from 'react';
import { domainApi } from '@/lib/api';
import DomainCard from '@/components/DomainCard';

import { Domain } from '@/types';

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Suggest Modal State
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call for now as backend endpoint doesn't exist
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setSuggestion('');
      setTimeout(() => {
        setShowSuccess(false);
        setIsSuggestModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to send suggestion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
      {/* Refined Centered Header Section */}
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="flex items-center gap-2 justify-center">
          <span className="w-6 h-px bg-primary/30"></span>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{totalProjects.toLocaleString()}+ Projects</span>
          <span className="w-6 h-px bg-primary/30"></span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
          Project <span className="text-primary">Domains</span>
        </h1>
        <p className="text-muted-foreground font-medium max-w-2xl text-sm md:text-base leading-relaxed mx-auto">
          Browse projects organized by technical domain. Curated projects designed to build practical skills and professional portfolios.
        </p>
      </div>

      <div className="relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse border border-border shadow-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-red-500/20 bg-red-500/5 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-6 font-thin">error_outline</span>
            <h3 className="text-2xl font-black text-foreground mb-4 uppercase">Failed to Load</h3>
            <p className="text-muted-foreground mb-8 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-secondary hover:bg-muted text-foreground rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-border"
            >
              Try Again
            </button>
          </div>
        ) : domains.length === 0 ? (
          <div className="bg-white rounded-2xl p-24 text-center border border-dashed border-border">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No domains available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {domains.map((domain) => (
              <div key={domain.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <DomainCard domain={domain} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Domain Footer CTA */}
      {!loading && !error && domains.length > 0 && (
        <div className="mt-12 md:mt-16 border-t border-border pt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-3">Looking for something specific?</p>
          <button
            onClick={() => setIsSuggestModalOpen(true)}
            className="text-primary text-[11px] font-bold uppercase tracking-widest hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            Suggest a new domain <span className="material-symbols-outlined text-sm">add_circle</span>
          </button>
        </div>
      )}

      {/* Suggestion Modal */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Suggest New Domain</h3>
              <button
                onClick={() => setIsSuggestModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6">
              {showSuccess ? (
                <div className="flex flex-col items-center py-8 text-center animate-in zoom-in-95">
                  <div className="size-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-100">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-1">Thank you!</h4>
                  <p className="text-sm text-muted-foreground">Your suggestion has been received and will be reviewed by our team.</p>
                </div>
              ) : (
                <form onSubmit={handleSuggest} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="suggestion" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Domain Name / Interest</label>
                    <textarea
                      id="suggestion"
                      autoFocus
                      required
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder="e.g. Mobile Development (iOS/Android), Blockchain, Game Development..."
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-all resize-none min-h-[120px] focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !suggestion.trim()}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-base">send</span>
                    )}
                    {isSubmitting ? 'Sending...' : 'Send Suggestion'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
