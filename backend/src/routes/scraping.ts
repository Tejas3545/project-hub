import express from 'express';
import { ScrapingSchedulerService } from '../services/scrapingSchedulerService';
import { RealTimeWebScrapingService } from '../services/realTimeWebScrapingService';
import logger from '../utils/logger';

const router = express.Router();
const schedulerService = new ScrapingSchedulerService();
const scrapingService = new RealTimeWebScrapingService();

// Trigger manual scraping
router.post('/scrape', async (req, res) => {
  try {
    const { source } = req.body;
    logger.info(`🚀 Manual scraping triggered via API for source: ${source || 'all'}`);
    
    const result = await schedulerService.runManualScrape(source);
    const sourceName = 'source' in result ? result.source : (source || 'all sources');
    
    res.json({
      success: true,
      message: `Successfully scraped ${result.saved}/${result.total} projects from ${sourceName}`,
      data: result
    });
  } catch (error) {
    logger.error('❌ Manual scraping failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scrape projects'
    });
  }
});

// Get scraping status
router.get('/status', async (req, res) => {
  try {
    const stats = await scrapingService.getScrapingStats();
    const isRunning = schedulerService.isScrapingInProgress();
    
    res.json({
      success: true,
      message: 'Real-time scraping service is active',
      data: {
        isRunning,
        lastScrape: new Date().toISOString(),
        stats
      }
    });
  } catch (error) {
    logger.error('❌ Failed to get scraping status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scraping status'
    });
  }
});

// Get scraping statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await scrapingService.getScrapingStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('❌ Failed to get scraping stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scraping statistics'
    });
  }
});

// Get available sources
router.get('/sources', (req, res) => {
  res.json({
    success: true,
    data: {
      sources: [
        {
          id: 'github',
          name: 'GitHub',
          description: 'Real open-source repositories with actual stars and activity',
          icon: '🐙',
          updateFrequency: 'Every 2 hours'
        },
        {
          id: 'kaggle',
          name: 'Kaggle Competitions',
          description: 'Live data science competitions with real deadlines',
          icon: '🏆',
          updateFrequency: 'Every 6 hours'
        },
        {
          id: 'hackathon',
          name: 'Hackathon Projects',
          description: 'Winning projects from real hackathons worldwide',
          icon: '🚀',
          updateFrequency: 'Every 6 hours'
        },
        {
          id: 'upwork',
          name: 'Freelance Projects',
          description: 'Real client projects from Upwork and similar platforms',
          icon: '💼',
          updateFrequency: 'Every 6 hours'
        }
      ]
    }
  });
});

export default router;
