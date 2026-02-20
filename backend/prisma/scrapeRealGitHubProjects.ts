/**
 * Scrapes 1000 REAL GitHub projects (200 per domain)
 * - Uses GitHub API to fetch actual production applications
 * - Filters OUT libraries, frameworks, tools
 * - Ensures uniqueness across all domains
 * - Total: 5 domains × 200 projects = 1000 unique real-world projects
 */

import { Octokit } from '@octokit/rest';
import { PrismaClient, Difficulty } from '@prisma/client';
import { Buffer } from 'buffer';

const prisma = new PrismaClient();

// GitHub API token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  console.error('Please create a .env file with your GitHub Personal Access Token');
  process.exit(1);
}
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Domain definitions
const DOMAINS = {
  web: { id: 'web-dev', name: 'Web Development', slug: 'web-development' },
  ai: { id: 'ai', name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  ml: { id: 'ml', name: 'Machine Learning', slug: 'machine-learning' },
  ds: { id: 'data-science', name: 'Data Science', slug: 'data-science' },
  cyber: { id: 'cyber', name: 'Cybersecurity', slug: 'cybersecurity' },
};

// COMPREHENSIVE Keywords to EXCLUDE (libraries/frameworks/tools/books/learning)
const EXCLUSION_KEYWORDS = [
  // Libraries & Frameworks
  'library', 'framework', 'plugin', 'sdk', 'api-wrapper', 'package', 'module',
  'component-library', 'ui-library', 'utility-library', 'helper-library',
  '.js', '-js', 'javascript-', 'react-component', 'vue-component', 'angular-module',
  
  // Dev Tools & Utilities
  'boilerplate', 'template', 'starter', 'cli-tool', 'cli', 'command-line',
  'generator', 'scaffolding', 'toolkit', 'tooling', 'build-tool', 'bundler',
  'webpack-', 'vite-', 'gulp-', 'grunt-', 'babel-', 'eslint-', 'prettier-',
  
  // Learning Materials & Educational Content
  'tutorial', 'example', 'demo', 'course', 'course-material', 'learning',
  'workshop', 'exercises', 'practice', 'training', 'study', 'lessons',
  'awesome-', 'awesome list', 'resources', 'collection', 'curated',
  'cheatsheet', 'cheat-sheet', 'reference', 'guide', 'handbook',
  'samples', 'code-samples', 'snippets', 'cookbook',
  
  // Documentation & Books
  'documentation', 'docs', 'book', 'ebook', 'e-book', 'manual', 'wiki',
  'glossary', 'dictionary', 'encyclopedia',
  
  // Testing/Mocking Tools
  'mock', 'faker', 'stub', 'test-utils', 'testing-library',
  
  // Specific Library Names (common ones that slip through)
  'p5.js', 'p5js', 'd3.js', 'd3js', 'three.js', 'threejs', 'chart.js', 'chartjs',
  'lodash', 'underscore', 'jquery', 'axios', 'express', 'fastify', 'koa',
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
  'tensorflow', 'pytorch', 'scikit', 'pandas', 'numpy', 'opencv',
  
  // Build/Config Files
  'config', 'configuration', 'setup', 'dotfiles', 'settings',
  
  // Generic Dev Terms
  'utils', 'helpers', 'utilities', 'common', 'shared', 'core',
  
  // Versioned Projects (prevent duplicates)
  '-v1', '-v2', '-v3', '-v4', '-v5', '_v1', '_v2', '_v3', '_v4', '_v5',
  'version-1', 'version-2', 'version-3', 'ver-1', 'ver-2', 'ver-3'
];

// Keywords that indicate REAL applications (what we WANT)
const INCLUSION_KEYWORDS = [
  'platform', 'application', 'app', 'system', 'service', 'portal', 'dashboard',
  'management', 'crm', 'cms', 'erp', 'saas', 'marketplace', 'e-commerce',
  'social-network', 'chat', 'messenger', 'video-streaming', 'music-streaming',
  'blog', 'forum', 'analytics', 'monitoring', 'automation', 'scheduling',
  'booking', 'reservation', 'inventory', 'tracking', 'reporting', 'billing'
];

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: { login: string };
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  default_branch: string;
  homepage: string | null;
  created_at: string;
  updated_at: string;
  archived: boolean;
  disabled: boolean;
}

/**
 * Check if a repository has a valid live demo link
 * Returns the live URL if found, null otherwise
 */
async function getValidLiveUrl(repo: GitHubRepo): Promise<string | null> {
  try {
    // Check 1: Homepage URL exists and is not just GitHub
    if (repo.homepage && 
        repo.homepage.trim().length > 0 &&
        !repo.homepage.includes('github.com') &&
        !repo.homepage.includes('github.io/' + repo.name)) { // Exclude simple GitHub Pages
      
      // Validate it's a real URL
      try {
        const url = new URL(repo.homepage);
        // Accept common deployment platforms
        const validDomains = [
          '.herokuapp.com', '.vercel.app', '.netlify.app', '.render.com',
          '.railway.app', '.fly.dev', '.azurewebsites.net', '.aws.amazon.com',
          '.firebaseapp.com', '.web.app', '.cloudflare', '.pages.dev',
          '.surge.sh', '.now.sh', '.glitch.me', '.repl.co'
        ];
        
        const hasValidDomain = validDomains.some(domain => url.hostname.includes(domain));
        const hasCustomDomain = !url.hostname.includes('github') && url.hostname.split('.').length >= 2;
        
        if (hasValidDomain || hasCustomDomain) {
          console.log(`      ✓ Valid live URL found: ${repo.homepage}`);
          return repo.homepage;
        }
      } catch (error) {
        // Invalid URL format
        return null;
      }
    }
    
    // Check 2: Look for demo link in README
    try {
      const readme = await octokit.repos.getReadme({
        owner: repo.owner.login,
        repo: repo.name
      });
      
      if (readme.data.content) {
        const content = Buffer.from(readme.data.content, 'base64').toString('utf-8').toLowerCase();
        
        // Look for common demo link patterns
        const demoPatterns = [
          /demo[:\s]+\[?([^\s\]]+)\]?/i,
          /live[:\s]+\[?([^\s\]]+)\]?/i,
          /preview[:\s]+\[?([^\s\]]+)\]?/i,
          /\[live demo\]\(([^\)]+)\)/i,
          /\[demo\]\(([^\)]+)\)/i,
          /\[preview\]\(([^\)]+)\)/i,
          /visit.*?(https?:\/\/[^\s\)]+)/i
        ];
        
        for (const pattern of demoPatterns) {
          const match = content.match(pattern);
          if (match && match[1] && !match[1].includes('github.com')) {
            console.log(`      ✓ Demo link found in README: ${match[1]}`);
            return match[1];
          }
        }
      }
    } catch (error) {
      // README not found or error fetching
    }
    
    console.log(`      ✗ No valid live URL found`);
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a repository is a library/framework/tool (should be excluded)
 */
function isExcludedProject(repo: GitHubRepo): boolean {
  const searchText = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();
  
  // Check exclusion keywords - MORE STRICT
  const hasExclusionKeyword = EXCLUSION_KEYWORDS.some(keyword => {
    const keywordLower = keyword.toLowerCase();
    // Check in name, description, and topics
    return repo.name.toLowerCase().includes(keywordLower) ||
           (repo.description && repo.description.toLowerCase().includes(keywordLower)) ||
           searchText.includes(keywordLower);
  });
  
  if (hasExclusionKeyword) {
    console.log(`    ✗ Excluded (library/tool/learning): ${repo.full_name}`);
    return true;
  }
  
  // Exclude archived/disabled repos
  if (repo.archived || repo.disabled) {
    console.log(`    ✗ Excluded (archived/disabled): ${repo.full_name}`);
    return true;
  }
  
  // Exclude repos with generic library-like names
  const libraryPatterns = [
    /^[a-z]+-utils$/i,
    /^[a-z]+-helper$/i,
    /^[a-z]+-lib$/i,
    /^lib-[a-z]+$/i,
    /^react-[a-z]+-component$/i,
    /^vue-[a-z]+-component$/i,
    /^[a-z]+\.js$/i,
    /^js-[a-z]+$/i,
    /^[a-z]+-plugin$/i,
    /^[a-z]+-package$/i,
    /^awesome-/i,
    /^learning-/i,
    /^tutorial-/i,
    /^example-/i,
    /^demo-/i,
    /-template$/i,
    /-starter$/i,
    /-boilerplate$/i,
    /-examples?$/i,
    /-samples?$/i,
    /-demo$/i,
    /-tutorial$/i
  ];
  
  if (libraryPatterns.some(pattern => pattern.test(repo.name))) {
    console.log(`    ✗ Excluded (library-like name pattern): ${repo.full_name}`);
    return true;
  }
  
  // Exclude if description explicitly mentions it's a library/framework/tool
  if (repo.description) {
    const desc = repo.description.toLowerCase();
    const badPhrases = [
      'javascript library',
      'js library',
      'ui library',
      'component library',
      'utility library',
      'is a library',
      'is a framework',
      'is a plugin',
      'is a package',
      'is a tool',
      'is a cli',
      'is a boilerplate',
      'is a template',
      'is a starter',
      'collection of',
      'curated list',
      'awesome list',
      'learning resources',
      'tutorial series',
      'code examples',
      'sample projects'
    ];
    
    if (badPhrases.some(phrase => desc.includes(phrase))) {
      console.log(`    ✗ Excluded (description mentions library/tool): ${repo.full_name}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a repository is a real application (should be included)
 */
function isRealApplication(repo: GitHubRepo): boolean {
  const searchText = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();
  
  // Must have meaningful description (relaxed)
  if (!repo.description || repo.description.trim().length < 15) {
    console.log(`    ✗ No meaningful description: ${repo.full_name}`);
    return false;
  }
  
  // Quality threshold: minimum stars (lowered to get more projects)
  if (repo.stargazers_count < 30) {
    console.log(`    ✗ Insufficient stars (${repo.stargazers_count}): ${repo.full_name}`);
    return false;
  }
  
  // Check for application indicators
  const hasAppKeyword = INCLUSION_KEYWORDS.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
  
  // Additional check: Look for production indicators
  const productionIndicators = [
    'production', 'deployed', 'live', 'platform', 'application', 'app',
    'system', 'saas', 'service', 'software', 'product', 'solution',
    'website', 'web', 'portal', 'dashboard', 'management', 'tracking'
  ];
  
  const hasProductionIndicator = productionIndicators.some(indicator =>
    searchText.includes(indicator)
  );
  
  // More lenient: Accept if has app keyword OR production indicator
  if (!hasAppKeyword && !hasProductionIndicator) {
    console.log(`    ✗ No application indicators: ${repo.full_name}`);
    return false;
  }
  
  return true;
}

/**
 * Search GitHub for repositories matching domain criteria
 */
async function searchGitHubRepos(query: string, perPage: number = 100, page: number = 1): Promise<GitHubRepo[]> {
  try {
    const response = await octokit.search.repos({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: perPage,
      page: page
    });
    
    return response.data.items as GitHubRepo[];
  } catch (error: any) {
    console.error(`GitHub API Error: ${error.message}`);
    return [];
  }
}

/**
 * Get repository details including topics
 */
async function getRepoDetails(owner: string, repo: string): Promise<GitHubRepo | null> {
  try {
    const response = await octokit.repos.get({ owner, repo });
    const topicsResponse = await octokit.repos.getAllTopics({ owner, repo });
    
    return {
      ...response.data,
      topics: topicsResponse.data.names
    } as GitHubRepo;
  } catch (error: any) {
    console.error(`Failed to fetch ${owner}/${repo}: ${error.message}`);
    return null;
  }
}

/**
 * Fetch real projects for Web Development domain
 */
async function fetchWebDevelopmentProjects(): Promise<GitHubRepo[]> {
  const queries = [
    // E-commerce & Marketplace Applications
    'e-commerce shop application stars:>30 language:JavaScript OR language:TypeScript',
    'online store marketplace stars:>30',
    'shopping cart checkout application stars:>30',
    'product catalog inventory stars:>30',
    
    // Content & Publishing Platforms
    'blogging platform cms stars:>30',
    'content management publishing stars:>30',
    'markdown blog application stars:>30',
    'article writing platform stars:>30',
    
    // Social & Communication Apps
    'social media platform stars:>30',
    'social network application stars:>30',
    'chat messaging application stars:>30',
    'real-time chat app stars:>30',
    'forum discussion application stars:>30',
    'community platform stars:>30',
    
    // Media & Entertainment
    'video streaming platform stars:>30',
    'music streaming player application stars:>30',
    'photo gallery sharing app stars:>30',
    'podcast platform application stars:>30',
    'media library management stars:>30',
    
    // Business & Productivity
    'project management dashboard stars:>30',
    'task management application stars:>30',
    'kanban board trello application stars:>30',
    'time tracking productivity app stars:>30',
    'invoice billing application stars:>30',
    'crm customer management system stars:>30',
    'erp business management stars:>30',
    'document collaboration platform stars:>30',
    
    // Booking & Reservation Systems
    'booking reservation system stars:>30',
    'hotel booking platform stars:>30',
    'appointment scheduling application stars:>30',
    'calendar event management app stars:>30',
    'ticket booking system stars:>30',
    
    // Food & Delivery
    'restaurant food ordering application stars:>30',
    'food delivery platform stars:>30',
    'recipe cooking application stars:>30',
    'meal planning app stars:>30',
    
    // Real Estate & Housing
    'real estate property listing platform stars:>30',
    'rental housing application stars:>30',
    'property management system stars:>30',
    
    // Education & Learning
    'online learning platform lms stars:>30',
    'education course management stars:>30',
    'quiz examination application stars:>30',
    'student portal dashboard stars:>30',
    
    // Healthcare & Fitness
    'healthcare patient management stars:>30',
    'fitness workout tracker application stars:>30',
    'meditation wellness app stars:>30',
    'health records system stars:>30',
    
    // Finance & Banking
    'expense tracker budgeting app stars:>30',
    'personal finance management stars:>30',
    'cryptocurrency trading platform stars:>30',
    'payment gateway integration stars:>30',
    
    // Analytics & Monitoring
    'analytics dashboard visualization stars:>30',
    'monitoring metrics platform stars:>30',
    'web analytics tracking application stars:>30',
    'business intelligence dashboard stars:>30',
    
    // Portfolio & Personal Sites
    'portfolio website builder stars:>30',
    'developer portfolio showcase stars:>30',
    'personal website cms stars:>30',
    
    // Collaboration & Communication
    'team collaboration workspace stars:>30',
    'file sharing platform stars:>30',
    'wiki documentation system stars:>30',
    'note taking application stars:>30',
    
    // Entertainment & Gaming
    'game platform multiplayer stars:>30',
    'quiz trivia application stars:>30',
    'live streaming platform stars:>30',
    
    // Job & Recruitment
    'job board platform stars:>30',
    'recruitment hiring system stars:>30',
    'freelance marketplace stars:>30'
  ];
  
  return await fetchProjectsFromQueries(queries, 200);
}

/**
 * Fetch real projects for AI domain
 */
async function fetchAIProjects(): Promise<GitHubRepo[]> {
  const queries = [
    'chatbot conversational-ai stars:>100',
    'computer vision application stars:>100',
    'image generation ai stars:>100',
    'speech recognition transcription stars:>100',
    'recommendation system stars:>100',
    'sentiment analysis nlp stars:>100',
    'translation localization ai stars:>100',
    'document processing ocr stars:>100',
    'anomaly detection ai stars:>100',
    'face recognition facial stars:>100',
    'object detection yolo stars:>100',
    'text summarization nlp stars:>100',
    'question answering qa stars:>100',
    'ai assistant virtual stars:>100',
    'voice assistant speech stars:>100'
  ];
  
  return await fetchProjectsFromQueries(queries, 200);
}

/**
 * Fetch real projects for Machine Learning domain
 */
async function fetchMLProjects(): Promise<GitHubRepo[]> {
  const queries = [
    'fraud detection machine-learning stars:>100',
    'predictive analytics ml stars:>100',
    'churn prediction customer stars:>100',
    'recommendation engine ml stars:>100',
    'price optimization dynamic stars:>100',
    'demand forecasting ml stars:>100',
    'credit scoring risk stars:>100',
    'quality control defect detection stars:>100',
    'predictive maintenance iot stars:>100',
    'time series forecasting stars:>100',
    'customer segmentation clustering stars:>100',
    'sales forecasting prediction stars:>100',
    'inventory optimization ml stars:>100',
    'trading prediction finance stars:>100',
    'medical diagnosis prediction stars:>100'
  ];
  
  return await fetchProjectsFromQueries(queries, 200);
}

/**
 * Fetch real projects for Data Science domain
 */
async function fetchDataScienceProjects(): Promise<GitHubRepo[]> {
  const queries = [
    'analytics dashboard visualization stars:>50',
    'business intelligence bi stars:>50',
    'data visualization platform stars:>50',
    'reporting analytics system stars:>50',
    'metrics monitoring dashboard stars:>50',
    'ab testing experimentation stars:>50',
    'customer analytics crm stars:>50',
    'web analytics tracking stars:>50',
    'financial analytics portfolio stars:>50',
    'healthcare analytics patient stars:>50',
    'sports analytics performance stars:>50',
    'supply chain analytics stars:>50',
    'marketing analytics campaign stars:>50',
    'social media analytics stars:>50',
    'iot analytics monitoring stars:>50',
    'data pipeline etl stars:>50',
    'log analysis monitoring stars:>50',
    'sales analytics reporting stars:>50',
    'traffic analytics seo stars:>50',
    'retail analytics insights stars:>50',
    'user behavior analytics stars:>50',
    'performance metrics dashboard stars:>50',
    'kpi tracking dashboard stars:>50',
    'data warehouse reporting stars:>50',
    'real-time analytics streaming stars:>50'
  ];
  
  return await fetchProjectsFromQueries(queries, 200);
}

/**
 * Fetch real projects for Cybersecurity domain
 */
async function fetchCybersecurityProjects(): Promise<GitHubRepo[]> {
  const queries = [
    'security scanner vulnerability stars:>100',
    'intrusion detection ids stars:>100',
    'firewall security network stars:>100',
    'vpn secure access stars:>100',
    'authentication sso identity stars:>100',
    'encryption security privacy stars:>100',
    'malware analysis detection stars:>100',
    'penetration testing security stars:>100',
    'threat intelligence security stars:>100',
    'security monitoring siem stars:>100',
    'api security gateway stars:>100',
    'container security scanning stars:>100',
    'cloud security posture stars:>100',
    'password manager vault stars:>100',
    'security audit compliance stars:>100'
  ];
  
  return await fetchProjectsFromQueries(queries, 200);
}

/**
 * Fetch projects from multiple queries with filtering
 */
async function fetchProjectsFromQueries(queries: string[], targetCount: number): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  const seenIds = new Set<number>();
  const seenNames = new Set<string>(); // Track similar names to avoid duplicates
  
  for (const query of queries) {
    if (allRepos.length >= targetCount) break;
    
    console.log(`  Searching: "${query}"...`);
    
    // Fetch multiple pages to get more results
    for (let page = 1; page <= 3; page++) {
      const repos = await searchGitHubRepos(query, 100, page);
      
      for (const repo of repos) {
        if (allRepos.length >= targetCount) break;
        if (seenIds.has(repo.id)) continue;
        
        // Check for duplicate/similar names (v1, v2, v3, version variations)
        const baseNameClean = repo.name.toLowerCase()
          .replace(/-v\d+$/, '')
          .replace(/_v\d+$/, '')
          .replace(/-version-?\d+$/, '')
          .replace(/-ver-?\d+$/, '');
        
        if (seenNames.has(baseNameClean)) {
          console.log(`    ✗ Duplicate/versioned project: ${repo.full_name}`);
          continue;
        }
        
        // Apply filters
        if (isExcludedProject(repo)) {
          continue;
        }
        
        if (!isRealApplication(repo)) {
          continue;
        }
        
        // Get full details including topics
        const details = await getRepoDetails(repo.owner.login, repo.name);
        if (!details) continue;
        
        // Check for live demo URL (preferred but not required)
        console.log(`    Checking live URL for: ${repo.full_name}...`);
        const liveUrl = await getValidLiveUrl(details);
        
        // Store the validated live URL in the repo object (can be null)
        (details as any).validatedLiveUrl = liveUrl;
        (details as any).hasLiveDemo = liveUrl !== null;
        
        seenIds.add(repo.id);
        seenNames.add(baseNameClean);
        allRepos.push(details);
        console.log(`    ✓ Added: ${repo.full_name} (${repo.stargazers_count} ⭐) - Live: ${liveUrl}`);
        
        // Rate limiting delay
        await sleep(200); // Increased delay for README fetching
      }
      
      await sleep(1000); // Delay between pages
    }
    
    await sleep(1500); // Delay between queries
  }
  
  return allRepos;
}

/**
 * Generate compelling case study with persona and problem
 */
function generateCaseStudy(repo: GitHubRepo, category: string): string {
  const projectType = repo.name.toLowerCase();
  
  // Create persona-based stories based on project keywords
  const stories = {
    ecommerce: "Maria runs a boutique clothing store in Austin, Texas. After the pandemic, she realized 70% of her potential customers were shopping online, but her manual inventory system made it impossible to sync stock across her physical store and a basic website. She was losing sales daily because customers would order items that were already sold in-store, leading to frustrating cancellations and damaged reputation.",
    
    chat: "TechStart, a remote-first startup with 50 employees across 12 countries, struggled with communication fragmentation. Their team was using 5 different tools for messaging, video calls, and file sharing, resulting in missed messages, duplicated conversations, and an average of 2 hours daily lost to context switching. The CEO knew they needed a unified solution.",
    
    social: "David, a community organizer, wanted to create a hyperlocal social network for his neighborhood of 5,000 residents. Traditional social media platforms were too broad and filled with noise, making it hard for neighbors to share local events, safety alerts, and community resources. He envisioned a platform where geographical proximity would foster genuine connections.",
    
    blog: "Jennifer, a professional food blogger with 50,000 monthly readers, was frustrated with her WordPress site's limitations. She couldn't implement the custom recipe rating system her audience requested, her site was slow during traffic spikes, and she had zero control over her content's data structure. She needed a modern, flexible blogging platform she could customize.",
    
    video: "StreamEdu, an online education platform, was paying $15,000 monthly to a third-party video hosting service. With 200 courses and growing, their costs were unsustainable. They needed their own video streaming infrastructure that could handle adaptive bitrate streaming, progress tracking, and certificate generation while reducing costs by 60%.",
    
    task: "Sarah's design agency had 8 team members juggling 25 client projects simultaneously. They were using spreadsheets to track tasks, which led to confusion: deadlines were missed, two designers unknowingly worked on the same task twice, and clients complained about lack of transparency. The agency desperately needed a visual project management system.",
    
    booking: "Dr. Patel's dental clinic was losing 30% of potential appointments due to their phone-only booking system. Patients called during lunch breaks but got voicemail, leading to abandoned bookings. The receptionist spent 3 hours daily just managing appointments and sending reminder texts manually. The clinic needed an automated booking solution.",
    
    analytics: "GreenLeaf, a sustainable fashion brand, had data scattered across Google Analytics, Shopify, Facebook Ads, and Instagram—but no unified view. Their marketing manager spent 2 full days each month manually compiling reports. They couldn't answer simple questions like 'Which Instagram post drove the most revenue?' in real-time.",
    
    restaurant: "Tony's Italian Restaurant lost $20,000 in revenue last quarter due to inefficient delivery management. Phone orders were written on paper tickets, delivery drivers picked up orders without knowing the full route, and customers had no way to track their food. During dinner rush, chaos ensued with 30+ orders in various states.",
    
    finance: "Mike, a freelance graphic designer, struggled to manage finances across 15 monthly clients. He was using a notebook to track invoices, expenses were in random photos on his phone, and he once missed a $3,000 payment because he forgot to send the invoice. Tax season was a nightmare. He needed a simple expense tracking system.",
    
    healthcare: "Valley Medical Center's patient portal was built in 2010 and looked like it. Patients couldn't book appointments online, test results took 5-7 days to appear (even though they were ready in 24 hours), and the mobile experience was unusable. Patient satisfaction scores dropped 15% over two years due to the outdated system.",
    
    education: "Professor Chen taught 'Introduction to Data Science' to 300 students each semester. Grading assignments manually took her 40+ hours per week, she couldn't provide personalized feedback at scale, and students complained that they didn't know where they stood in the course until midterms. She needed a learning management system with automated assessments.",
    
    portfolio: "Alex, a full-stack developer, applied to 50 companies with a basic HTML/CSS portfolio. He got 3 interview callbacks. His friend with an interactive, project-showcase portfolio got 15 callbacks from the same job batch. Alex realized that in today's market, a static portfolio wasn't enough—developers needed dynamic, engaging showcases.",
    
    music: "BeatCollective, an indie music label with 30 artists, wanted to create their own streaming platform rather than relying solely on Spotify and Apple Music. They wanted to offer exclusive content to fans, implement a fair revenue split (60% to artists instead of Spotify's 30%), and build direct relationships with their 50,000 fans.",
    
    crm: "Lisa's real estate agency had 500 leads per month but was converting only 8% because they had no system to track follow-ups. Leads were stored in random Excel files on different agents' computers, nobody knew who was supposed to call whom, and hot leads went cold waiting 2+ weeks for follow-up. They lost an estimated $200,000 annually.",
    
    inventory: "Warehouse Direct, a mid-sized distributor, discovered they had $80,000 in unexpired products that spoiled because their paper-based tracking system failed. They had no real-time visibility into stock levels across their 3 warehouses, and the manual stock-take process required 4 employees for 2 days every month. They needed digital inventory management.",
    
    default: `A ${category} professional identified a critical gap in their workflow: existing solutions were either too expensive, too complex, or didn't integrate with their existing tools. After losing significant time and money to inefficient processes, they realized they needed a custom solution. Their team of 20+ people was affected daily, and productivity metrics showed a 35% decline over six months. Building a tailored application became a business necessity.`
  };
  
  // Match story to project type
  if (projectType.includes('commerce') || projectType.includes('shop') || projectType.includes('store')) return stories.ecommerce;
  if (projectType.includes('chat') || projectType.includes('messenger') || projectType.includes('message')) return stories.chat;
  if (projectType.includes('social') || projectType.includes('network') || projectType.includes('community')) return stories.social;
  if (projectType.includes('blog') || projectType.includes('cms') || projectType.includes('content')) return stories.blog;
  if (projectType.includes('video') || projectType.includes('stream')) return stories.video;
  if (projectType.includes('task') || projectType.includes('todo') || projectType.includes('project-management') || projectType.includes('kanban')) return stories.task;
  if (projectType.includes('book') || projectType.includes('reservation') || projectType.includes('appointment')) return stories.booking;
  if (projectType.includes('analytics') || projectType.includes('dashboard') || projectType.includes('metrics')) return stories.analytics;
  if (projectType.includes('restaurant') || projectType.includes('food') || projectType.includes('delivery')) return stories.restaurant;
  if (projectType.includes('finance') || projectType.includes('expense') || projectType.includes('budget') || projectType.includes('invoice')) return stories.finance;
  if (projectType.includes('health') || projectType.includes('medical') || projectType.includes('patient')) return stories.healthcare;
  if (projectType.includes('learning') || projectType.includes('education') || projectType.includes('course') || projectType.includes('lms')) return stories.education;
  if (projectType.includes('portfolio') || projectType.includes('personal-site')) return stories.portfolio;
  if (projectType.includes('music') || projectType.includes('audio') || projectType.includes('player')) return stories.music;
  if (projectType.includes('crm') || projectType.includes('customer') || projectType.includes('lead')) return stories.crm;
  if (projectType.includes('inventory') || projectType.includes('stock') || projectType.includes('warehouse')) return stories.inventory;
  
  return stories.default;
}

/**
 * Generate problem statement based on project type
 */
function generateProblemStatement(repo: GitHubRepo, category: string): string {
  const projectType = repo.name.toLowerCase();
  
  const problems = {
    ecommerce: "The manual inventory management system lacks real-time synchronization between online and offline channels, resulting in overselling, customer dissatisfaction, and revenue loss. The absence of an integrated order management system creates operational inefficiencies and scalability constraints.",
    
    chat: "Communication fragmentation across multiple platforms creates information silos, reduces team productivity, and increases operational costs. The lack of a unified, real-time messaging system with integrated file sharing and search capabilities hinders remote collaboration and knowledge management.",
    
    social: "Existing social platforms lack geographical context and community-focused features, making it difficult for users to connect with nearby neighbors and discover local events. The absence of privacy controls specific to community needs creates security concerns for sharing local information.",
    
    blog: "Traditional blogging platforms offer limited customization, poor performance under load, and restricted data ownership. Content creators need a modern, headless CMS solution with API-first architecture, custom content modeling, and full control over their data and presentation layer.",
    
    video: "Third-party video hosting is cost-prohibitive at scale and lacks customization for specialized features like progress tracking, certificate generation, and custom analytics. The platform needs self-hosted video infrastructure with adaptive bitrate streaming and DRM support.",
    
    task: "Spreadsheet-based project management lacks real-time collaboration, visual workflow representation, and automated notifications. Teams need a system with role-based access control, task dependencies, time tracking, and client-facing dashboards for transparency.",
    
    booking: "Phone-based appointment systems are inefficient, prone to human error, and provide poor customer experience. The business needs an automated booking system with calendar integration, automated reminders, payment processing, and real-time availability checking.",
    
    analytics: "Data fragmentation across multiple marketing platforms prevents unified reporting and real-time decision-making. The organization needs a centralized analytics dashboard that aggregates data from multiple sources, provides custom visualizations, and enables automated reporting.",
    
    restaurant: "Paper-based order management creates chaos during peak hours, leads to errors, and provides no delivery tracking capabilities. The restaurant needs a digital order management system with real-time kitchen displays, driver routing optimization, and customer notifications.",
    
    finance: "Manual expense tracking leads to missed invoices, poor financial visibility, and tax compliance challenges. The business needs automated invoice generation, receipt scanning with OCR, expense categorization, and integration with accounting software.",
    
    healthcare: "The outdated patient portal lacks modern features like online appointment booking, real-time test results, telemedicine integration, and mobile responsiveness. This creates poor patient experience and administrative burden on medical staff.",
    
    education: "Manual grading and lack of automated assessment tools create unsustainable workload for instructors at scale. The platform needs automated quiz grading, plagiarism detection, personalized learning paths, and real-time progress dashboards for both students and instructors.",
    
    portfolio: "Static portfolio websites fail to demonstrate technical skills effectively and lack interactive elements that engage recruiters. Developers need dynamic portfolios with live project demos, interactive code examples, and analytics to track recruiter engagement.",
    
    music: "Reliance on third-party streaming platforms limits revenue potential and artist-fan relationships. The platform needs custom streaming infrastructure with fair revenue sharing, exclusive content tiers, direct messaging between artists and fans, and detailed listener analytics.",
    
    crm: "Decentralized lead management in spreadsheets creates data silos, missed follow-ups, and lost revenue opportunities. The team needs a centralized CRM with automated lead routing, follow-up reminders, email integration, and conversion analytics.",
    
    inventory: "Paper-based inventory tracking lacks real-time visibility, automated reordering, and expiry date monitoring. The business needs a digital system with barcode scanning, low-stock alerts, batch tracking, and multi-warehouse management.",
    
    default: `Current solutions lack integration capabilities, scalability, and cost-effectiveness. The absence of automated workflows, real-time data synchronization, and customizable features creates operational bottlenecks. A custom-built system with modern architecture, API integrations, and responsive design is required to address these limitations and support business growth.`
  };
  
  // Match problem to project type
  if (projectType.includes('commerce') || projectType.includes('shop') || projectType.includes('store')) return problems.ecommerce;
  if (projectType.includes('chat') || projectType.includes('messenger') || projectType.includes('message')) return problems.chat;
  if (projectType.includes('social') || projectType.includes('network') || projectType.includes('community')) return problems.social;
  if (projectType.includes('blog') || projectType.includes('cms') || projectType.includes('content')) return problems.blog;
  if (projectType.includes('video') || projectType.includes('stream')) return problems.video;
  if (projectType.includes('task') || projectType.includes('todo') || projectType.includes('project-management') || projectType.includes('kanban')) return problems.task;
  if (projectType.includes('book') || projectType.includes('reservation') || projectType.includes('appointment')) return problems.booking;
  if (projectType.includes('analytics') || projectType.includes('dashboard') || projectType.includes('metrics')) return problems.analytics;
  if (projectType.includes('restaurant') || projectType.includes('food') || projectType.includes('delivery')) return problems.restaurant;
  if (projectType.includes('finance') || projectType.includes('expense') || projectType.includes('budget') || projectType.includes('invoice')) return problems.finance;
  if (projectType.includes('health') || projectType.includes('medical') || projectType.includes('patient')) return problems.healthcare;
  if (projectType.includes('learning') || projectType.includes('education') || projectType.includes('course') || projectType.includes('lms')) return problems.education;
  if (projectType.includes('portfolio') || projectType.includes('personal-site')) return problems.portfolio;
  if (projectType.includes('music') || projectType.includes('audio') || projectType.includes('player')) return problems.music;
  if (projectType.includes('crm') || projectType.includes('customer') || projectType.includes('lead')) return problems.crm;
  if (projectType.includes('inventory') || projectType.includes('stock') || projectType.includes('warehouse')) return problems.inventory;
  
  return problems.default;
}

/**
 * Generate solution description
 */
function generateSolutionDescription(repo: GitHubRepo, category: string): string {
  const projectName = repo.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const desc = repo.description || '';
  const projectType = repo.name.toLowerCase();
  const primaryLang = repo.language || 'JavaScript';
  
  const baseSolution = `Build a ${projectName} - a modern, scalable ${category} solution. `;
  
  // Add project-specific capabilities
  const capabilities: Record<string, string> = {
    ecommerce: "This full-stack e-commerce platform will feature real-time inventory synchronization across multiple channels, secure payment processing with Stripe/PayPal integration, order management with automated email notifications, customer accounts with order history, and an admin dashboard for product and inventory management. The system will use WebSocket connections for live stock updates.",
    
    chat: "This real-time chat application will provide instant messaging with typing indicators, read receipts, file sharing with drag-and-drop upload, message search and archiving, user presence indicators (online/offline/away), group chats with admin controls, emoji reactions, and end-to-end encryption for secure communications. Built using WebSocket/Socket.io for real-time data flow.",
    
    social: "This social networking platform will enable user profiles with customizable bios and avatars, location-based post filtering, news feed with algorithmic ranking, likes/comments/shares functionality, friend connections and follow system, privacy controls for post visibility, real-time notifications, and moderation tools for community management. Implements RESTful API architecture with JWT authentication.",
    
    blog: "This headless CMS blogging platform will support markdown/rich text editing, custom content schemas, SEO optimization with meta tags and sitemaps, multi-author support with role-based permissions, commenting system with moderation, tags and categories for organization, RSS feed generation, and analytics dashboard. Features server-side rendering for optimal performance.",
    
    video: "This video streaming platform will handle video upload with automatic transcoding to multiple resolutions, adaptive bitrate streaming (HLS/DASH), video progress tracking with resume capability, playlists and collections, comment sections, view count analytics, subscription tiers with access control, and certificate generation upon course completion. Uses cloud storage integration (AWS S3/Cloudinary).",
    
    task: "This project management application will feature kanban boards with drag-and-drop functionality, task assignment with due dates and priorities, time tracking with manual and timer-based entry, file attachments and comments, project milestones and dependencies, team collaboration with @mentions, customizable workflows, Gantt chart visualization, and email notifications for task updates.",
    
    booking: "This appointment booking system will provide a real-time availability calendar, automated booking confirmations via email/SMS, calendar integration (Google Calendar, Outlook), payment processing for deposits or full payments, automated reminder notifications 24 hours before appointments, customer management with booking history, service/staff management, cancellation and rescheduling with configurable policies, and timezone handling for global bookings.",
    
    analytics: "This analytics dashboard will aggregate data from multiple sources via API integrations, provide customizable charts and visualizations (line, bar, pie, heatmap), real-time metric updates using scheduled jobs or webhooks, custom date range filtering, exportable reports in PDF/CSV formats, KPI tracking with goal setting, user behavior analysis with funnel visualization, and role-based dashboard access for different team members.",
    
    restaurant: "This restaurant management system will digitize order taking with table management, send orders directly to kitchen display screens, provide real-time order status updates for customers, optimize delivery routes for drivers using mapping APIs, enable customer order tracking with live location updates, integrate payment processing, generate daily sales reports, manage menu items with availability toggles, and support both dine-in and delivery workflows.",
    
    finance: "This expense tracking application will automate invoice generation with customizable templates, scan and parse receipts using OCR technology, categorize expenses automatically with machine learning, track income and expenses with visual charts, provide tax reporting with category summaries, integrate with banking APIs for transaction imports, set budget limits with overspending alerts, support multiple currencies with real-time conversion, and generate profit/loss statements.",
    
    healthcare: "This patient portal will enable online appointment booking with provider availability viewing, display lab results and medical records immediately upon availability, provide secure messaging with healthcare providers, support telemedicine video consultations with integrated video SDK, prescription refill requests with approval workflow, appointment reminders via SMS/email, health tracking features (vitals, medications), document upload for medical history, and HIPAA-compliant data encryption.",
    
    education: "This learning management system will deliver course content with module progression tracking, automatically grade multiple-choice and coding assignments, detect plagiarism using similarity algorithms, provide personalized learning paths based on performance analytics, enable discussion forums for peer collaboration, support live virtual classrooms with video conferencing, generate certificates upon course completion, track student progress with detailed analytics dashboards, and offer mobile-responsive design for learning on any device.",
    
    portfolio: "This dynamic portfolio platform will showcase projects with live demos embedded via iframes, display code snippets with syntax highlighting, provide interactive sections (filterable project grid, animated transitions), include a blog for technical articles, integrate contact forms with email notifications, track visitor analytics (page views, time on site, most viewed projects), support theming with dark/light mode toggle, optimize for SEO with meta tags and structured data, and achieve lighthouse scores above 90.",
    
    music: "This music streaming platform will handle audio playback with playlist management and shuffle/repeat controls, organize music by artists, albums, and genres with smart recommendations, provide artist dashboards with earnings breakdowns and listener demographics, enable direct messaging between artists and fans, support exclusive content tiers with subscription management, track detailed listening analytics (play counts, skip rates, listening duration), implement audio fingerprinting for duplicate detection, and integrate payment processing for subscription billing.",
    
    crm: "This customer relationship management system will centralize lead data with import/export capabilities, automate lead assignment based on territory or round-robin logic, track all interactions (calls, emails, meetings) in a unified timeline, set automated follow-up reminders with customizable intervals, integrate with email clients for seamless communication, provide conversion funnel analytics with stage progression tracking, enable custom fields and tags for flexible data organization, generate sales forecasts based on pipeline value, and offer mobile apps for on-the-go access.",
    
    inventory: "This inventory management system will track stock levels in real-time across multiple warehouse locations, support barcode scanning for quick item lookup and stock updates, send automated alerts when stock falls below reorder points, manage batch numbers and expiry dates with FIFO/LIFO calculations, generate purchase orders automatically based on demand forecasting, provide comprehensive reporting (stock valuation, movement history, dead stock analysis), enable multi-location transfers with approval workflows, integrate with e-commerce platforms for automatic stock deductions, and support role-based access for different user types.",
    
    default: `This ${category} application will implement modern best practices including RESTful API architecture, real-time data synchronization, responsive design for cross-device compatibility, secure authentication with JWT tokens, role-based authorization, cloud-hosted database with automated backups, containerized deployment using Docker, comprehensive error handling and logging, input validation and sanitization, automated testing (unit, integration, e2e), CI/CD pipeline for continuous deployment, performance optimization with caching strategies, and scalable microservices architecture. The system will be built with ${primaryLang} and industry-standard frameworks.`
  };
  
  // Match solution to project type
  if (projectType.includes('commerce') || projectType.includes('shop') || projectType.includes('store')) return baseSolution + capabilities.ecommerce;
  if (projectType.includes('chat') || projectType.includes('messenger') || projectType.includes('message')) return baseSolution + capabilities.chat;
  if (projectType.includes('social') || projectType.includes('network') || projectType.includes('community')) return baseSolution + capabilities.social;
  if (projectType.includes('blog') || projectType.includes('cms') || projectType.includes('content')) return baseSolution + capabilities.blog;
  if (projectType.includes('video') || projectType.includes('stream')) return baseSolution + capabilities.video;
  if (projectType.includes('task') || projectType.includes('todo') || projectType.includes('project-management') || projectType.includes('kanban')) return baseSolution + capabilities.task;
  if (projectType.includes('book') || projectType.includes('reservation') || projectType.includes('appointment')) return baseSolution + capabilities.booking;
  if (projectType.includes('analytics') || projectType.includes('dashboard') || projectType.includes('metrics')) return baseSolution + capabilities.analytics;
  if (projectType.includes('restaurant') || projectType.includes('food') || projectType.includes('delivery')) return baseSolution + capabilities.restaurant;
  if (projectType.includes('finance') || projectType.includes('expense') || projectType.includes('budget') || projectType.includes('invoice')) return baseSolution + capabilities.finance;
  if (projectType.includes('health') || projectType.includes('medical') || projectType.includes('patient')) return baseSolution + capabilities.healthcare;
  if (projectType.includes('learning') || projectType.includes('education') || projectType.includes('course') || projectType.includes('lms')) return baseSolution + capabilities.education;
  if (projectType.includes('portfolio') || projectType.includes('personal-site')) return baseSolution + capabilities.portfolio;
  if (projectType.includes('music') || projectType.includes('audio') || projectType.includes('player')) return baseSolution + capabilities.music;
  if (projectType.includes('crm') || projectType.includes('customer') || projectType.includes('lead')) return baseSolution + capabilities.crm;
  if (projectType.includes('inventory') || projectType.includes('stock') || projectType.includes('warehouse')) return baseSolution + capabilities.inventory;
  
  return baseSolution + capabilities.default;
}

/**
 * Generate prerequisites based on project complexity
 */
function generatePrerequisites(repo: GitHubRepo, difficulty: Difficulty): string {
  const prerequisites: Record<Difficulty, string> = {
    BEGINNER: "Basic knowledge of HTML, CSS, and JavaScript. Understanding of DOM manipulation and event handling. Familiarity with Git version control. Basic understanding of client-server architecture and HTTP methods (GET, POST).",
    EASY: "Basic knowledge of HTML, CSS, and JavaScript. Understanding of DOM manipulation and event handling. Familiarity with Git version control. Basic understanding of client-server architecture and HTTP methods (GET, POST).",
    
    INTERMEDIATE: "Proficient in JavaScript ES6+ features (arrow functions, promises, async/await). Understanding of RESTful API design principles and CRUD operations. Experience with a frontend framework (React, Vue, or Angular). Knowledge of database concepts (SQL or NoSQL) and ORM/ODM usage. Familiarity with authentication (JWT, sessions) and form validation. Basic understanding of responsive design and CSS frameworks.",
    MEDIUM: "Proficient in JavaScript ES6+ features (arrow functions, promises, async/await). Understanding of RESTful API design principles and CRUD operations. Experience with a frontend framework (React, Vue, or Angular). Knowledge of database concepts (SQL or NoSQL) and ORM/ODM usage. Familiarity with authentication (JWT, sessions) and form validation. Basic understanding of responsive design and CSS frameworks.",
    
    ADVANCED: "Advanced full-stack development experience with modern frameworks. Deep understanding of database design, indexing, and query optimization. Experience with WebSocket connections for real-time features. Knowledge of authentication/authorization patterns (OAuth, RBAC). Proficient in API security best practices (CORS, rate limiting, input sanitization). Understanding of cloud deployment (AWS, Azure, or GCP), containerization (Docker), and CI/CD pipelines. Experience with testing frameworks (Jest, Mocha, Cypress). Familiarity with performance optimization techniques (caching, lazy loading, code splitting).",
    HARD: "Advanced full-stack development experience with modern frameworks. Deep understanding of database design, indexing, and query optimization. Experience with WebSocket connections for real-time features. Knowledge of authentication/authorization patterns (OAuth, RBAC). Proficient in API security best practices (CORS, rate limiting, input sanitization). Understanding of cloud deployment (AWS, Azure, or GCP), containerization (Docker), and CI/CD pipelines. Experience with testing frameworks (Jest, Mocha, Cypress). Familiarity with performance optimization techniques (caching, lazy loading, code splitting)."
  };
  
  return prerequisites[difficulty];
}

/**
 * Generate tech stack based on project type and language
 */
function generateTechStack(repo: GitHubRepo): string {
  const language = repo.language || 'JavaScript';
  const projectType = repo.name.toLowerCase();
  
  // Base stacks by primary language
  const languageStacks: Record<string, string> = {
    JavaScript: "Frontend: React.js with React Router, Axios for API calls, Context API or Redux for state management; Backend: Node.js with Express.js, MongoDB with Mongoose ODM; Authentication: JWT with bcrypt; Deploy: Vercel (frontend), Render/Railway (backend)",
    
    TypeScript: "Frontend: Next.js 14 (App Router) with TypeScript, TailwindCSS, SWR for data fetching; Backend: Node.js with Express.js and TypeScript, PostgreSQL with Prisma ORM; Authentication: NextAuth.js with credential and OAuth providers; Deploy: Vercel full-stack",
    
    Python: "Frontend: React.js or Vue.js; Backend: Python with Django/Flask, PostgreSQL or MySQL with SQLAlchemy ORM; Authentication: Django Auth or JWT with PyJWT; API: Django REST Framework or Flask-RESTful; Deploy: Heroku or AWS EC2",
    
    Angular: "Frontend: Angular 17 with TypeScript, RxJS for reactive programming, Angular Material UI; Backend: NestJS with TypeScript, PostgreSQL with TypeORM; Authentication: Passport.js with JWT strategy; Deploy: Netlify (frontend), Railway (backend)",
    
    Java: "Frontend: React.js or Thymeleaf templates; Backend: Java with Spring Boot, MySQL/PostgreSQL with Hibernate JPA; Authentication: Spring Security with JWT; API: Spring REST; Deploy: AWS Elastic Beanstalk or Heroku",
    
    PHP: "Frontend: Vue.js or vanilla JavaScript; Backend: PHP with Laravel framework, MySQL with Eloquent ORM; Authentication: Laravel Sanctum or Passport for API tokens; Deploy: Shared hosting or DigitalOcean droplet",
    
    Ruby: "Frontend: React.js with Webpacker; Backend: Ruby on Rails, PostgreSQL with ActiveRecord; Authentication: Devise gem with JWT tokens; API: Rails API mode with Active Model Serializers; Deploy: Heroku or Render",
    
    Go: "Frontend: React.js or Vue.js; Backend: Golang with Gin or Echo framework, PostgreSQL with GORM; Authentication: JWT with golang-jwt library; Deploy: AWS Lambda or Google Cloud Run",
    
    default: "Frontend: React.js with modern hooks, TailwindCSS for styling; Backend: Node.js with Express.js, MongoDB or PostgreSQL; Authentication: JWT with secure HTTP-only cookies; Real-time: Socket.io (if needed); Payment: Stripe API (if needed); File Upload: Cloudinary or AWS S3; Deploy: Vercel (frontend), Render/Railway (backend)"
  };
  
  let techStack = languageStacks[language] || languageStacks.default;
  
  // Add project-specific additions
  if (projectType.includes('chat') || projectType.includes('messenger')) {
    techStack += "; Real-time: Socket.io or WebSocket API for instant messaging";
  }
  if (projectType.includes('video') || projectType.includes('stream')) {
    techStack += "; Media: FFmpeg for video transcoding, HLS.js for adaptive streaming, AWS S3 or Cloudinary for video storage";
  }
  if (projectType.includes('payment') || projectType.includes('commerce') || projectType.includes('booking')) {
    techStack += "; Payment: Stripe or PayPal SDK for payment processing";
  }
  if (projectType.includes('analytics') || projectType.includes('dashboard')) {
    techStack += "; Visualization: Chart.js or Recharts for data visualization, date-fns for date handling";
  }
  if (projectType.includes('map') || projectType.includes('location') || projectType.includes('delivery') || projectType.includes('restaurant')) {
    techStack += "; Maps: Google Maps API or Mapbox for location services";
  }
  
  return techStack;
}

/**
 * Generate deliverables based on project type
 */
function generateDeliverables(repo: GitHubRepo, category: string): string[] {
  const deliverables = [
    "Fully functional web application deployed to a live URL (Vercel, Netlify, or similar platform)",
    "Complete source code hosted on GitHub with a comprehensive README.md file including setup instructions",
    "Database schema diagram (ERD) showing all tables/collections and their relationships",
    "API documentation (using Postman collection or Swagger/OpenAPI specification)",
    "User authentication system with secure password hashing and JWT token implementation",
    "Responsive UI design that works seamlessly on desktop, tablet, and mobile devices",
    "At least 10 unit tests for critical backend functions using Jest or similar testing framework",
    "Environment variables configuration template (.env.example) for secure credential management",
    "2-3 minute video demonstration showing all major features and user flows",
    "Deployment guide document explaining how to replicate the deployment process"
  ];
  
  return deliverables;
}

/**
 * Generate supposed deadline based on difficulty
 */
function generateDeadline(difficulty: Difficulty): string {
  const deadlines: Record<Difficulty, string> = {
    BEGINNER: "1-2 Weeks",
    EASY: "1-2 Weeks",
    INTERMEDIATE: "2-3 Weeks",
    MEDIUM: "2-3 Weeks",
    ADVANCED: "3-4 Weeks",
    HARD: "3-4 Weeks"
  };
  
  return deadlines[difficulty];
}

/**
 * Generate unique project content following the documentation standards
 */
function generateProjectContent(repo: GitHubRepo, category: string): any {
  const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
  const difficulty = repo.stargazers_count > 5000 ? 'HARD' : 
                     repo.stargazers_count > 500 ? 'MEDIUM' : 'EASY';
  
  const estimatedMinTime = difficulty === 'EASY' ? 20 : difficulty === 'MEDIUM' ? 40 : 60;
  const estimatedMaxTime = estimatedMinTime + 30;
  
  const techStack = [];
  if (repo.language) techStack.push(repo.language);
  if (repo.topics.length > 0) {
    // Add relevant topics as tech stack (excluding generic ones)
    const relevantTopics = repo.topics.filter(t => 
      !['awesome', 'hacktoberfest', 'good-first-issue', 'beginner-friendly'].includes(t)
    ).slice(0, 5);
    techStack.push(...relevantTopics);
  }
  
  // Generate comprehensive content using helper functions
  const caseStudy = generateCaseStudy(repo, category);
  const problemStatement = generateProblemStatement(repo, category);
  const solutionDescription = generateSolutionDescription(repo, category);
  const prerequisitesText = generatePrerequisites(repo, difficulty);
  const techStackText = generateTechStack(repo);
  const deliverables = generateDeliverables(repo, category);
  const supposedDeadline = generateDeadline(difficulty);
  
  return {
    title: repo.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: repo.description || `A professional ${category} application built with ${repo.language || 'modern technologies'}`,
    repoUrl: repo.html_url,
    repoOwner: repo.owner.login,
    repoName: repo.name,
    defaultBranch: repo.default_branch || 'main',
    downloadUrl: `${repo.html_url}/archive/refs/heads/${repo.default_branch || 'main'}.zip`,
    liveUrl: (repo as any).validatedLiveUrl || repo.homepage || repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language || 'JavaScript',
    difficulty: difficulty,
    subDomain: category,
    slug: `${repo.owner.login}-${repo.name}`.toLowerCase(),
    
    // Real-World Solution Framework Fields (matching documentation standards)
    caseStudy: caseStudy,
    problemStatement: problemStatement,
    solutionDescription: solutionDescription,
    prerequisitesText: prerequisitesText,
    deliverables: deliverables,
    supposedDeadline: supposedDeadline,
    
    // Additional fields
    evaluationCriteria: 'Functionality (30%), Code Quality (25%), Performance (20%), Security (15%), Documentation (10%)',
    technicalSkills: techStack,
    techStack: techStackText.split('; ').map(t => t.trim()), // Array format for storage
    toolsUsed: ['Git & GitHub', 'VS Code', 'Postman/Thunder Client', 'Database GUI (MongoDB Compass/pgAdmin)', 'Browser DevTools'],
    conceptsUsed: repo.topics.slice(0, 5),
    introduction: `Master industry-standard ${category} development by building a production-ready application inspired by ${repo.full_name}, a real-world project with ${repo.stargazers_count.toLocaleString()} GitHub stars. This project will teach you modern development practices, system design, and deployment strategies used by professional development teams.`,
    estimatedMinTime,
    estimatedMaxTime,
    isActive: true,
    author: repo.owner.login
  };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main seeding function
 */
async function seedRealGitHubProjects() {
  console.log('🚀 Starting Real GitHub Projects Scraper (WEB DEVELOPMENT TEST MODE)...');
  console.log('📊 Target: 200 Web Development projects for testing\n');
  console.log('⚠️  NOTE: Only Web Development will be seeded for quality verification');
  console.log('   After verification, run full scraper for all domains\n');
  
  try {
    // Step 1: Clear existing projects
    console.log('Step 1: Clearing existing GitHubProject records...');
    
    // Delete project progress records first (foreign key constraint)
    const progressDeleted = await prisma.projectProgress.deleteMany({});
    console.log(`  ✓ Deleted ${progressDeleted.count} project progress records`);
    
    // Delete project bookmarks (both regular and GitHub projects)
    const bookmarksDeleted = await prisma.bookmark.deleteMany({
      where: {
        OR: [
          { projectId: { not: null } },
          { githubProjectId: { not: null } }
        ]
      }
    });
    console.log(`  ✓ Deleted ${bookmarksDeleted.count} project bookmarks`);
    
    // Delete projects
    const deleted = await prisma.gitHubProject.deleteMany({});
    console.log(`  ✓ Deleted ${deleted.count} old projects\n`);
    
    // Step 2: Ensure domains exist
    console.log('Step 2: Ensuring domains exist...');
    for (const domain of Object.values(DOMAINS)) {
      await prisma.domain.upsert({
        where: { slug: domain.slug },
        update: { name: domain.name },
        create: {
          id: domain.id,
          name: domain.name,
          slug: domain.slug,
          description: `${domain.name} — Real-world industry projects from GitHub`
        }
      });
      console.log(`  ✓ Domain: ${domain.name}`);
    }
    console.log();
    
    // Step 3: Fetch and seed WEB DEVELOPMENT ONLY (for testing)
    const domainFetchers = [
      { name: 'Web Development', fetch: fetchWebDevelopmentProjects, domainId: DOMAINS.web.id }
      // OTHER DOMAINS COMMENTED OUT FOR TESTING
      // { name: 'Artificial Intelligence', fetch: fetchAIProjects, domainId: DOMAINS.ai.id },
      // { name: 'Machine Learning', fetch: fetchMLProjects, domainId: DOMAINS.ml.id },
      // { name: 'Data Science', fetch: fetchDataScienceProjects, domainId: DOMAINS.ds.id },
      // { name: 'Cybersecurity', fetch: fetchCybersecurityProjects, domainId: DOMAINS.cyber.id }
    ];
    
    let totalSeeded = 0;
    
    for (const { name, fetch, domainId } of domainFetchers) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Step 3: Fetching ${name} projects from GitHub...`);
      console.log(`${'='.repeat(60)}`);
      
      const repos = await fetch();
      console.log(`\n  Found ${repos.length} projects. Seeding to database...`);
      
      let successCount = 0;
      for (const repo of repos) {
        try {
          const projectData = generateProjectContent(repo, name);
          
          await prisma.gitHubProject.create({
            data: {
              ...projectData,
              domainId
            } as any
          });
          
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`  Progress: ${successCount}/${repos.length} seeded...`);
          }
        } catch (err: any) {
          console.error(`  ✗ Failed to seed ${repo.full_name}: ${err.message}`);
        }
      }
      
      console.log(`  ✓ ${name}: ${successCount}/${repos.length} projects seeded`);
      totalSeeded += successCount;
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ TEST SEED COMPLETED!`);
    console.log(`📊 Total: ${totalSeeded} Web Development projects seeded`);
    console.log(`🔍 Please verify these projects are:`);
    console.log(`   1. Real-world applications (not libraries/tools)`);
    console.log(`   2. Have working live demo links`);
    console.log(`   3. No duplicate versions`);
    console.log(`\n💡 If quality is good, uncomment other domains and re-run`);
    console.log(`${'='.repeat(60)}\n`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedRealGitHubProjects();
