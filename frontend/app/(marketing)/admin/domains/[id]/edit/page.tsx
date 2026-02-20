'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { domainApi } from '@/lib/api';
import Link from 'next/link';

export default function EditDomainPage() {
    const router = useRouter();
    const params = useParams();
    const domainId = params.id as string;

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDomain, setLoadingDomain] = useState(true);

    useEffect(() => {
        loadDomain();
    }, [domainId]);

    const loadDomain = async () => {
        try {
            const domain = await domainApi.getById(domainId);
            setFormData({
                name: domain.name,
                slug: domain.slug,
                description: domain.description || '',
            });
        } catch (error) {
            setError('Failed to load domain');
        } finally {
            setLoadingDomain(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await domainApi.update(domainId, {
                name: formData.name,
                description: formData.description
            });
            router.push('/admin/domains');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update domain');
        } finally {
            setLoading(false);
        }
    };

    if (loadingDomain) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </div>
        );
    }

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
                        Edit Domain
                    </h1>
                    <p className="text-muted-foreground">
                        Update domain information
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
                            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground font-mono text-sm"
                            disabled
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Slug cannot be changed to prevent breaking URLs
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
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
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
