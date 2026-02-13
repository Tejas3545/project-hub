'use client';

import React, { useState } from 'react';

interface MenuItem {
    title: string;
    links: {
        text: string;
        url: string;
    }[];
}

interface FooterProps {
    tagline?: string;
    menuItems?: MenuItem[];
    copyright?: string;
    bottomLinks?: {
        text: string;
        url: string;
    }[];
}

const Footer = ({
    tagline = "Built for students who build things.",
    menuItems = [
        {
            title: "Platform",
            links: [
                { text: "Browse Projects", url: "/search" },
                { text: "Domains", url: "/" },
            ],
        },
        {
            title: "Resources",
            links: [
                { text: "Projects", url: "/domains" },
                { text: "Help Center", url: "/help" },
            ],
        },
    ],
    copyright = "© 2026 Project Hub. All rights reserved.",
    bottomLinks = [
        { text: "Terms", url: "/terms" },
        { text: "Privacy", url: "/privacy" },
    ],
}: FooterProps) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'invalid' | 'submitting' | 'success'>('idle');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = email.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

        if (!isValid) {
            setStatus('invalid');
            return;
        }

        setStatus('submitting');
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 500);
    };

    const feedbackMessage =
        status === 'success'
            ? 'Thanks! You are on the list.'
            : status === 'invalid'
                ? 'Enter a valid email address.'
                : '';

    return (
        <footer className="w-full bg-background border-t border-border pt-16 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-border">
                    {/* Brand and Description Section */}
                    <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-foreground font-display">Project Hub</span>
                        </div>
                        
                        <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                            {tagline}
                        </p>

                        {/* Newsletter Section */}
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Stay Updated</h4>
                                <div className="h-[2px] w-8 bg-primary/30 rounded-full" />
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:max-w-sm">
                                <input
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        if (status !== 'idle') {
                                            setStatus('idle');
                                        }
                                    }}
                                    className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <button
                                    type="submit"
                                    aria-label="Subscribe to newsletter"
                                    disabled={status === 'submitting' || email.trim().length === 0}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 active:scale-95 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>
                            {feedbackMessage ? (
                                <p aria-live="polite" className="text-xs text-muted-foreground">
                                    {feedbackMessage}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            {menuItems.map((section, sectionIdx) => (
                                <div key={sectionIdx} className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-foreground text-base">{section.title}</h3>
                                        <div className="h-[2px] w-8 bg-primary/30 rounded-full" />
                                    </div>
                                    <ul className="flex flex-col gap-3">
                                        {section.links.map((link, linkIdx) => (
                                            <li key={linkIdx}>
                                                <a
                                                    href={link.url}
                                                    className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200 block"
                                                >
                                                    {link.text}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Follow Us Section */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-foreground text-base">Follow Us</h3>
                                    <div className="h-[2px] w-8 bg-primary/30 rounded-full" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <a href="#" aria-label="Follow us on Facebook" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                                    </a>
                                    <a href="#" aria-label="Follow us on Twitter" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                                    </a>
                                    <a href="#" aria-label="Follow us on GitHub" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                                    </a>
                                    <a href="#" aria-label="Follow us on LinkedIn" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-muted-foreground text-sm">{copyright}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                        {bottomLinks.map((link, linkIdx) => (
                            <React.Fragment key={linkIdx}>
                                {linkIdx > 0 && <span className="text-border">•</span>}
                                <a href={link.url} className="text-muted-foreground hover:text-foreground transition-colors">
                                    {link.text}
                                </a>
                            </React.Fragment>
                        ))}
                        <span className="text-border">•</span>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success-accent text-xs font-medium text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            All Systems Operational
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export { Footer };
