import { Request, Response } from 'express';
import * as domainService from '../services/domainService';
import { getCache, setCache, clearCacheByPrefix } from '../utils/cache';

const DOMAIN_CACHE_KEY = 'all_domains';

export const getAllDomains = async (req: Request, res: Response) => {
    try {
        const cachedDomains = getCache(DOMAIN_CACHE_KEY);
        if (cachedDomains) {
            return res.json(cachedDomains);
        }

        const domains = await domainService.getAllDomains();
        setCache(DOMAIN_CACHE_KEY, domains, 600); // Cache for 10 minutes
        res.json(domains);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDomainById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cacheKey = `domain_${id}`;
        const cachedDomain = getCache(cacheKey);
        if (cachedDomain) {
            return res.json(cachedDomain);
        }

        const domain = await domainService.getDomainById(String(id));

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        setCache(cacheKey, domain, 600);
        res.json(domain);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDomainBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const cacheKey = `domain_slug_${slug}`;
        const cachedDomain = getCache(cacheKey);
        if (cachedDomain) {
            return res.json(cachedDomain);
        }

        const domain = await domainService.getDomainBySlug(String(slug));

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        setCache(cacheKey, domain, 600);
        res.json(domain);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createDomain = async (req: Request, res: Response) => {
    try {
        const domain = await domainService.createDomain(req.body);
        clearCacheByPrefix('domain');
        clearCacheByPrefix(DOMAIN_CACHE_KEY);
        res.status(201).json(domain);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateDomain = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const domain = await domainService.updateDomain(String(id), req.body);
        clearCacheByPrefix('domain');
        clearCacheByPrefix(DOMAIN_CACHE_KEY);
        res.json(domain);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteDomain = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await domainService.deleteDomain(String(id));
        clearCacheByPrefix('domain');
        clearCacheByPrefix(DOMAIN_CACHE_KEY);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
