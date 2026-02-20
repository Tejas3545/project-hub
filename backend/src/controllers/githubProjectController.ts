import { Request, Response } from 'express';
import { githubProjectService } from '../services/githubProjectService';
import { generateProfessionalDocumentation } from '../utils/documentationGenerator';
import { getCache, setCache, clearCacheByPrefix } from '../utils/cache';

export const githubProjectController = {
  // Lightweight paginated listing for the Explore page
  async getAllListing(req: any, res: any) {
    try {
      const {
        page = '1',
        limit = '24',
        difficulty,
        domainId,
        search,
        sortBy = 'stars',
        order = 'desc',
      } = req.query;

      const cacheKey = `github_listing_${JSON.stringify(req.query)}`;
      const cachedResult = getCache(cacheKey);
      if (cachedResult) {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
        return res.json(cachedResult);
      }

      const result = await githubProjectService.getAllListing(
        parseInt(page as string),
        Math.min(parseInt(limit as string), 50), // cap at 50
        {
          difficulty: difficulty as string,
          domainId: domainId as string,
          search: search as string,
          sortBy: sortBy as string,
          order: order as 'asc' | 'desc',
        }
      );

      setCache(cacheKey, result, 300); // Cache for 5 minutes
      res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all GitHub projects by domain slug
  async getByDomain(req: any, res: any) {
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

      const cacheKey = `github_domain_${domainSlug}_${JSON.stringify(req.query)}`;
      const cached = getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
        return res.json(cached);
      }

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

      setCache(cacheKey, result, 300);
      // Short cache for project listings (30 seconds) for near real-time updates
      res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single GitHub project by ID
  async getById(req: any, res: any) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const cacheKey = `github_project_${id}`;
      const cached = getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=600, s-maxage=1200, stale-while-revalidate=86400');
        return res.json(cached);
      }

      const project = await githubProjectService.getById(id);

      if (!project) {
        return res.status(404).json({ error: 'GitHub project not found' });
      }

      setCache(cacheKey, project, 1200); // 20 minutes
      // Add aggressive caching for individual projects
      res.set('Cache-Control', 'public, max-age=600, s-maxage=1200, stale-while-revalidate=86400');
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get statistics for a domain
  async getDomainStats(req: any, res: any) {
    try {
      const domainSlug = Array.isArray(req.params.domainSlug) ? req.params.domainSlug[0] : req.params.domainSlug;
      const cacheKey = `domain_stats_${domainSlug}`;
      const cached = getCache(cacheKey);
      if (cached) return res.json(cached);

      const stats = await githubProjectService.getDomainStats(domainSlug);

      setCache(cacheKey, stats, 1800); // 30 minutes
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all unique languages
  async getLanguages(req: any, res: any) {
    try {
      const languages = await githubProjectService.getUniqueLanguages();
      res.json(languages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Search across all GitHub projects
  async search(req: any, res: any) {
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
  async trackDownload(req: any, res: any) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await githubProjectService.trackDownload(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get download information
  async getDownloadInfo(req: any, res: any) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const info = await githubProjectService.getDownloadInfo(id);
      res.json(info);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get top downloaded projects
  async getTopDownloaded(req: any, res: any) {
    try {
      const { limit = '10' } = req.query;
      const limitNum = parseInt(limit as string);
      const projects = await githubProjectService.getTopDownloaded(limitNum);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update QA review status
  async updateReview(req: any, res: any) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { qaStatus, qaFeedback, reviewedBy } = req.body;
      const result = await githubProjectService.updateGaStatus(id, qaStatus, qaFeedback, reviewedBy);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export professional documentation for a project
  async getDocumentation(req: any, res: any) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const project = await githubProjectService.getById(id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const doc = generateProfessionalDocumentation(project);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="documentation.md"`);
      res.send(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
