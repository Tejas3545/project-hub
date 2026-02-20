'use client';

import { useState } from 'react';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export default function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <div className="absolute right-3 top-3 z-10">
                <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground rounded-md text-sm font-medium transition-all duration-200 border border-border"
                >
                    {copied ? (
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </span>
                    )}
                </button>
            </div>
            <pre className="bg-slate-900 rounded-lg p-6 overflow-x-auto border border-slate-700">
                <code className={`language-${language} text-sm text-gray-100`}>
                    {code}
                </code>
            </pre>
        </div>
    );
}
