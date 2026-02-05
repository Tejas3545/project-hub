import Link from 'next/link';\n\nexport default function AdminPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                    <div className="badge badge-primary mb-4 sm:mb-6 mx-auto">
                        Admin Panel
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-text mb-4 sm:mb-6 px-4">
                        Control Center
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto px-4">
                        Manage domains, projects, and platform content
                    </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div className="glass-card p-6 sm:p-8 glow">
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div className="flex-1 w-full">
                                <h2 className="text-xl sm:text-2xl font-display font-bold mb-2 sm:mb-3 text-text-primary">
                                    Domain Management
                                </h2>
                                <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 sm:mb-6">
                                    Create and manage project domains. Define new technical areas and organize learning modules for students.
                                </p>
                                <button className="btn-primary w-full sm:w-auto">
                                    <span>Manage Domains</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 sm:p-8 glow">
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-warm to-primary flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1 w-full">
                                <h2 className="text-xl sm:text-2xl font-display font-bold mb-2 sm:mb-3 text-text-primary">
                                    Project Management
                                </h2>
                                <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 sm:mb-6">
                                    Create, edit, and publish industry-grade project specifications with complete evaluation criteria and deliverables.
                                </p>
                                <button className="btn-primary w-full sm:w-auto">
                                    <span>Manage Projects</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-4 sm:p-6 border-2 border-accent-warm/20">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-accent-warm mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <strong className="text-text-primary font-semibold text-sm sm:text-base">Development Note</strong>
                                <p className="text-text-secondary text-xs sm:text-sm mt-1 leading-relaxed">
                                    This is a placeholder interface. Production requires authentication, CRUD forms, role-based access control, and API integration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
