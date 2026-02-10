import * as cron from 'node-cron';
import { RealTimeWebScrapingService } from './realTimeWebScrapingService';
import logger from '../utils/logger';

export class ScrapingSchedulerService {
  private scrapingService: RealTimeWebScrapingService;
  private isRunning = false;

  constructor() {
    this.scrapingService = new RealTimeWebScrapingService();
  }

  start() {
    logger.info('🕐 Starting real-time scraping scheduler service...');

    // Schedule comprehensive scraping every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      if (this.isRunning) {
        logger.warn('⚠️  Scraping already in progress, skipping scheduled run');
        return;
      }

      this.isRunning = true;
      try {
        logger.info('🔄 Running scheduled comprehensive web scraping...');
        const result = await this.scrapingService.scrapeAllSources();
        logger.info(`✅ Scheduled scraping completed: ${result.saved}/${result.total} projects saved`);
      } catch (error) {
        logger.error('❌ Scheduled scraping failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    // Schedule GitHub-only scraping every 2 hours (more frequent for popular repos)
    cron.schedule('0 */2 * * *', async () => {
      if (this.isRunning) {
        logger.warn('⚠️  Scraping already in progress, skipping GitHub run');
        return;
      }

      this.isRunning = true;
      try {
        logger.info('🐙 Running scheduled GitHub scraping...');
        const githubProjects = await this.scrapingService.scrapeGitHubProjects();
        const savedCount = await this.scrapingService.saveProjectsToDatabase(githubProjects);
        logger.info(`✅ GitHub scraping completed: ${savedCount}/${githubProjects.length} projects saved`);
      } catch (error) {
        logger.error('❌ GitHub scraping failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    // Schedule data cleanup and maintenance every day at 3 AM
    cron.schedule('0 3 * * *', async () => {
      try {
        logger.info('🧹 Running daily data maintenance...');
        await this.performDataMaintenance();
        logger.info('✅ Daily maintenance completed');
      } catch (error) {
        logger.error('❌ Daily maintenance failed:', error);
      }
    });

    logger.info('⚡ Scheduler service started with the following schedule:');
    logger.info('  • Comprehensive scraping: Every 6 hours');
    logger.info('  • GitHub scraping: Every 2 hours');
    logger.info('  • Data maintenance: Daily at 3 AM');
  }

  private async performDataMaintenance() {
    // This would include tasks like:
    // - Removing inactive projects
    // - Updating popularity scores
    // - Cleaning up old data
    // - Updating domain statistics
    logger.info('🔧 Performing data maintenance tasks...');
  }

  // Manual trigger for testing
  async runManualScrape(source?: 'all' | 'github' | 'kaggle' | 'hackathon' | 'upwork') {
    if (this.isRunning) {
      throw new Error('Scraping is already in progress');
    }

    this.isRunning = true;
    
    try {
      logger.info(`🚀 Manual scraping triggered for: ${source || 'all sources'}`);
      
      switch (source) {
        case 'github':
          const githubProjects = await this.scrapingService.scrapeGitHubProjects();
          const githubSaved = await this.scrapingService.saveProjectsToDatabase(githubProjects);
          return { source: 'github', total: githubProjects.length, saved: githubSaved };
          
        case 'kaggle':
          const kaggleProjects = await this.scrapingService.scrapeKaggleCompetitions();
          const kaggleSaved = await this.scrapingService.saveProjectsToDatabase(kaggleProjects);
          return { source: 'kaggle', total: kaggleProjects.length, saved: kaggleSaved };
          
        case 'hackathon':
          const hackathonProjects = await this.scrapingService.scrapeHackathonProjects();
          const hackathonSaved = await this.scrapingService.saveProjectsToDatabase(hackathonProjects);
          return { source: 'hackathon', total: hackathonProjects.length, saved: hackathonSaved };
          
        case 'upwork':
          const upworkProjects = await this.scrapingService.scrapeUpworkProjects();
          const upworkSaved = await this.scrapingService.saveProjectsToDatabase(upworkProjects);
          return { source: 'upwork', total: upworkProjects.length, saved: upworkSaved };
          
        default:
          return await this.scrapingService.scrapeAllSources();
      }
    } finally {
      this.isRunning = false;
    }
  }

  async getStats() {
    return await this.scrapingService.getScrapingStats();
  }

  isScrapingInProgress(): boolean {
    return this.isRunning;
  }
}
