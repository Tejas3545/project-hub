'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await projectApi.getAll({});
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null; projectTitle: string }>({
        isOpen: false,
        projectId: null,
        projectTitle: '',
    });

    const handleDeleteClick = (id: string, title: string) => {
        setDeleteModal({ isOpen: true, projectId: id, projectTitle: title });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.projectId) return;

        try {
            await projectApi.delete(deleteModal.projectId);
            setProjects(prev => prev.filter(p => p.id !== deleteModal.projectId));
        } catch (error: unknown) {
            alert('Failed to delete project: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const filteredProjects = projects.filter(p => {
        if (filter === 'published') return p.isPublished;
        if (filter === 'draft') return !p.isPublished;
        return true;
    });

    if (loading) {
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        Project Management
                    </h1>
                    <p className="text-muted-foreground">
                        {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                    + New Project
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'published', 'draft'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as 'all' | 'published' | 'draft')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {project.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${project.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600' :
                                        project.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                            'bg-rose-50 text-rose-600'
                                        }`}>
                                        {project.difficulty}
                                    </span>
                                    {!project.isPublished && (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-muted-foreground">
                                            DRAFT
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{project.domain?.name || 'Unknown Domain'}</span>
                                    <span>•</span>
                                    <span>{project.minTime}-{project.maxTime} hours</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/projects/${project.id}/edit`}
                                    className="px-4 py-2 bg-secondary border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/20 transition-colors text-sm font-medium"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDeleteClick(project.id, project.title)}
                                    className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-500 hover:bg-red-100 transition-colors text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="bg-white rounded-xl border border-border shadow-sm p-12 text-center">
                    <p className="text-muted-foreground mb-4">No {filter !== 'all' && filter + ' '}projects found</p>
                    <Link
                        href="/admin/projects/new"
                        className="text-primary hover:text-primary font-medium"
                    >
                        Create your first project
                    </Link>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' })}
                onConfirm={handleConfirmDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${deleteModal.projectTitle}"? This action cannot be undone.`}
                isDestructive
                confirmText="Delete"
            />
        </div>
    );
}
