'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { domainApi } from '@/lib/api';
import Link from 'next/link';

export default function NewDomainPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await domainApi.create({
                name: formData.name,
                slug: formData.slug,
                description: formData.description || undefined,
            });
            router.push('/admin/domains');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create domain');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/admin/domains"
                        className="text-muted-foreground hover:text-primary transition-colors text-sm mb-4 inline-block"
                    >
                        ← Back to Domains
                    </Link>
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        Create New Domain
                    </h1>
                    <p className="text-muted-foreground">
                        Add a new project domain category
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border shadow-sm p-8 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                            Domain Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., Artificial Intelligence"
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
                            URL Slug *
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                            placeholder="artificial-intelligence"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Auto-generated from name. Used in URLs: /domains/{formData.slug || 'slug'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            placeholder="Brief description of this domain..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Domain'}
                        </button>
                        <Link
                            href="/admin/domains"
                            className="px-6 py-3 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
