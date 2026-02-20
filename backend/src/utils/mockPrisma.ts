import { PrismaClient } from '@prisma/client';

// Simple in-memory database for testing
const inMemoryDB = {
  users: [
    {
      id: '1',
      email: 'admin@example.com',
      passwordHash: '$2b$10$example_hash',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  bookmarks: [] as Array<{
    id: string;
    userId: string;
    projectId: string;
    createdAt: Date;
  }>,
  projectProgress: [] as Array<{
    id: string;
    userId: string;
    projectId: string;
    status: string;
    notes?: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }>,
  domains: [
    {
      id: '1',
      name: 'Web Development',
      slug: 'web-development',
      description: 'Full-stack web development projects using modern frameworks',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: []
    },
    {
      id: '2',
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'AI, machine learning, and deep learning projects',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: []
    },
    {
      id: '3',
      name: 'Data Science',
      slug: 'data-science',
      description: 'Data analysis, visualization, and machine learning projects',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: []
    },
    {
      id: '4',
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      description: 'Security analysis, penetration testing, and cybersecurity projects',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: []
    }
  ],
  projects: [
    {
      id: '1',
      domainId: '1',
      title: 'E-commerce Platform',
      slug: 'ecommerce-platform',
      subDomain: 'Full-Stack',
      difficulty: 'MEDIUM',
      minTime: 20,
      maxTime: 40,
      skillFocus: ['React', 'Node.js', 'MongoDB'],
      industryContext: 'Build a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.',
      problemStatement: 'Create a modern e-commerce solution that can handle real-world business needs.',
      scope: 'Complete web application with all essential e-commerce features.',
      prerequisites: ['JavaScript', 'React', 'Node.js', 'Database knowledge'],
      deliverables: ['Source code', 'Documentation', 'Deployment guide'],
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      domainId: '2',
      title: 'Image Classification Model',
      slug: 'image-classification-model',
      subDomain: 'Computer Vision',
      difficulty: 'HARD',
      minTime: 30,
      maxTime: 60,
      skillFocus: ['Python', 'TensorFlow', 'Computer Vision'],
      industryContext: 'Build an AI-powered image classification system for real-world applications.',
      problemStatement: 'Create a deep learning model that can classify images with high accuracy.',
      scope: 'Complete ML pipeline from data preprocessing to model deployment.',
      prerequisites: ['Python', 'Machine Learning basics', 'Deep learning'],
      deliverables: ['Trained model', 'Jupyter notebooks', 'Web interface'],
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  githubProjects: [
    {
      id: '1',
      title: 'React Admin Dashboard',
      description: 'A modern admin dashboard built with React and Material-UI',
      repoUrl: 'https://github.com/mui/material-ui',
      liveUrl: 'https://mui.com/',
      domainId: '1',
      stars: 92000,
      forks: 29000,
      language: 'TypeScript',
      techStack: ['React', 'TypeScript', 'Material-UI', 'Emotion'],
      difficulty: 'MEDIUM',
      topics: ['react', 'dashboard', 'admin', 'material-ui'],
      lastUpdated: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'TensorFlow Examples',
      description: 'TensorFlow tutorials and examples for learning and reference',
      repoUrl: 'https://github.com/tensorflow/examples',
      liveUrl: 'https://tensorflow.org/examples',
      domainId: '2',
      stars: 78000,
      forks: 31000,
      language: 'Python',
      techStack: ['Python', 'TensorFlow', 'Jupyter', 'Machine Learning'],
      difficulty: 'HARD',
      topics: ['tensorflow', 'machine-learning', 'deep-learning', 'examples'],
      lastUpdated: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

// Link projects to domains
(inMemoryDB.domains[0] as any).projects = [inMemoryDB.projects[0]]; // Web Development
(inMemoryDB.domains[1] as any).projects = [inMemoryDB.projects[1]]; // AI

// Mock Prisma Client for testing
export const mockPrismaClient = {
  user: {
    findMany: async () => inMemoryDB.users,
    findUnique: async ({ where }: any) => {
      if (where.email) {
        return inMemoryDB.users.find(u => u.email === where.email);
      }
      if (where.id) {
        return inMemoryDB.users.find(u => u.id === where.id);
      }
      return null;
    },
    findFirst: async ({ where }: any) => {
      if (where.email) {
        return inMemoryDB.users.find(u => u.email === where.email);
      }
      return null;
    },
    create: async ({ data }: any) => {
      const newUser = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDB.users.push(newUser);
      return newUser;
    },
    update: async ({ where, data }: any) => {
      const index = inMemoryDB.users.findIndex(u => u.id === where.id);
      if (index !== -1) {
        inMemoryDB.users[index] = { ...inMemoryDB.users[index], ...data, updatedAt: new Date() };
        return inMemoryDB.users[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = inMemoryDB.users.findIndex(u => u.id === where.id);
      if (index !== -1) {
        const deleted = inMemoryDB.users[index];
        inMemoryDB.users.splice(index, 1);
        return deleted;
      }
      return null;
    },
    count: async () => inMemoryDB.users.length
  },
  bookmark: {
    findMany: async () => inMemoryDB.bookmarks,
    findUnique: async ({ where }: any) => {
      return inMemoryDB.bookmarks.find(b => b.userId === where.userId && b.projectId === where.projectId);
    },
    findFirst: async ({ where }: any) => {
      return inMemoryDB.bookmarks.find(b => b.userId === where.userId && b.projectId === where.projectId);
    },
    create: async ({ data }: any) => {
      const newBookmark = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date()
      };
      inMemoryDB.bookmarks.push(newBookmark);
      return newBookmark;
    },
    delete: async ({ where }: any) => {
      const index = inMemoryDB.bookmarks.findIndex(b => b.userId === where.userId && b.projectId === where.projectId);
      if (index !== -1) {
        const deleted = inMemoryDB.bookmarks[index];
        inMemoryDB.bookmarks.splice(index, 1);
        return deleted;
      }
      return null;
    },
    count: async () => inMemoryDB.bookmarks.length
  },
  projectProgress: {
    findMany: async ({ where }: any) => {
      if (where?.userId) {
        return inMemoryDB.projectProgress.filter(p => p.userId === where.userId);
      }
      return inMemoryDB.projectProgress;
    },
    findUnique: async ({ where }: any) => {
      return inMemoryDB.projectProgress.find(p => p.userId === where.userId && p.projectId === where.projectId);
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = inMemoryDB.projectProgress.findIndex(p => p.userId === where.userId && p.projectId === where.projectId);
      if (existing !== -1) {
        inMemoryDB.projectProgress[existing] = { ...inMemoryDB.projectProgress[existing], ...update, updatedAt: new Date() };
        return inMemoryDB.projectProgress[existing];
      } else {
        const newProgress = {
          id: Date.now().toString(),
          ...create,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryDB.projectProgress.push(newProgress);
        return newProgress;
      }
    },
    create: async ({ data }: any) => {
      const newProgress = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDB.projectProgress.push(newProgress);
      return newProgress;
    },
    update: async ({ where, data }: any) => {
      const index = inMemoryDB.projectProgress.findIndex(p => p.userId === where.userId && p.projectId === where.projectId);
      if (index !== -1) {
        inMemoryDB.projectProgress[index] = { ...inMemoryDB.projectProgress[index], ...data, updatedAt: new Date() };
        return inMemoryDB.projectProgress[index];
      }
      return null;
    },
    count: async () => inMemoryDB.projectProgress.length
  },
  domain: {
    findMany: async ({ include }: any = {}) => {
      if (include?.projects) {
        return inMemoryDB.domains;
      }
      return inMemoryDB.domains.map(d => ({ ...d, projects: undefined }));
    },
    findUnique: async ({ where }: any) => {
      if (where.slug) {
        return inMemoryDB.domains.find(d => d.slug === where.slug);
      }
      if (where.id) {
        return inMemoryDB.domains.find(d => d.id === where.id);
      }
      return null;
    },
    findFirst: async ({ where }: any) => {
      if (where.slug) {
        return inMemoryDB.domains.find(d => d.slug === where.slug);
      }
      return null;
    },
    create: async ({ data }: any) => {
      const newDomain = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      };
      inMemoryDB.domains.push(newDomain);
      return newDomain;
    },
    update: async ({ where, data }: any) => {
      const index = inMemoryDB.domains.findIndex(d => d.id === where.id);
      if (index !== -1) {
        inMemoryDB.domains[index] = { ...inMemoryDB.domains[index], ...data, updatedAt: new Date() };
        return inMemoryDB.domains[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = inMemoryDB.domains.findIndex(d => d.id === where.id);
      if (index !== -1) {
        const deleted = inMemoryDB.domains[index];
        inMemoryDB.domains.splice(index, 1);
        return deleted;
      }
      return null;
    },
    count: async () => inMemoryDB.domains.length
  },
  project: {
    findMany: async ({ where, include }: any = {}) => {
      let projects = inMemoryDB.projects;
      if (where?.domainId) {
        projects = projects.filter(p => p.domainId === where.domainId);
      }
      if (where?.isPublished !== undefined) {
        projects = projects.filter(p => p.isPublished === where.isPublished);
      }
      return projects;
    },
    findUnique: async ({ where }: any) => {
      return inMemoryDB.projects.find(p => p.id === where.id);
    },
    findFirst: async ({ where }: any) => {
      if (where.domainId) {
        return inMemoryDB.projects.find(p => p.domainId === where.domainId);
      }
      return inMemoryDB.projects[0];
    },
    create: async ({ data }: any) => {
      const newProject = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDB.projects.push(newProject);
      return newProject;
    },
    update: async ({ where, data }: any) => {
      const index = inMemoryDB.projects.findIndex(p => p.id === where.id);
      if (index !== -1) {
        inMemoryDB.projects[index] = { ...inMemoryDB.projects[index], ...data, updatedAt: new Date() };
        return inMemoryDB.projects[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = inMemoryDB.projects.findIndex(p => p.id === where.id);
      if (index !== -1) {
        const deleted = inMemoryDB.projects[index];
        inMemoryDB.projects.splice(index, 1);
        return deleted;
      }
      return null;
    },
    count: async (_args: any = {}) => inMemoryDB.projects.length
  },
  gitHubProject: {
    findMany: async ({ where, take, distinct }: any = {}) => {
      let projects = inMemoryDB.githubProjects;
      if (where?.domainId) {
        projects = projects.filter(p => p.domainId === where.domainId);
      }
      if (where?.isActive !== undefined) {
        projects = projects.filter(p => p.isActive === where.isActive);
      }
      if (take) {
        projects = projects.slice(0, take);
      }
      return projects;
    },
    findUnique: async ({ where }: any) => {
      return inMemoryDB.githubProjects.find(p => p.id === where.id);
    },
    findFirst: async ({ where }: any) => {
      if (where.repoUrl) {
        return inMemoryDB.githubProjects.find(p => p.repoUrl === where.repoUrl);
      }
      if (where.domainId) {
        return inMemoryDB.githubProjects.find(p => p.domainId === where.domainId);
      }
      return inMemoryDB.githubProjects[0];
    },
    create: async ({ data }: any) => {
      const newProject = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDB.githubProjects.push(newProject);
      return newProject;
    },
    update: async ({ where, data }: any) => {
      const index = inMemoryDB.githubProjects.findIndex(p => p.id === where.id);
      if (index !== -1) {
        inMemoryDB.githubProjects[index] = { ...inMemoryDB.githubProjects[index], ...data, updatedAt: new Date() };
        return inMemoryDB.githubProjects[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = inMemoryDB.githubProjects.findIndex(p => p.id === where.id);
      if (index !== -1) {
        const deleted = inMemoryDB.githubProjects[index];
        inMemoryDB.githubProjects.splice(index, 1);
        return deleted;
      }
      return null;
    },
    count: async ({ where }: any = {}) => {
      let projects = inMemoryDB.githubProjects;
      if (where?.domainId) {
        projects = projects.filter(p => p.domainId === where.domainId);
      }
      if (where?.isActive !== undefined) {
        projects = projects.filter(p => p.isActive === where.isActive);
      }
      return projects.length;
    }
  },
  $connect: async () => {},
  $disconnect: async () => {}
};

// Use mock client if database is not available
export const prisma = process.env.USE_MOCK_DB === 'true' ? mockPrismaClient : new PrismaClient();

export default prisma;
