'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectApi, domainApi } from '@/lib/api';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import Link from 'next/link';

interface Domain {
    id: string;
    name: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        domainId: '',
        subDomain: '',
        difficulty: 'MEDIUM',
        minTime: 10,
        maxTime: 20,
        skillFocus: '',
        techStack: '',
        caseStudy: '',
        problemStatement: '',
        requirementsText: '',
        requirements: '',
        scope: '',
        prerequisites: '',
        deliverables: '',
        advancedExtensions: '',
        evaluationCriteria: '',
        isPublished: false,
        screenshots: [] as string[],
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDomains();
    }, []);

    const loadDomains = async () => {
        try {
            const data = await domainApi.getAll();
            setDomains(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, domainId: data[0].id }));
            }
        } catch (error) {
            console.error('Failed to load domains:', error);
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
            // Convert comma-separated strings to arrays
            const projectData = {
                ...formData,
                difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
                subDomain: formData.subDomain || undefined,
                skillFocus: formData.skillFocus.split(',').map((s: string) => s.trim()).filter(Boolean),
                techStack: formData.techStack ? formData.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                requirements: formData.requirements.split(',').map((s: string) => s.trim()).filter(Boolean),
                prerequisites: formData.prerequisites.split(',').map((s: string) => s.trim()).filter(Boolean),
                deliverables: formData.deliverables.split(',').map((s: string) => s.trim()).filter(Boolean),
                advancedExtensions: formData.advancedExtensions || undefined,
                evaluationCriteria: formData.evaluationCriteria || undefined,
                screenshots: formData.screenshots,
            };

            await projectApi.create(projectData);
            router.push('/admin/projects');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

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
                        Create New Project
                    </h1>
                    <p className="text-muted-foreground">
                        Add a new project specification
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
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
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Customer Churn Prediction Engine"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Domain *
                                    </label>
                                    <select
                                        name="domainId"
                                        required
                                        aria-label="Domain"
                                        value={formData.domainId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {domains.map(domain => (
                                            <option key={domain.id} value={domain.id}>
                                                {domain.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Difficulty *
                                    </label>
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
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Min Time (hours) *
                                    </label>
                                    <input
                                        type="number"
                                        name="minTime"
                                        required
                                        min="1"
                                        max="1000"
                                        aria-label="Min Time (hours)"
                                        value={formData.minTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Max Time (hours) *
                                    </label>
                                    <input
                                        type="number"
                                        name="maxTime"
                                        required
                                        min="1"
                                        max="1000"
                                        aria-label="Max Time (hours)"
                                        value={formData.maxTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Skills Focus (comma-separated) *
                                </label>
                                <input
                                    type="text"
                                    name="skillFocus"
                                    required
                                    value={formData.skillFocus}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Python, Machine Learning, Pandas, Scikit-learn"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                        <h2 className="text-xl font-bold text-foreground mb-6">
                            Project Details
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    The Story (Case Study) *
                                </label>
                                <textarea
                                    name="caseStudy"
                                    required
                                    rows={4}
                                    value={formData.caseStudy}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Describe the 3-4 sentence narrative about the persona and situation..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Problem Statement *
                                </label>
                                <textarea
                                    name="problemStatement"
                                    required
                                    rows={4}
                                    value={formData.problemStatement}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Clearly state the problem this project solves..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    What You Need to Build (Scope) *
                                </label>
                                <textarea
                                    name="scope"
                                    required
                                    rows={6}
                                    value={formData.scope}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Define what will be built, key features, high-level architecture..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Detailed Technical Requirements (Optional Text)
                                </label>
                                <textarea
                                    name="requirementsText"
                                    rows={4}
                                    value={formData.requirementsText}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Detailed breakdown of technical requirements..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Technical Requirements (Tags) *
                                </label>
                                <input
                                    type="text"
                                    name="requirements"
                                    required
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="User Auth, Payment Integration, Real-time sync"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Comma-separated list of mandatory features/technical requirements</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Prerequisites (comma-separated) *
                                </label>
                                <input
                                    type="text"
                                    name="prerequisites"
                                    required
                                    value={formData.prerequisites}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Python, Basic ML knowledge, Statistics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Deliverables (comma-separated) *
                                </label>
                                <input
                                    type="text"
                                    name="deliverables"
                                    required
                                    value={formData.deliverables}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Trained model, API endpoint, Documentation, Test suite"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Advanced Extensions (optional)
                                </label>
                                <textarea
                                    name="advancedExtensions"
                                    rows={4}
                                    value={formData.advancedExtensions}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Additional features for advanced learners..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Evaluation Criteria (optional)
                                </label>
                                <textarea
                                    name="evaluationCriteria"
                                    rows={4}
                                    value={formData.evaluationCriteria}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="How the project will be evaluated..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Screenshots */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                        <h2 className="text-xl font-bold text-foreground mb-6">
                            Project Screenshots
                        </h2>
                        <div className="space-y-4">
                            <CloudinaryUpload
                                onUploadSuccess={(urls: string[]) => {
                                    setFormData(prev => ({ ...prev, screenshots: urls }));
                                }}
                                maxFiles={5}
                                existingImages={formData.screenshots}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload up to 5 screenshots to showcase the project. These will be displayed on the project detail page.
                            </p>
                        </div>
                    </div>

                    {/* Publish Settings */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isPublished"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="isPublished" className="text-sm text-foreground cursor-pointer">
                                Publish immediately (make visible to students)
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                        <Link
                            href="/admin/projects"
                            className="px-6 py-3 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
