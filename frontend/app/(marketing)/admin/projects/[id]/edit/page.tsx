'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { projectApi, domainApi } from '@/lib/api';
import Link from 'next/link';

interface Domain {
    id: string;
    name: string;
}

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [domains, setDomains] = useState<Domain[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        domainId: '',
        subDomain: '',
        difficulty: 'MEDIUM',
        minTime: 10,
        maxTime: 20,
        skillFocus: '',
        industryContext: '',
        problemStatement: '',
        scope: '',
        prerequisites: '',
        deliverables: '',
        advancedExtensions: '',
        evaluationCriteria: '',
        isPublished: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProject, setLoadingProject] = useState(true);

    useEffect(() => {
        loadDomains();
        loadProject();
    }, [projectId]);

    const loadDomains = async () => {
        try {
            const data = await domainApi.getAll();
            setDomains(data);
        } catch (error) {
            console.error('Failed to load domains:', error);
        }
    };

    const loadProject = async () => {
        try {
            const project = await projectApi.getById(projectId);
            setFormData({
                title: project.title,
                domainId: project.domainId,
                subDomain: project.subDomain || '',
                difficulty: project.difficulty,
                minTime: project.minTime,
                maxTime: project.maxTime,
                skillFocus: project.skillFocus.join(', '),
                industryContext: project.industryContext,
                problemStatement: project.problemStatement,
                scope: project.scope,
                prerequisites: project.prerequisites.join(', '),
                deliverables: project.deliverables.join(', '),
                advancedExtensions: project.advancedExtensions || '',
                evaluationCriteria: project.evaluationCriteria || '',
                isPublished: project.isPublished,
            });
        } catch (error) {
            setError('Failed to load project');
        } finally {
            setLoadingProject(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const projectData = {
                ...formData,
                difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
                subDomain: formData.subDomain || undefined,
                skillFocus: formData.skillFocus.split(',').map(s => s.trim()).filter(Boolean),
                prerequisites: formData.prerequisites.split(',').map(s => s.trim()).filter(Boolean),
                deliverables: formData.deliverables.split(',').map(s => s.trim()).filter(Boolean),
                advancedExtensions: formData.advancedExtensions || undefined,
                evaluationCriteria: formData.evaluationCriteria || undefined,
            };

            await projectApi.update(projectId, projectData);
            router.push('/admin/projects');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProject) {
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
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/admin/projects"
                        className="text-muted-foreground hover:text-primary transition-colors text-sm mb-4 inline-block"
                    >
                        ← Back to Projects
                    </Link>
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        Edit Project
                    </h1>
                    <p className="text-muted-foreground">
                        Update project specification
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information - Same as create form */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                        <h2 className="text-xl font-bold text-foreground mb-6">
                            Basic Information
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    aria-label="Project Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Domain *</label>
                                    <select
                                        name="domainId"
                                        required
                                        aria-label="Domain"
                                        value={formData.domainId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {domains.map(domain => (
                                            <option key={domain.id} value={domain.id}>{domain.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Difficulty *</label>
                                    <select
                                        name="difficulty"
                                        required
                                        aria-label="Difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Sub-domain (optional)
                                </label>
                                <input
                                    type="text"
                                    name="subDomain"
                                    value={formData.subDomain}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Natural Language Processing, Frontend Development, Network Security"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Specify a sub-domain within the selected domain (e.g., NLP for AI, React for Web Dev)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Min Time (hours) *</label>
                                    <input type="number" name="minTime" required min="1" aria-label="Min Time (hours)" value={formData.minTime} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Max Time (hours) *</label>
                                    <input type="number" name="maxTime" required min="1" aria-label="Max Time (hours)" value={formData.maxTime} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Skills Focus (comma-separated) *</label>
                                <input type="text" name="skillFocus" required aria-label="Skills Focus" value={formData.skillFocus} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Project Details - Same structure as create */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                        <h2 className="text-xl font-bold text-foreground mb-6">Project Details</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Industry Context *</label>
                                <textarea name="industryContext" required rows={4} aria-label="Industry Context" value={formData.industryContext} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Problem Statement *</label>
                                <textarea name="problemStatement" required rows={4} aria-label="Problem Statement" value={formData.problemStatement} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Scope *</label>
                                <textarea name="scope" required rows={6} aria-label="Scope" value={formData.scope} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Prerequisites (comma-separated) *</label>
                                <input type="text" name="prerequisites" required aria-label="Prerequisites" value={formData.prerequisites} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Deliverables (comma-separated) *</label>
                                <input type="text" name="deliverables" required aria-label="Deliverables" value={formData.deliverables} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Advanced Extensions</label>
                                <textarea name="advancedExtensions" rows={4} aria-label="Advanced Extensions" value={formData.advancedExtensions} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Evaluation Criteria</label>
                                <textarea name="evaluationCriteria" rows={4} aria-label="Evaluation Criteria" value={formData.evaluationCriteria} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isPublished" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                <label htmlFor="isPublished" className="text-sm text-foreground cursor-pointer">Published</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" disabled={loading} className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link href="/admin/projects" className="px-6 py-3 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-center">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
