import { Request, Response } from 'express';
import { githubProjectService } from '../services/githubProjectService';

export const githubProjectController = {
  // Get all GitHub projects by domain slug
  async getByDomain(req: Request, res: Response) {
    try {
      const domainSlug = Array.isArray(req.params.domainSlug) ? req.params.domainSlug[0] : req.params.domainSlug;
      const { 
        page = '1', 
        limit = '20', 
        difficulty, 
        language, 
        search,
        sortBy = 'stars',
        order = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const result = await githubProjectService.getByDomain(
        domainSlug,
        pageNum,
        limitNum,
        {
          difficulty: difficulty as string,
          language: language as string,
          search: search as string,
          sortBy: sortBy as string,
          order: order as 'asc' | 'desc'
        }
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single GitHub project by ID
  async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const project = await githubProjectService.getById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'GitHub project not found' });
      }

      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get statistics for a domain
  async getDomainStats(req: Request, res: Response) {
    try {
      const domainSlug = Array.isArray(req.params.domainSlug) ? req.params.domainSlug[0] : req.params.domainSlug;
      const stats = await githubProjectService.getDomainStats(domainSlug);
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all unique languages
  async getLanguages(req: Request, res: Response) {
    try {
      const languages = await githubProjectService.getUniqueLanguages();
      res.json(languages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Search across all GitHub projects
  async search(req: Request, res: Response) {
    try {
      const { q, page = '1', limit = '20' } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const result = await githubProjectService.searchProjects(
        q as string,
        pageNum,
        limitNum
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Track project download
  async trackDownload(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await githubProjectService.trackDownload(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get download information
  async getDownloadInfo(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const info = await githubProjectService.getDownloadInfo(id);
      res.json(info);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get top downloaded projects
  async getTopDownloaded(req: Request, res: Response) {
    try {
      const { limit = '10' } = req.query;
      const limitNum = parseInt(limit as string);
      const projects = await githubProjectService.getTopDownloaded(limitNum);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
