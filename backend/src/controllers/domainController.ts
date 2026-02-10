import { Request, Response } from 'express';
import * as domainService from '../services/domainService';

export const getAllDomains = async (req: Request, res: Response) => {
    try {
        const domains = await domainService.getAllDomains();
        // Real-time updates: no caching for domain counts
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.json(domains);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDomainById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const domain = await domainService.getDomainById(String(id));

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        res.json(domain);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDomainBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const domain = await domainService.getDomainBySlug(String(slug));

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        // Real-time updates: no caching for domain data
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.json(domain);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createDomain = async (req: Request, res: Response) => {
    try {
        const domain = await domainService.createDomain(req.body);
        res.status(201).json(domain);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateDomain = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const domain = await domainService.updateDomain(String(id), req.body);
        res.json(domain);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteDomain = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await domainService.deleteDomain(String(id));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
