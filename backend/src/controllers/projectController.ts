import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const { domainId, difficulty, published, minTime, maxTime, skills, search } = req.query;

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
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await projectService.getProjectById(String(id));

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectsByDomain = async (req: Request, res: Response) => {
    try {
        const { domainId } = req.params;
        const projects = await projectService.getProjectsByDomain(String(domainId));
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const project = await projectService.createProject(req.body);
        res.status(201).json(project);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await projectService.updateProject(String(id), req.body);
        res.json(project);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await projectService.deleteProject(String(id));
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
