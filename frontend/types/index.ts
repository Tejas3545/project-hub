export interface Domain {
    id: string;
    name: string;
    slug: string;
    description?: string;
    projects?: Project[];
    _count?: {
        projects: number;
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
    domainId: string;
    domain?: Domain;
    subDomain?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    minTime: number;
    maxTime: number;
    skillFocus: string[];
    industryContext: string;
    problemStatement: string;
    scope: string;
    prerequisites: string[];
    deliverables: string[];
    advancedExtensions?: string;
    evaluationCriteria?: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Bookmark {
    id: string;
    userId: string;
    projectId: string;
    project: Project;
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
    
    createdAt: Date;
    updatedAt: Date;
    sourceCode?: ProjectSourceCode | null;
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
