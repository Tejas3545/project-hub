'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export default function SearchBar({
    placeholder = "Search projects, stacks, or creators...",
    onSearch
}: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (onSearch) {
            onSearch(debouncedQuery);
        } else if (debouncedQuery && !onSearch) {
            router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        }
    }, [debouncedQuery, onSearch, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onSearch && query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined">search</span>
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-xl border border-border bg-white py-3.5 pl-12 pr-12 text-sm text-foreground ring-0 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
            {query ? (
                <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            ) : (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <kbd className="hidden sm:inline-flex items-center rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground bg-secondary">⌘K</kbd>
                </div>
            )}
        </form>
    );
}
