import axios from 'axios';
import * as fs from 'fs';

interface GitHubProject {
    name: string;
    description: string;
    url: string;
    stars: number;
    language: string;
    topics: string[];
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

interface DomainConfig {
    slug: string;
    name: string;
    searchQueries: string[];
    topics: string[];
    languages: string[];
}

// Domain configurations with specific search criteria
const DOMAIN_CONFIGS: DomainConfig[] = [
    {
        slug: 'artificial-intelligence',
        name: 'Artificial Intelligence',
        searchQueries: [
            'ai chatbot', 'neural network', 'computer vision', 'nlp natural language',
            'ai assistant', 'image recognition', 'speech recognition', 'ai automation',
            'generative ai', 'ai tools', 'llm application', 'ai agent'
        ],
        topics: ['artificial-intelligence', 'ai', 'neural-networks', 'computer-vision', 'nlp', 'chatbot', 'llm'],
        languages: ['Python', 'JavaScript', 'TypeScript', 'C++']
    },
    {
        slug: 'machine-learning',
        name: 'Machine Learning',
        searchQueries: [
            'machine learning model', 'deep learning', 'tensorflow project', 'pytorch tutorial',
            'ml classification', 'regression analysis', 'supervised learning', 'unsupervised learning',
            'reinforcement learning', 'ml pipeline', 'model deployment', 'ml algorithms'
        ],
        topics: ['machine-learning', 'deep-learning', 'tensorflow', 'pytorch', 'scikit-learn', 'keras'],
        languages: ['Python', 'R', 'Julia']
    },
    {
        slug: 'data-science',
        name: 'Data Science',
        searchQueries: [
            'data analysis', 'data visualization', 'pandas project', 'data pipeline',
            'exploratory data analysis', 'statistical analysis', 'data mining', 'big data',
            'jupyter notebook', 'data cleaning', 'dashboard', 'analytics'
        ],
        topics: ['data-science', 'data-visualization', 'pandas', 'data-analysis', 'jupyter-notebook'],
        languages: ['Python', 'R', 'JavaScript']
    },
    {
        slug: 'web-development',
        name: 'Web Development',
        searchQueries: [
            'react app', 'nextjs project', 'vue application', 'angular project',
            'fullstack web', 'nodejs backend', 'express api', 'web dashboard',
            'ecommerce website', 'social media app', 'cms system', 'portfolio website',
            'authentication system', 'rest api', 'graphql server', 'real-time chat'
        ],
        topics: ['react', 'nextjs', 'vue', 'angular', 'nodejs', 'express', 'fullstack', 'web-development'],
        languages: ['JavaScript', 'TypeScript', 'PHP', 'Ruby', 'Go']
    },
    {
        slug: 'cybersecurity',
        name: 'Cybersecurity',
        searchQueries: [
            'security tool', 'penetration testing', 'vulnerability scanner', 'encryption tool',
            'firewall', 'network security', 'security automation', 'malware analysis',
            'password manager', 'authentication security', 'intrusion detection', 'security monitoring'
        ],
        topics: ['cybersecurity', 'security', 'penetration-testing', 'encryption', 'security-tools'],
        languages: ['Python', 'C', 'C++', 'Go', 'Rust']
    },
    {
        slug: 'cloud-computing',
        name: 'Cloud Computing',
        searchQueries: [
            'aws project', 'azure deployment', 'gcp application', 'kubernetes deployment',
            'docker container', 'serverless application', 'cloud infrastructure', 'terraform',
            'cloud automation', 'microservices', 'cloud native', 'devops automation'
        ],
        topics: ['aws', 'azure', 'gcp', 'kubernetes', 'docker', 'serverless', 'cloud-computing', 'devops'],
        languages: ['Python', 'Go', 'JavaScript', 'TypeScript', 'Shell']
    },
    {
        slug: 'internet-of-things',
        name: 'Internet of Things',
        searchQueries: [
            'iot project', 'smart home', 'arduino project', 'raspberry pi', 'iot sensor',
            'home automation', 'iot gateway', 'mqtt', 'iot dashboard', 'esp32 project',
            'iot monitoring', 'sensor network'
        ],
        topics: ['iot', 'arduino', 'raspberry-pi', 'smart-home', 'mqtt', 'sensors'],
        languages: ['Python', 'C', 'C++', 'JavaScript']
    },
    {
        slug: 'embedded-systems',
        name: 'Embedded Systems',
        searchQueries: [
            'embedded system', 'firmware', 'microcontroller', 'rtos', 'embedded linux',
            'stm32 project', 'arm cortex', 'embedded c', 'bare metal', 'hardware driver'
        ],
        topics: ['embedded', 'firmware', 'microcontroller', 'rtos', 'embedded-systems'],
        languages: ['C', 'C++', 'Assembly', 'Rust']
    },
    {
        slug: 'finance',
        name: 'Finance',
        searchQueries: [
            'financial analysis', 'portfolio management', 'stock analysis', 'financial modeling',
            'accounting software', 'expense tracker', 'invoice generator', 'financial dashboard',
            'budgeting app', 'financial calculator', 'loan calculator', 'tax calculator'
        ],
        topics: ['finance', 'fintech', 'financial-analysis', 'accounting', 'portfolio-management'],
        languages: ['Python', 'JavaScript', 'R', 'Java']
    },
    {
        slug: 'stock-market-crypto-trading',
        name: 'Stock Market & Crypto Trading',
        searchQueries: [
            'trading bot', 'crypto trading', 'stock market analysis', 'algorithmic trading',
            'cryptocurrency', 'bitcoin bot', 'trading strategy', 'market prediction',
            'defi', 'blockchain trading', 'price prediction', 'trading signal'
        ],
        topics: ['trading', 'cryptocurrency', 'blockchain', 'bitcoin', 'trading-bot', 'defi'],
        languages: ['Python', 'JavaScript', 'Go', 'Rust']
    },
    {
        slug: 'marketing',
        name: 'Marketing',
        searchQueries: [
            'marketing automation', 'email marketing', 'seo tool', 'social media automation',
            'analytics dashboard', 'content management', 'crm system', 'lead generation',
            'campaign manager', 'marketing analytics', 'ab testing', 'growth hacking'
        ],
        topics: ['marketing', 'marketing-automation', 'seo', 'analytics', 'crm'],
        languages: ['JavaScript', 'Python', 'PHP', 'Ruby']
    }
];

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''; // Optional: Add your GitHub token for higher rate limits

/**
 * Determine difficulty based on stars, language complexity, and description
 */
function determineDifficulty(stars: number, language: string, description: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
    let score = 0;
    
    // Stars-based scoring
    if (stars > 5000) score += 3;
    else if (stars > 1000) score += 2;
    else score += 1;
    
    // Language complexity
    const advancedLanguages = ['C++', 'Rust', 'Assembly', 'Scala', 'Haskell'];
    const intermediateLanguages = ['Go', 'Java', 'C', 'Swift', 'Kotlin'];
    
    if (advancedLanguages.includes(language)) score += 3;
    else if (intermediateLanguages.includes(language)) score += 2;
    else score += 1;
    
    // Description keywords
    const advancedKeywords = ['distributed', 'scalable', 'enterprise', 'production', 'advanced', 'complex', 'architecture'];
    const beginnerKeywords = ['simple', 'basic', 'tutorial', 'learning', 'beginner', 'starter', 'intro'];
    
    const lowerDesc = description?.toLowerCase() || '';
    if (advancedKeywords.some(kw => lowerDesc.includes(kw))) score += 2;
    if (beginnerKeywords.some(kw => lowerDesc.includes(kw))) score -= 2;
    
    // Final determination
    if (score >= 7) return 'ADVANCED';
    if (score >= 4) return 'INTERMEDIATE';
    return 'BEGINNER';
}

/**
 * Fetch projects from GitHub API for a specific search query
 */
async function searchGitHub(query: string, language?: string, perPage: number = 30): Promise<any[]> {
    try {
        const headers: any = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Persevex-Project-Scraper'
        };
        
        if (GITHUB_TOKEN) {
            headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        }
        
        let searchQuery = `${query} stars:>50`;
        if (language) {
            searchQuery += ` language:${language}`;
        }
        
        const response = await axios.get('https://api.github.com/search/repositories', {
            headers,
            params: {
                q: searchQuery,
                sort: 'stars',
                order: 'desc',
                per_page: perPage
            }
        });
        
        return response.data.items || [];
    } catch (error: any) {
        console.error(`Error searching GitHub for "${query}":`, error.message);
        return [];
    }
}

/**
 * Fetch projects by topics
 */
async function searchByTopic(topic: string, perPage: number = 30): Promise<any[]> {
    try {
        const headers: any = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Persevex-Project-Scraper'
        };
        
        if (GITHUB_TOKEN) {
            headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        }
        
        const response = await axios.get('https://api.github.com/search/repositories', {
            headers,
            params: {
                q: `topic:${topic} stars:>50`,
                sort: 'stars',
                order: 'desc',
                per_page: perPage
            }
        });
        
        return response.data.items || [];
    } catch (error: any) {
        console.error(`Error searching by topic "${topic}":`, error.message);
        return [];
    }
}

/**
 * Fetch projects for a specific domain
 */
async function fetchProjectsForDomain(config: DomainConfig, targetCount: number = 100): Promise<GitHubProject[]> {
    console.log(`\n📦 Fetching projects for ${config.name}...`);
    
    const allProjects = new Map<string, GitHubProject>(); // Use Map to avoid duplicates
    const projectsPerQuery = Math.ceil(targetCount / (config.searchQueries.length + config.topics.length));
    
    // Search by queries
    for (const query of config.searchQueries) {
        console.log(`  🔍 Searching: "${query}"`);
        
        for (const language of config.languages) {
            const results = await searchGitHub(query, language, 10);
            
            for (const repo of results) {
                if (allProjects.size >= targetCount) break;
                
                const project: GitHubProject = {
                    name: repo.name,
                    description: repo.description || `${repo.name} - A ${config.name} project`,
                    url: repo.html_url,
                    stars: repo.stargazers_count,
                    language: repo.language || language,
                    topics: repo.topics || [],
                    difficulty: determineDifficulty(repo.stargazers_count, repo.language, repo.description)
                };
                
                allProjects.set(repo.html_url, project);
            }
            
            // Rate limiting: GitHub allows 10 requests per minute for unauthenticated
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (allProjects.size >= targetCount) break;
        }
        
        if (allProjects.size >= targetCount) break;
    }
    
    // Search by topics to fill remaining slots
    if (allProjects.size < targetCount) {
        for (const topic of config.topics) {
            console.log(`  🏷️  Searching topic: "${topic}"`);
            
            const results = await searchByTopic(topic, 20);
            
            for (const repo of results) {
                if (allProjects.size >= targetCount) break;
                
                const project: GitHubProject = {
                    name: repo.name,
                    description: repo.description || `${repo.name} - A ${config.name} project`,
                    url: repo.html_url,
                    stars: repo.stargazers_count,
                    language: repo.language || config.languages[0],
                    topics: repo.topics || [],
                    difficulty: determineDifficulty(repo.stargazers_count, repo.language, repo.description)
                };
                
                allProjects.set(repo.html_url, project);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (allProjects.size >= targetCount) break;
        }
    }
    
    const projects = Array.from(allProjects.values());
    console.log(`  ✅ Found ${projects.length} unique projects for ${config.name}`);
    
    return projects;
}

/**
 * Main scraper function
 */
async function scrapeAllDomains() {
    console.log('🚀 Starting GitHub Projects Scraper...\n');
    console.log(`Target: 100+ unique projects per domain`);
    console.log(`Total domains: ${DOMAIN_CONFIGS.length}\n`);
    
    const allDomainProjects: { [key: string]: GitHubProject[] } = {};
    
    for (const config of DOMAIN_CONFIGS) {
        const projects = await fetchProjectsForDomain(config, 120); // Fetch 120 to ensure we have 100+ after dedup
        allDomainProjects[config.slug] = projects;
        
        // Delay between domains to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Save to JSON file
    const outputPath = './prisma/githubProjectsData.json';
    fs.writeFileSync(outputPath, JSON.stringify(allDomainProjects, null, 2));
    
    console.log(`\n✅ Scraping complete!`);
    console.log(`📄 Data saved to: ${outputPath}`);
    
    // Print summary
    console.log('\n📊 Summary:');
    for (const [slug, projects] of Object.entries(allDomainProjects)) {
        const domainName = DOMAIN_CONFIGS.find(d => d.slug === slug)?.name;
        console.log(`  ${domainName}: ${projects.length} projects`);
    }
    
    const totalProjects = Object.values(allDomainProjects).reduce((sum, projects) => sum + projects.length, 0);
    console.log(`\n🎯 Total unique projects: ${totalProjects}`);
}

// Run the scraper
scrapeAllDomains().catch(console.error);
