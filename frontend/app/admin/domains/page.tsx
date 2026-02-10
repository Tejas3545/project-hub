'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { domainApi } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';

interface Domain {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export default function AdminDomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDomains();
    }, []);

    const loadDomains = async () => {
        try {
            const data = await domainApi.getAll();
            setDomains(data);
        } catch (error) {
            console.error('Failed to load domains:', error);
        } finally {
            setLoading(false);
        }
    };

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; domainId: string | null }>({
        isOpen: false,
        domainId: null,
    });

    const handleDeleteClick = (id: string) => {
        setDeleteModal({ isOpen: true, domainId: id });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.domainId) return;

        try {
            await domainApi.delete(deleteModal.domainId);
            setDomains(domains.filter(d => d.id !== deleteModal.domainId));
        } catch (error) {
            alert('Failed to delete domain');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center">
                    <div className="text-text-secondary">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold gradient-text mb-2">
                        Domain Management
                    </h1>
                    <p className="text-text-secondary">
                        Manage project domains and categories
                    </p>
                </div>
                <Link
                    href="/admin/domains/new"
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                    + New Domain
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((domain) => (
                    <div key={domain.id} className="glass-card p-6 hover:glow transition-all">
                        <h3 className="text-xl font-display font-bold text-text-primary mb-2">
                            {domain.name}
                        </h3>
                        <p className="text-sm text-text-muted mb-1">
                            Slug: {domain.slug}
                        </p>
                        {domain.description && (
                            <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                                {domain.description}
                            </p>
                        )}
                        <div className="flex gap-2 mt-4">
                            <Link
                                href={`/domains/${domain.slug}`}
                                className="text-sm text-primary hover:text-primary-light transition-colors"
                            >
                                View
                            </Link>
                            <span className="text-text-muted">•</span>
                            <Link
                                href={`/admin/domains/${domain.id}/edit`}
                                className="text-sm text-accent-warm hover:text-accent-warm/80 transition-colors"
                            >
                                Edit
                            </Link>
                            <span className="text-text-muted">•</span>
                            <button
                                onClick={() => handleDeleteClick(domain.id)}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {domains.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <p className="text-text-secondary mb-4">No domains found</p>
                    <Link
                        href="/admin/domains/new"
                        className="text-primary hover:text-primary-light font-medium"
                    >
                        Create your first domain
                    </Link>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, domainId: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Domain"
                message="Are you sure you want to delete this domain? This action cannot be undone."
                isDestructive
                confirmText="Delete"
            />
        </div>
    );
}
