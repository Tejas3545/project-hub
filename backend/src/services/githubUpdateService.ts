import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Real-time GitHub Projects Update Service
 * 
 * This service runs periodically to:
 * 1. Check for new GitHub projects in all domains
 * 2. Update existing project stats (stars, etc.)
 * 3. Maintain minimum 100 projects per domain
 */

class GitHubProjectUpdateService {
    private isRunning = false;
    
    /**
     * Run the seed script to fetch and add new projects
     */
    async runProjectUpdate() {
        if (this.isRunning) {
            console.log('⏳ Update already in progress, skipping...');
            return;
        }
        
        try {
            this.isRunning = true;
            
            console.log('\n' + '='.repeat(60));
            console.log('🔄 Starting Scheduled Project Update');
            console.log('⏰ Time:', new Date().toLocaleString());
            console.log('='.repeat(60) + '\n');
            
            // Run the seeding script
            const { stdout, stderr } = await execAsync('npx tsx prisma/seedGitHubProjects.ts', {
                cwd: process.cwd(),
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });
            
            if (stdout) {
                console.log(stdout);
            }
            
            if (stderr) {
                console.error('Stderr:', stderr);
            }
            
            console.log('\n✅ Scheduled update completed successfully\n');
            
        } catch (error: any) {
            console.error('❌ Error during scheduled update:', error.message);
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * Start the cron job for automatic updates
     */
    startScheduler() {
        console.log('🚀 GitHub Project Update Service Started');
        console.log('📋 Service Configuration:');
        console.log('  - Target: 100 projects per domain (500 total)');
        console.log('  - Update Frequency: Every 6 hours');
        console.log('  - Domains: 5 (Web Dev, AI, ML, Data Science, Cybersecurity)');
        console.log('');
        
        // Run every 6 hours: 0 */6 * * *
        // For testing, you can use: */5 * * * * (every 5 minutes)
        cron.schedule('0 */6 * * *', async () => {
            await this.runProjectUpdate();
        });
        
        console.log('⏰ Scheduler configured: Updates every 6 hours');
        console.log('🎯 Next update will run at the top of the hour');
        console.log('');
        
        // Skip initial update on startup to prevent crashes
        // The scheduled updates will run normally every 6 hours
        console.log('⏭️  Skipping initial update (will run on schedule)\n');
    }
    
    /**
     * Manual trigger for updates (can be called via API endpoint)
     */
    async triggerManualUpdate() {
        console.log('🎯 Manual update triggered');
        await this.runProjectUpdate();
    }
}

// Export singleton instance
export const githubUpdateService = new GitHubProjectUpdateService();

// Start the scheduler if this file is run directly
if (require.main === module) {
    githubUpdateService.startScheduler();
    
    // Keep the process running
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down GitHub Project Update Service...');
        process.exit(0);
    });
}
