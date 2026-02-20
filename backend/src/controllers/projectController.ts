import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as projectService from '../services/projectService';
import { getCache, setCache, clearCacheByPrefix } from '../utils/cache';

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const { domainId, difficulty, published, minTime, maxTime, skills, search } = req.query;
        
        // Create a unique cache key based on query parameters
        const cacheKey = `projects_${JSON.stringify(req.query)}`;
        const cachedProjects = getCache(cacheKey);
        if (cachedProjects) {
            return res.json(cachedProjects);
        }

        const filters: any = {};
        if (domainId) filters.domainId = domainId as string;
        if (difficulty) filters.difficulty = difficulty as string;
        if (published !== undefined) filters.isPublished = published === 'true';

        // Parse time range
        if (minTime) filters.minTime = parseInt(minTime as string);
        if (maxTime) filters.maxTime = parseInt(maxTime as string);

        // Parse skills (comma-separated)
        if (skills && typeof skills === 'string') {
            filters.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        // Add search term
        if (search && typeof search === 'string') {
            filters.search = search;
        }

        const projects = await projectService.getAllProjects(filters);
        setCache(cacheKey, projects, 300); // Cache for 5 minutes
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cacheKey = `project_${id}`;
        const cachedProject = getCache(cacheKey);
        if (cachedProject) {
            return res.json(cachedProject);
        }

        const project = await projectService.getProjectById(String(id));

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        setCache(cacheKey, project, 600);
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectsByDomain = async (req: Request, res: Response) => {
    try {
        const { domainId } = req.params;
        const cacheKey = `projects_domain_${domainId}`;
        const cachedProjects = getCache(cacheKey);
        if (cachedProjects) {
            return res.json(cachedProjects);
        }

        const projects = await projectService.getProjectsByDomain(String(domainId));
        setCache(cacheKey, projects, 300);
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const data = {
            ...req.body,
            createdById: userId,
            isPublished: isAdmin ? req.body.isPublished : false,
        };

        const project = await projectService.createProject(data);
        clearCacheByPrefix('projects');
        res.status(201).json(project);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await projectService.updateProject(String(id), req.body);
        clearCacheByPrefix('projects');
        clearCacheByPrefix(`project_${id}`);
        res.json(project);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await projectService.deleteProject(String(id));
        clearCacheByPrefix('projects');
        clearCacheByPrefix(`project_${id}`);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
