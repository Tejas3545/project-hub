export interface Domain {
    id: string;
    name: string;
    slug: string;
    description?: string;
    projects?: Project[];
    _count?: {
        projects: number;
        githubProjects: number;
    };
    projectCountsByDifficulty?: {
        EASY: number;
        MEDIUM: number;
        HARD: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Project {
    id: string;
    title: string;
    createdById?: string | null;
    domainId: string;
    domain?: Domain;
    subDomain?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    minTime: number;
    maxTime: number;
    skillFocus: string[];

    // Real-World Solution Framework Fields
    caseStudy?: string;  // The Story (3-4 sentences about persona & situation)
    problemStatement: string;  // Core technical/logical gap
    solutionDescription?: string;  // High-level explanation of what project builds
    techStack: string[];  // Recommended technologies
    supposedDeadline?: string;  // Realistic timeframe (e.g., "1-2 Weeks")

    // M2 Enhancement Fields
    screenshots?: string[];  // Cloudinary URLs for project screenshots
    initializationGuide?: string;  // Step-by-step setup guide with code snippets

    // Legacy fields (keeping for backwards compatibility)
    industryContext?: string;
    scope: string;
    prerequisites: string[];
    deliverables: string[];
    requirements: string[];
    requirementsText?: string;
    advancedExtensions?: string;
    evaluationCriteria?: string;

    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Bookmark {
    id: string;
    userId: string;
    projectId?: string | null;
    githubProjectId?: string | null;
    project?: Project | null;
    githubProject?: GitHubProject | null;
    createdAt: Date;
}

export interface ProjectProgress {
    id: string;
    userId: string;
    projectId: string;
    project: Project;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    notes?: string;
    startedAt?: Date;
    completedAt?: Date;
    timeSpent: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface GitHubProjectProgress {
    id: string;
    userId: string;
    githubProjectId: string;
    githubProject: GitHubProject;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    startedAt: Date;
    completedAt?: Date;
    timeSpent: number; // in seconds
    notes?: string;
    checklist: boolean[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TimeSession {
    id: string;
    userId: string;
    projectId: string;
    project?: Project;
    startTime: string | Date;
    endTime?: string | Date;
    duration: number;
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface GitHubProject {
    id: string;
    title: string;
    slug?: string | null;  // URL-friendly identifier
    description: string;
    repoUrl: string;
    repoOwner: string;  // GitHub username/org
    repoName: string;   // Repository name
    defaultBranch: string;  // main, master, etc.
    downloadUrl: string;    // Direct ZIP download URL
    liveUrl?: string | null;
    downloadCount: number;  // Download analytics
    domainId: string;
    domain?: Domain;
    stars: number;
    forks: number;
    language?: string | null;
    techStack: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    topics: string[];
    lastUpdated?: Date | null;
    isActive: boolean;

    // Client Required Fields (Production-Level Documentation)
    author: string;  // Project author
    introduction?: string | null;  // 150-250 word project overview
    implementation?: string | null;  // Technical explanation, workflow, architecture
    technicalSkills: string[];  // Languages, concepts, algorithms, frameworks
    toolsUsed: string[];  // IDEs, platforms, databases, third-party tools
    conceptsUsed: string[];  // Programming concepts applied

    // Real-World Solution Framework Fields (Same as regular Projects)
    caseStudy?: string;  // The Story (3-4 sentences about persona & situation)
    problemStatement?: string;  // Core technical/logical gap
    solutionDescription?: string;  // High-level explanation of what project builds
    prerequisites?: string[];  // Fundamental concepts student must know
    deliverables?: string[];  // Specific items student must submit
    requirements: string[];   // Specific technical requirements
    requirementsText?: string; // Detailed requirements description
    estimatedMinTime: number;
    evaluationCriteria?: string | null;  // Optional evaluation criteria
    optionalExtensions?: string | null;  // Optional bonus challenges
    estimatedMaxTime: number;
    supposedDeadline?: string;  // Realistic timeframe (e.g., "1 Week")
    initializationGuide?: string;  // Step-by-step setup guide

    // Internal QA Workflow
    qaStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REWORK';
    qaFeedback?: string | null;
    reviewedAt?: Date | null;
    reviewedBy?: string | null;

    createdAt: Date;
    updatedAt: Date;
    sourceCode?: ProjectSourceCode | null;
    isRegularProject?: boolean; // Flag for polymorphic items returned by the API
    subDomain?: string; // Unified field for both types
}

export interface ProjectSourceCode {
    id: string;
    githubProjectId: string;
    downloadUrl: string;  // Direct download link
    repositoryUrl?: string | null;  // GitHub repository URL
    fileSize?: number | null;  // File size in bytes
    techStack: string[];  // Technologies used
    hasReadme: boolean;  // Has README.md
    hasRequirements: boolean;  // Has requirements/dependencies file
    createdAt: Date;
    updatedAt: Date;
}

export interface GitHubProjectsResponse {
    projects: GitHubProject[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
