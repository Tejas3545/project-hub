'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { projectApi, domainApi } from '@/lib/api';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import Link from 'next/link';

interface Domain {
    id: string;
    name: string;
}

export default function SubmitProjectPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        domainId: '',
        subDomain: '',
        difficulty: 'MEDIUM',
        minTime: 10,
        maxTime: 20,
        caseStudy: '',
        problemStatement: '',
        solutionDescription: '',
        techStack: '',
        prerequisites: '',
        deliverables: '',
        initializationGuide: '',
        screenshots: [] as string[],
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadDomains();
        loadDraft();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Auto-save draft every 30 seconds
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            saveDraft();
        }, 30000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, user]);

    const loadDomains = async () => {
        try {
            const data = await domainApi.getAll();
            setDomains(data);
            if (data.length > 0 && !formData.domainId) {
                setFormData(prev => ({ ...prev, domainId: data[0].id }));
            }
        } catch (error) {
            console.error('Failed to load domains:', error);
        }
    };

    const saveDraft = () => {
        if (formData.title.trim()) {
            setAutoSaveStatus('saving');
            localStorage.setItem('projectDraft', JSON.stringify(formData));
            setTimeout(() => setAutoSaveStatus('saved'), 500);
            setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }
    };

    const loadDraft = () => {
        const draft = localStorage.getItem('projectDraft');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setFormData(parsed);
            } catch (error) {
                console.error('Failed to load draft:', error);
            }
        }
    };

    const clearDraft = () => {
        localStorage.removeItem('projectDraft');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value,
        }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.title.trim()) {
                    setError('Project title is required');
                    return false;
                }
                if (!formData.domainId) {
                    setError('Please select a domain');
                    return false;
                }
                break;
            case 2:
                if (!formData.caseStudy.trim() || formData.caseStudy.trim().length < 50) {
                    setError('Case study must be at least 50 characters');
                    return false;
                }
                if (!formData.problemStatement.trim()) {
                    setError('Problem statement is required');
                    return false;
                }
                if (!formData.solutionDescription.trim() || formData.solutionDescription.trim().length < 50) {
                    setError('Proposed solution must be at least 50 characters');
                    return false;
                }
                break;
            case 3:
                if (!formData.techStack.trim()) {
                    setError('Tech stack is required');
                    return false;
                }
                if (!formData.prerequisites.trim()) {
                    setError('Prerequisites are required');
                    return false;
                }
                break;
        }
        setError('');
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(currentStep)) return;

        setError('');
        setLoading(true);

        try {
            const projectData = {
                ...formData,
                difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
                subDomain: formData.subDomain || undefined,
                techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
                prerequisites: formData.prerequisites.split(',').map(s => s.trim()).filter(Boolean),
                deliverables: formData.deliverables.split(',').map(s => s.trim()).filter(Boolean),
                initializationGuide: formData.initializationGuide || undefined,
                skillFocus: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
                industryContext: formData.caseStudy,
                scope: formData.solutionDescription,
                screenshots: formData.screenshots,
                isPublished: false, // Requires admin approval
            };

            await projectApi.create(projectData);
            setSuccess(true);
            clearDraft();

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit project');
        } finally {
            setLoading(false);
        }
    };

    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    if (success) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="bg-white p-8 max-w-md w-full text-center rounded-xl border border-border shadow-sm">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Project Submitted!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Your project has been submitted for review. You&apos;ll be notified once it&apos;s approved.
                    </p>
                    <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm mb-4 inline-flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Submit Your Project
                </h1>
                <p className="text-base text-muted-foreground">
                    Share your project with the community
                </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-semibold text-foreground">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                        {autoSaveStatus === 'saved' && (
                            <>
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Draft saved
                            </>
                        )}
                        {autoSaveStatus === 'saving' && (
                            <>
                                <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving...
                            </>
                        )}
                    </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-5 border-t border-border pt-4 overflow-x-auto">
                    <span className={`text-sm font-medium whitespace-nowrap px-2 transition-colors ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Basic Info</span>
                    <span className={`text-sm font-medium whitespace-nowrap px-2 transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Problem & Solution</span>
                    <span className={`text-sm font-medium whitespace-nowrap px-2 transition-colors ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>Technical Details</span>
                    <span className={`text-sm font-medium whitespace-nowrap px-2 transition-colors ${currentStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>Media & Submit</span>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-xl p-8 space-y-6 border border-border shadow-sm animate-fade-in-up">
                        <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-4">
                            Basic Information
                        </h2>

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
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
                                placeholder="e.g., AI-Powered Task Manager"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all appearance-none"
                                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
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
                                    Sub-domain
                                </label>
                                <input
                                    type="text"
                                    name="subDomain"
                                    value={formData.subDomain}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
                                    placeholder="e.g., Machine Learning"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all appearance-none"
                                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Min Time (hours) *
                                </label>
                                <input
                                    type="number"
                                    name="minTime"
                                    required
                                    min="1"
                                    aria-label="Min Time (hours)"
                                    value={formData.minTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
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
                                    aria-label="Max Time (hours)"
                                    value={formData.maxTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Problem & Solution */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-xl p-8 space-y-6 border border-border shadow-sm animate-fade-in-up">
                        <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-4">
                            Problem & Solution
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Case Study (The Story)
                            </label>
                            <textarea
                                name="caseStudy"
                                rows={3}
                                value={formData.caseStudy}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 resize-none transition-all"
                                placeholder="3-4 sentences about the scenario and why this project matters..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Problem Statement *
                            </label>
                            <textarea
                                name="problemStatement"
                                rows={4}
                                required
                                value={formData.problemStatement}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 resize-none transition-all"
                                placeholder="What problem does this project solve? Be specific..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Solution Description
                            </label>
                            <textarea
                                name="solutionDescription"
                                rows={4}
                                value={formData.solutionDescription}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 resize-none transition-all"
                                placeholder="High-level explanation of how your project solves the problem..."
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
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
                                placeholder="Working app, API documentation, Test suite"
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Technical Details */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-xl p-8 space-y-6 border border-border shadow-sm animate-fade-in-up">
                        <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-4">
                            Technical Details
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Tech Stack (comma-separated) *
                            </label>
                            <input
                                type="text"
                                name="techStack"
                                required
                                value={formData.techStack}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
                                placeholder="React, Node.js, MongoDB, TypeScript"
                            />
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
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
                                placeholder="JavaScript, Basic React, REST APIs"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Initialization Guide
                            </label>
                            <textarea
                                name="initializationGuide"
                                rows={8}
                                value={formData.initializationGuide}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 resize-none font-mono text-sm transition-all"
                                placeholder="Step-by-step setup instructions with code blocks..."
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                Use ```language for code blocks (e.g., ```bash, ```javascript)
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Media & Submit */}
                {currentStep === 4 && (
                    <div className="bg-white rounded-xl p-8 space-y-6 border border-border shadow-sm animate-fade-in-up">
                        <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-4">
                            Project Screenshots
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Upload Screenshots (up to 5)
                            </label>
                            <CloudinaryUpload
                                maxFiles={5}
                                existingImages={formData.screenshots}
                                onUploadSuccess={(urls: string[]) => setFormData(prev => ({ ...prev, screenshots: urls }))}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                Add screenshots to showcase your project&apos;s UI/UX
                            </p>
                        </div>

                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-bold text-primary mb-1">
                                        Review Process
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your project will be reviewed by our team before publishing.
                                        You&apos;ll receive a notification once it&apos;s approved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="btn-secondary"
                        >
                            Previous
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Project'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
