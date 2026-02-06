/**
 * Advanced GitHub Project Scraper
 * 
 * Filters out libraries and gets only real, working projects with:
 * - Live demos or deployable applications
 * - Proper documentation
 * - Active maintenance
 * - Clear project structure (not just a library/package)
 * 
 * Target: 200+ quality projects across multiple domains
 */

import { PrismaClient, Difficulty } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// GitHub API Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_API = 'https://api.github.com';

const headers = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ProjectHub-Scraper'
};

// Quality filters for real projects (not libraries)
const PROJECT_QUALITY_CRITERIA = {
  // Exclude typical library keywords and popular library names
  excludeKeywords: [
    'library', 'package', 'npm', 'pip', 'gem', 'cargo', 'nuget',
    'framework-only', 'plugin-only', 'component-only', 'utility-only',
    'sdk', 'api-client', 'wrapper-only', 'binding', 'interface-only',
    // Popular Python libraries
    'tensorflow', 'pytorch', 'numpy', 'pandas', 'scikit-learn', 'matplotlib',
    'keras', 'scipy', 'opencv', 'seaborn', 'pillow', 'requests', 'beautifulsoup',
    'flask-library', 'django-library', 'fastapi-library',
    // Popular JS libraries
    'react-library', 'vue-library', 'angular-library', 'lodash', 'moment.js',
    'axios-library', 'd3-library', 'three.js-library', 'jquery',
    // Popular Java libraries
    'spring-framework', 'hibernate', 'jackson', 'gson', 'guava',
    // Other libraries
    'bootstrap', 'tailwind-library', 'font-awesome', 'icons-only',
    // Awesome lists and resources
    'awesome-', 'resources', 'tutorial-only', 'course-only', 'learning-only',
    'cheatsheet', 'handbook', 'guide-only', 'documentation-only', 'notes-only'
  ],
  
  // Must have these indicators (at least one)
  projectIndicators: [
    'application', 'app', 'platform', 'system', 'tool', 
    'project', 'demo', 'website', 'web-app', 'dashboard',
    'portal', 'manager', 'service', 'server', 'client',
    'game', 'bot', 'scraper', 'crawler', 'monitor',
    'builder', 'creator', 'generator', 'analyzer', 'viewer',
    'editor', 'tracker', 'notifier', 'scheduler', 'deployer'
  ],
  
  // Minimum quality thresholds (lowered to find more projects)
  minStars: 30,
  minForks: 5,
  
  // File indicators for real projects
  requiredFiles: [
    'README.md', 'readme.md', 'README', 'Readme.md'
  ],
  
  // Indicators of deployable applications
  deploymentIndicators: [
    'Dockerfile', 'docker-compose.yml', 'package.json',
    'requirements.txt', 'pom.xml', 'build.gradle',
    'Cargo.toml', 'go.mod', '.env.example'
  ]
};

// Domain-specific search queries for real projects
// Target: 50+ projects per domain = 250+ total across 5 domains
const DOMAIN_QUERIES = [
  // 1. Web Development (Target: 50+ projects)
  {
    domain: 'web-development',
    queries: [
      'full-stack application stars:>30',
      'MERN stack project stars:>30',
      'web application React Vue stars:>50',
      'e-commerce platform application stars:>50',
      'social media application stars:>50',
      'blog CMS platform stars:>30',
      'dashboard admin panel stars:>50',
      'project management application stars:>30',
      'real-time chat application stars:>30',
      'video streaming platform stars:>50',
      'portfolio website builder stars:>30',
      'task manager application stars:>30',
      'note taking app stars:>30',
      'calendar application stars:>30',
      'booking system application stars:>30',
      'food delivery application stars:>30',
      'music player application stars:>30',
      'photo gallery application stars:>30',
      'forum application stars:>30',
      'messaging application stars:>30'
    ]
  },
  
  // 2. Artificial Intelligence (Target: 50+ projects)
  {
    domain: 'artificial-intelligence',
    queries: [
      'artificial intelligence application stars:>50',
      'AI chatbot application stars:>50',
      'natural language processing NLP application stars:>50',
      'computer vision application stars:>50',
      'speech recognition application stars:>50',
      'AI assistant platform stars:>50',
      'AI agent application stars:>30',
      'conversational AI application stars:>30',
      'AI-powered tool stars:>50',
      'generative AI application stars:>50',
      'text generation application stars:>30',
      'image generation application stars:>50',
      'voice assistant application stars:>30',
      'AI content creator stars:>30',
      'language translation application stars:>30',
      'sentiment analysis application stars:>30',
      'AI recommendation system stars:>30',
      'face recognition application stars:>30',
      'object detection application stars:>30',
      'AI automation tool stars:>30'
    ]
  },
  
  // 3. Machine Learning (Target: 50+ projects)
  {
    domain: 'machine-learning',
    queries: [
      'machine learning application stars:>50',
      'ML model deployment platform stars:>50',
      'recommendation system application stars:>50',
      'predictive analytics application stars:>50',
      'image classification application stars:>30',
      'anomaly detection system stars:>30',
      'time series forecasting application stars:>30',
      'ML pipeline application stars:>30',
      'AutoML platform stars:>50',
      'deep learning application stars:>50',
      'neural network application stars:>30',
      'model training platform stars:>30',
      'ML monitoring tool stars:>30',
      'feature engineering tool stars:>30',
      'model serving application stars:>30',
      'ML experiment tracker stars:>30',
      'data labeling tool stars:>30',
      'model optimization tool stars:>30',
      'ML workflow orchestrator stars:>30',
      'prediction API application stars:>30'
    ]
  },
  
  // 4. Data Science (Target: 50+ projects)
  {
    domain: 'data-science',
    queries: [
      'data science application stars:>50',
      'data visualization dashboard stars:>50',
      'data analysis platform stars:>50',
      'data pipeline application stars:>30',
      'ETL tool application stars:>30',
      'business intelligence dashboard stars:>50',
      'analytics platform stars:>50',
      'data exploration tool stars:>30',
      'statistical analysis application stars:>30',
      'big data application stars:>50',
      'data processing platform stars:>30',
      'data warehouse application stars:>30',
      'reporting dashboard stars:>30',
      'data quality tool stars:>30',
      'data catalog application stars:>30',
      'metrics dashboard stars:>30',
      'KPI tracker application stars:>30',
      'data monitoring tool stars:>30',
      'chart builder application stars:>30',
      'data transformation tool stars:>30'
    ]
  },
  
  // 5. Cybersecurity (Target: 50+ projects)
  {
    domain: 'cybersecurity',
    queries: [
      'cybersecurity tool application stars:>50',
      'security scanner application stars:>50',
      'vulnerability assessment tool stars:>50',
      'penetration testing application stars:>50',
      'network security tool stars:>30',
      'threat detection platform stars:>50',
      'security monitoring system stars:>30',
      'malware analysis tool stars:>30',
      'encryption tool application stars:>30',
      'security automation platform stars:>30',
      'firewall application stars:>30',
      'intrusion detection system stars:>30',
      'security audit tool stars:>30',
      'password manager application stars:>50',
      'authentication system stars:>30',
      'access control application stars:>30',
      'security compliance tool stars:>30',
      'threat intelligence platform stars:>30',
      'incident response tool stars:>30',
      'security testing application stars:>30'
    ]
  }
];

/**
 * Check if repository is a real project (not just a library)
 */
async function isRealProject(repo: any): Promise<boolean> {
  try {
    const repoName = repo.name.toLowerCase();
    const description = (repo.description || '').toLowerCase();
    const fullText = `${repoName} ${description}`;
    
    // STRICT: Check if it's a well-known library by exact name match
    const libraryNames = [
      'tensorflow', 'pytorch', 'numpy', 'pandas', 'scikit-learn', 'matplotlib',
      'keras', 'scipy', 'opencv', 'seaborn', 'flask', 'django', 'fastapi',
      'react', 'vue', 'angular', 'express', 'next.js', 'nuxt', 
      'spring', 'hibernate', 'bootstrap', 'tailwindcss', 'jquery',
      'lodash', 'moment', 'axios', 'd3', 'three.js'
    ];
    
    if (libraryNames.includes(repoName)) {
      console.log(`   ⚠️  Excluded: ${repo.name} (known library)`);
      return false;
    }
    
    // Exclude if contains library keywords
    const hasExcludedKeyword = PROJECT_QUALITY_CRITERIA.excludeKeywords.some(
      keyword => fullText.includes(keyword.toLowerCase())
    );
    if (hasExcludedKeyword) {
      console.log(`   ⚠️  Excluded: ${repo.name} (library keyword detected)`);
      return false;
    }
    
    // Exclude if description mentions it's a library/framework/package
    const libraryDescriptionPatterns = [
      'python library', 'javascript library', 'js library', 'npm package',
      'pip package', 'framework for', 'library for', 'package for',
      'collection of', 'set of utilities', 'utility library', 'helper library',
      'api wrapper', 'wrapper for', 'binding for', 'interface for'
    ];
    
    if (libraryDescriptionPatterns.some(pattern => description.includes(pattern))) {
      console.log(`   ⚠️  Excluded: ${repo.name} (library description)`);
      return false;
    }
    
    // Must have project indicators
    const hasProjectIndicator = PROJECT_QUALITY_CRITERIA.projectIndicators.some(
      indicator => fullText.includes(indicator.toLowerCase())
    );
    if (!hasProjectIndicator) {
      // Check topics if no clear indicator in name/description
      const topics = repo.topics || [];
      const hasProjectTopic = topics.some((topic: string) => 
        PROJECT_QUALITY_CRITERIA.projectIndicators.some(
          indicator => topic.includes(indicator.toLowerCase())
        )
      );
      if (!hasProjectTopic) {
        console.log(`   ⚠️  Excluded: ${repo.name} (no project indicator)`);
        return false;
      }
    }
    
    // Check for deployment indicators
    try {
      const contentsResponse = await axios.get(
        `${GITHUB_API}/repos/${repo.owner.login}/${repo.name}/contents`,
        { headers, timeout: 5000 }
      );
      
      const files = contentsResponse.data.map((f: any) => f.name.toLowerCase());
      const hasDeploymentFile = PROJECT_QUALITY_CRITERIA.deploymentIndicators.some(
        file => files.includes(file.toLowerCase())
      );
      
      if (!hasDeploymentFile) {
        console.log(`   ⚠️  Excluded: ${repo.name} (no deployment indicators)`);
        return false;
      }
    } catch (error) {
      // If we can't check files, be lenient if other criteria passed
      console.log(`   ⚠️  Warning: Could not check files for ${repo.name}`);
    }
    
    // Check quality metrics
    if (repo.stargazers_count < PROJECT_QUALITY_CRITERIA.minStars) {
      console.log(`   ⚠️  Excluded: ${repo.name} (insufficient stars: ${repo.stargazers_count})`);
      return false;
    }
    
    if (repo.forks_count < PROJECT_QUALITY_CRITERIA.minForks) {
      console.log(`   ⚠️  Excluded: ${repo.name} (insufficient forks: ${repo.forks_count})`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error checking project status for ${repo.name}:`, error);
    return false;
  }
}

/**
 * Extract live URL from repository
 */
async function extractLiveUrl(repo: any): Promise<string | null> {
  try {
    // Check homepage URL from GitHub
    if (repo.homepage && repo.homepage.trim() !== '') {
      const homepage = repo.homepage.trim();
      // Validate it's a real URL (not just a domain name)
      if (homepage.startsWith('http://') || homepage.startsWith('https://')) {
        return homepage;
      }
    }
    
    // Check for deployed links in README
    try {
      const readmeResponse = await axios.get(
        `${GITHUB_API}/repos/${repo.owner.login}/${repo.name}/readme`,
        { headers, timeout: 5000 }
      );
      
      const readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
      const lowerReadme = readmeContent.toLowerCase();
      
      // Look for common deployment indicator patterns
      const deploymentPatterns = [
        /demo[:\s]+https?:\/\/[^\s\)]+/i,
        /live[:\s]+https?:\/\/[^\s\)]+/i,
        /deployed[:\s]+https?:\/\/[^\s\)]+/i,
        /visit[:\s]+https?:\/\/[^\s\)]+/i,
        /\[.*demo.*\]\((https?:\/\/[^\)]+)\)/i,
        /\[.*live.*\]\((https?:\/\/[^\)]+)\)/i
      ];
      
      for (const pattern of deploymentPatterns) {
        const match = readmeContent.match(pattern);
        if (match) {
          let url = match[0];
          // Extract URL from markdown link if present
          const urlMatch = url.match(/https?:\/\/[^\s\)]+/);
          if (urlMatch) {
            return urlMatch[0];
          }
        }
      }
    } catch (error) {
      // README not accessible, skip
    }
    
    return null;
  } catch (error) {
    console.error(`   Error extracting live URL for ${repo.name}:`, error);
    return null;
  }
}

/**
 * Determine difficulty based on project metrics and tech stack
 */
function determineDifficulty(repo: any, techStack: string[]): Difficulty {
  let complexityScore = 0;
  
  // Factor 1: Repository size and activity
  if (repo.stargazers_count > 5000) complexityScore += 2;
  else if (repo.stargazers_count > 1000) complexityScore += 1;
  
  if (repo.forks_count > 1000) complexityScore += 2;
  else if (repo.forks_count > 100) complexityScore += 1;
  
  // Factor 2: Tech stack complexity
  const complexTech = ['kubernetes', 'docker', 'microservices', 'graphql', 
                       'tensorflow', 'pytorch', 'blockchain', 'web3'];
  const hasComplexTech = techStack.some(tech => 
    complexTech.some(complex => tech.toLowerCase().includes(complex))
  );
  if (hasComplexTech) complexityScore += 2;
  
  // Factor 3: Multiple languages/technologies
  if (techStack.length > 5) complexityScore += 2;
  else if (techStack.length > 3) complexityScore += 1;
  
  // Factor 4: Description indicators
  const description = (repo.description || '').toLowerCase();
  const complexKeywords = ['enterprise', 'production', 'scalable', 'distributed', 'advanced'];
  if (complexKeywords.some(keyword => description.includes(keyword))) {
    complexityScore += 1;
  }
  
  // Determine final difficulty
  if (complexityScore >= 5) return 'HARD';
  if (complexityScore >= 3) return 'MEDIUM';
  return 'EASY';
}

/**
 * Search GitHub for projects
 */
async function searchGitHubProjects(query: string, perPage: number = 30): Promise<any[]> {
  try {
    const response = await axios.get(
      `${GITHUB_API}/search/repositories`,
      {
        headers,
        params: {
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: perPage
        },
        timeout: 10000
      }
    );
    
    return response.data.items || [];
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('   ❌ GitHub API rate limit exceeded. Please wait or add GITHUB_TOKEN.');
      return [];
    }
    console.error(`   ❌ Error searching GitHub:`, error.message);
    return [];
  }
}

/**
 * Process and save a repository as a project
 */
async function processRepository(repo: any, domainSlug: string): Promise<boolean> {
  try {
    // Check if already exists
    const existing = await prisma.gitHubProject.findFirst({
      where: { repoUrl: repo.html_url }
    });
    
    if (existing) {
      console.log(`   ⏭️  Skipped: ${repo.name} (already exists)`);
      return false;
    }
    
    // Check if it's a real project
    const isProject = await isRealProject(repo);
    if (!isProject) {
      return false;
    }
    
    // Extract data
    const topics = repo.topics || [];
    const language = repo.language;
    const techStack = [...new Set([
      language,
      ...topics.filter((t: string) => 
        !t.includes('awesome') && !t.includes('list')
      ).slice(0, 8)
    ])].filter(Boolean);
    
    const liveUrl = await extractLiveUrl(repo);
    const difficulty = determineDifficulty(repo, techStack);
    
    // Get domain
    const domain = await prisma.domain.findUnique({
      where: { slug: domainSlug }
    });
    
    if (!domain) {
      console.error(`   ❌ Domain not found: ${domainSlug}`);
      return false;
    }
    
    // Create project
    const defaultBranch = repo.default_branch || 'main';
    const downloadUrl = `https://github.com/${repo.owner.login}/${repo.name}/archive/refs/heads/${defaultBranch}.zip`;
    
    await prisma.gitHubProject.create({
      data: {
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
        slug: `${repo.owner.login}-${repo.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: repo.description || `A ${language} project for ${domainSlug.replace(/-/g, ' ')}`,
        repoUrl: repo.html_url,
        repoOwner: repo.owner.login,
        repoName: repo.name,
        defaultBranch,
        downloadUrl,
        liveUrl,
        domainId: domain.id,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: language,
        techStack,
        difficulty,
        topics,
        lastUpdated: repo.updated_at ? new Date(repo.updated_at) : new Date(),
        isActive: true,
        author: repo.owner.login
      }
    });
    
    console.log(`   ✅ Added: ${repo.name} (${difficulty}, ⭐ ${repo.stargazers_count}, 🔗 ${liveUrl ? 'Live Demo' : 'No Demo'})`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error processing ${repo.name}:`, error);
    return false;
  }
}

/**
 * Main scraping function
 */
async function scrapeQualityProjects() {
  try {
    console.log('🚀 Starting Advanced GitHub Project Scraper...\n');
    console.log('🎯 Filtering for REAL PROJECTS (not libraries)\n');
    
    if (!GITHUB_TOKEN) {
      console.warn('⚠️  WARNING: No GITHUB_TOKEN found. Rate limiting will be strict.\n');
    }
    
    let totalAdded = 0;
    let totalProcessed = 0;
    
    for (const domainConfig of DOMAIN_QUERIES) {
      console.log(`\n\n${'='.repeat(70)}`);
      console.log(`📁 Processing Domain: ${domainConfig.domain.toUpperCase()}`);
      console.log(`${'='.repeat(70)}\n`);
      
      let domainAdded = 0;
      
      for (const query of domainConfig.queries) {
        console.log(`\n🔍 Query: "${query}"`);
        
        const projects = await searchGitHubProjects(query, 15);
        console.log(`   Found ${projects.length} repositories`);
        
        for (const repo of projects) {
          totalProcessed++;
          const added = await processRepository(repo, domainConfig.domain);
          if (added) {
            totalAdded++;
            domainAdded++;
          }
          
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Stop if we've added enough for this domain (50+ per domain for 250+ total)
          if (domainAdded >= 50) {
            console.log(`   🎯 Reached 50 projects for ${domainConfig.domain}, moving to next domain...`);
            break;
          }
        }
        
        if (domainAdded >= 50) break;
        
        // Delay between queries
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`\n✅ Domain ${domainConfig.domain}: Added ${domainAdded} projects`);
    }
    
    console.log('\n\n' + '='.repeat(70));
    console.log('🎉 SCRAPING COMPLETE!');
    console.log('='.repeat(70));
    console.log(`\n📊 Final Statistics:`);
    console.log(`   Total Repositories Processed: ${totalProcessed}`);
    console.log(`   Total Projects Added: ${totalAdded}`);
    const successRate = totalProcessed === 0 ? 0 : (totalAdded / totalProcessed) * 100;
    console.log(`   Success Rate: ${successRate.toFixed(2)}%\n`);
    
    if (totalAdded > 0) {
      console.log('━'.repeat(70));
      console.log('📝 NEXT STEP: Generate Unique Content');
      console.log('━'.repeat(70));
      console.log('\n✨ Run this command to add 7 unique sections to all projects:');
      console.log('   npm run generate-content\n');
      console.log('💡 Or run the complete pipeline (scrape + generate) next time:');
      console.log('   npm run add-projects-complete\n');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during scraping:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  scrapeQualityProjects()
    .then(() => {
      console.log('\n✨ Process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Process failed:', error);
      process.exit(1);
    });
}

export { scrapeQualityProjects, isRealProject, extractLiveUrl };
