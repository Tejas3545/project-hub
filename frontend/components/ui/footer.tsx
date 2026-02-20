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
    tagline = "The premier platform for software engineers to bridge the gap between educational content and professional-grade implementation.",
    menuItems = [
        {
            title: "Platform",
            links: [
                { text: "Browse Projects", url: "/projects" },
                { text: "Domains", url: "/domains" },
                { text: "Learning Paths", url: "/learning-paths" },
                { text: "Leaderboard", url: "/leaderboard" },
            ],
        },
        {
            title: "Resources",
            links: [
                { text: "Search", url: "/search" },
                { text: "Workspace", url: "/workspace" },
                { text: "Help Center", url: "/help" },
            ],
        },
        {
            title: "Legal",
            links: [
                { text: "Privacy Policy", url: "/privacy" },
                { text: "Terms of Service", url: "/terms" },
            ],
        },
    ],
    copyright = `© ${new Date().getFullYear()} ProjectHub. All rights reserved.`,
    bottomLinks = [],
}: FooterProps) => {
    return (
        <footer className="bg-secondary border-t border-border py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                <div className="col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">code</span>
                        </div>
                        <h2 className="text-foreground text-lg font-bold">Project Hub</h2>
                    </div>
                    <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">{tagline}</p>
                </div>

                {menuItems.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                        <h4 className="text-foreground font-bold mb-6">{section.title}</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            {section.links.map((link, linkIdx) => (
                                <li key={linkIdx}>
                                    <a href={link.url} className="hover:text-primary transition-colors">{link.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-muted-foreground text-xs">{copyright}</p>
                {bottomLinks.length > 0 && (
                    <div className="flex gap-8 text-xs text-muted-foreground font-medium">
                        {bottomLinks.map((link, linkIdx) => (
                            <a key={linkIdx} href={link.url} className="hover:text-foreground">{link.text}</a>
                        ))}
                    </div>
                )}
            </div>
        </footer>
    );
};

export { Footer };
