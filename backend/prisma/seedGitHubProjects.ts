import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GitHubProject {
    name: string;
    description: string;
    url: string;
    stars: number;
    language: string;
    topics: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface DomainConfig {
    slug: string;
    name: string;
    searchQueries: string[];
    topics: string[];
    languages: string[];
}

// Only the 5 required domains from client requirements
const DOMAIN_CONFIGS: DomainConfig[] = [
    {
        slug: 'artificial-intelligence',
        name: 'Artificial Intelligence',
        searchQueries: [
            'ai chatbot', 'neural network', 'computer vision', 'nlp natural language',
            'ai assistant', 'image recognition', 'speech recognition', 'ai automation',
            'generative ai', 'ai tools', 'llm application', 'ai agent', 'gpt wrapper',
            'stable diffusion', 'face recognition', 'object detection', 'sentiment analysis'
        ],
        topics: ['artificial-intelligence', 'ai', 'neural-networks', 'computer-vision', 'nlp', 'chatbot', 'llm', 'gpt', 'transformers'],
        languages: ['Python', 'JavaScript', 'TypeScript', 'C++', 'Java']
    },
    {
        slug: 'machine-learning',
        name: 'Machine Learning',
        searchQueries: [
            'machine learning model', 'deep learning', 'tensorflow project', 'pytorch tutorial',
            'ml classification', 'regression analysis', 'supervised learning', 'unsupervised learning',
            'reinforcement learning', 'ml pipeline', 'model deployment', 'ml algorithms',
            'scikit learn', 'keras model', 'xgboost', 'random forest', 'neural architecture'
        ],
        topics: ['machine-learning', 'deep-learning', 'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'ml', 'data-science'],
        languages: ['Python', 'R', 'Julia', 'JavaScript']
    },
    {
        slug: 'data-science',
        name: 'Data Science',
        searchQueries: [
            'data analysis', 'data visualization', 'pandas project', 'data pipeline',
            'exploratory data analysis', 'statistical analysis', 'data mining', 'big data',
            'jupyter notebook', 'data cleaning', 'dashboard', 'analytics', 'plotly', 'seaborn',
            'data warehouse', 'etl pipeline', 'data engineering'
        ],
        topics: ['data-science', 'data-visualization', 'pandas', 'data-analysis', 'jupyter-notebook', 'analytics', 'statistics'],
        languages: ['Python', 'R', 'JavaScript', 'SQL']
    },
    {
        slug: 'web-development',
        name: 'Web Development',
        searchQueries: [
            'react app', 'nextjs project', 'vue application', 'angular project',
            'fullstack web', 'nodejs backend', 'express api', 'web dashboard',
            'ecommerce website', 'social media app', 'cms system', 'portfolio website',
            'authentication system', 'rest api', 'graphql server', 'real-time chat',
            'mern stack', 'crud app', 'blog platform', 'task manager'
        ],
        topics: ['react', 'nextjs', 'vue', 'angular', 'nodejs', 'express', 'fullstack', 'web-development', 'frontend', 'backend'],
        languages: ['JavaScript', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Python']
    },
    {
        slug: 'cybersecurity',
        name: 'Cybersecurity',
        searchQueries: [
            'security tool', 'penetration testing', 'vulnerability scanner', 'encryption tool',
            'firewall', 'network security', 'security automation', 'malware analysis',
            'password manager', 'authentication security', 'intrusion detection', 'security monitoring',
            'exploit framework', 'security audit', 'ddos protection', 'web application security'
        ],
        topics: ['cybersecurity', 'security', 'penetration-testing', 'encryption', 'security-tools', 'infosec', 'hacking'],
        languages: ['Python', 'C', 'C++', 'Go', 'Rust', 'Shell']
    }
];

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

function createSlug(title: string, id: string): string {
    const slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
    
    const uniqueSuffix = id.substring(0, 8);
    return `${slugBase}-${uniqueSuffix}`;
}

function determineDifficulty(stars: number, language: string, description: string): 'EASY' | 'MEDIUM' | 'HARD' {
    let score = 0;
    
    if (stars > 5000) score += 3;
    else if (stars > 1000) score += 2;
    else score += 1;
    
    const advancedLanguages = ['C++', 'Rust', 'Assembly', 'Scala', 'Haskell', 'C'];
    const intermediateLanguages = ['Go', 'Java', 'Swift', 'Kotlin', 'TypeScript'];
    
    if (advancedLanguages.includes(language)) score += 3;
    else if (intermediateLanguages.includes(language)) score += 2;
    else score += 1;
    
    const advancedKeywords = ['distributed', 'scalable', 'enterprise', 'production', 'advanced', 'complex', 'architecture'];
    const beginnerKeywords = ['simple', 'basic', 'tutorial', 'learning', 'beginner', 'starter', 'intro'];
    
    const lowerDesc = description?.toLowerCase() || '';
    if (advancedKeywords.some(kw => lowerDesc.includes(kw))) score += 2;
    if (beginnerKeywords.some(kw => lowerDesc.includes(kw))) score -= 2;
    
    if (score >= 7) return 'HARD';
    if (score >= 4) return 'MEDIUM';
    return 'EASY';
}

async function searchGitHub(query: string, language?: string, perPage: number = 30): Promise<any[]> {
    try {
        const headers: any = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ProjectHub-Scraper'
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
        if (error.response?.status === 403) {
            console.error('⚠️  Rate limit exceeded. Waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            return [];
        }
        console.error(`Error searching GitHub for "${query}":`, error.message);
        return [];
    }
}

async function searchByTopic(topic: string, perPage: number = 30): Promise<any[]> {
    try {
        const headers: any = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ProjectHub-Scraper'
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
        if (error.response?.status === 403) {
            console.error('⚠️  Rate limit exceeded. Waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            return [];
        }
        console.error(`Error searching by topic "${topic}":`, error.message);
        return [];
    }
}

async function fetchProjectsForDomain(config: DomainConfig, targetCount: number = 100): Promise<GitHubProject[]> {
    console.log(`\n📦 Fetching projects for ${config.name}...`);
    
    const allProjects = new Map<string, GitHubProject>();
    
    // Search by queries with languages
    for (const query of config.searchQueries) {
        if (allProjects.size >= targetCount) break;
        
        console.log(`  🔍 Searching: "${query}" (${allProjects.size}/${targetCount})`);
        
        // Try with different languages
        for (const language of config.languages) {
            if (allProjects.size >= targetCount) break;
            
            const results = await searchGitHub(query, language, 15);
            
            for (const repo of results) {
                if (allProjects.size >= targetCount) break;
                
                if (!repo.description || repo.archived || repo.disabled) continue;
                
                const project: GitHubProject = {
                    name: repo.name,
                    description: repo.description.substring(0, 500),
                    url: repo.html_url,
                    stars: repo.stargazers_count,
                    language: repo.language || language,
                    topics: repo.topics || [],
                    difficulty: determineDifficulty(repo.stargazers_count, repo.language, repo.description)
                };
                
                allProjects.set(repo.html_url, project);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Search by topics to fill remaining
    if (allProjects.size < targetCount) {
        for (const topic of config.topics) {
            if (allProjects.size >= targetCount) break;
            
            console.log(`  🏷️  Topic: "${topic}" (${allProjects.size}/${targetCount})`);
            
            const results = await searchByTopic(topic, 20);
            
            for (const repo of results) {
                if (allProjects.size >= targetCount) break;
                
                if (!repo.description || repo.archived || repo.disabled) continue;
                
                const project: GitHubProject = {
                    name: repo.name,
                    description: repo.description.substring(0, 500),
                    url: repo.html_url,
                    stars: repo.stargazers_count,
                    language: repo.language || config.languages[0],
                    topics: repo.topics || [],
                    difficulty: determineDifficulty(repo.stargazers_count, repo.language, repo.description)
                };
                
                allProjects.set(repo.html_url, project);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    const projects = Array.from(allProjects.values());
    console.log(`  ✅ Found ${projects.length} unique projects for ${config.name}`);
    
    return projects;
}

async function seedDatabase() {
    try {
        console.log('🚀 Starting Project Seeding Process...\n');
        console.log('📋 Client Requirements: 100 projects per domain');
        console.log('🎯 Total Target: 500 projects\n');
        
        if (GITHUB_TOKEN) {
            console.log('✅ GitHub Token detected - Higher rate limits available\n');
        } else {
            console.log('⚠️  No GitHub Token - Using limited rate (60 requests/hour)\n');
        }
        
        let totalSeeded = 0;
        
        for (const domainConfig of DOMAIN_CONFIGS) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🎯 Processing Domain: ${domainConfig.name}`);
            console.log('='.repeat(60));
            
            // Get domain from database
            const domain = await prisma.domain.findUnique({
                where: { slug: domainConfig.slug }
            });
            
            if (!domain) {
                console.error(`❌ Domain not found: ${domainConfig.slug}`);
                continue;
            }
            
            // Check existing projects
            const existingCount = await prisma.gitHubProject.count({
                where: { domainId: domain.id }
            });
            
            console.log(`📊 Existing projects: ${existingCount}`);
            
            const needed = Math.max(0, 100 - existingCount);
            
            if (needed === 0) {
                console.log(`✅ Domain already has 100+ projects. Skipping.`);
                continue;
            }
            
            console.log(`📥 Need to fetch: ${needed} more projects`);
            
            // Fetch projects from GitHub
            const projects = await fetchProjectsForDomain(domainConfig, needed + 20); // Fetch extra for dedup
            
            // Filter out duplicates that might already exist
            const existingUrls = await prisma.gitHubProject.findMany({
                where: { domainId: domain.id },
                select: { repoUrl: true }
            });
            
            const existingUrlSet = new Set(existingUrls.map(p => p.repoUrl));
            const newProjects = projects.filter(p => !existingUrlSet.has(p.url)).slice(0, needed);
            
            console.log(`\n💾 Seeding ${newProjects.length} new projects...`);
            
            let seeded = 0;
            for (const project of newProjects) {
                try {
                    const tempId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                    const slug = createSlug(project.name, tempId);
                    
                    await prisma.gitHubProject.create({
                        data: {
                            title: project.name.substring(0, 255),
                            slug: slug,
                            description: project.description || `${project.name} - A ${domainConfig.name} project`,
                            repoUrl: project.url,
                            repoOwner: project.url.split('/')[3] || 'unknown',
                            repoName: project.url.split('/')[4] || 'unknown',
                            defaultBranch: 'main',
                            downloadUrl: `${project.url}/archive/refs/heads/main.zip`,
                            liveUrl: project.url,
                            difficulty: project.difficulty,
                            language: project.language,
                            techStack: [project.language, ...project.topics.slice(0, 4)],
                            topics: project.topics.slice(0, 10),
                            stars: project.stars,
                            domainId: domain.id,
                            author: project.url.split('/')[3] || 'GitHub User'
                        }
                    });
                    
                    seeded++;
                    
                    if (seeded % 10 === 0) {
                        console.log(`  ✓ Seeded ${seeded}/${newProjects.length} projects...`);
                    }
                } catch (error: any) {
                    console.error(`  ⚠️  Failed to seed ${project.name}:`, error.message);
                }
            }
            
            totalSeeded += seeded;
            
            const finalCount = await prisma.gitHubProject.count({
                where: { domainId: domain.id }
            });
            
            console.log(`\n✅ ${domainConfig.name}: ${finalCount} total projects (added ${seeded})`);
        }
        
        console.log(`\n${'='.repeat(60)}`);
        console.log('🎉 SEEDING COMPLETE!');
        console.log('='.repeat(60));
        console.log(`📊 Total new projects added: ${totalSeeded}`);
        
        // Final summary
        console.log('\n📈 Final Project Count by Domain:');
        for (const config of DOMAIN_CONFIGS) {
            const domain = await prisma.domain.findUnique({
                where: { slug: config.slug },
                include: {
                    _count: {
                        select: { githubProjects: true }
                    }
                }
            });
            
            if (domain) {
                const count = domain._count.githubProjects;
                const status = count >= 100 ? '✅' : '⚠️ ';
                console.log(`  ${status} ${config.name}: ${count} projects`);
            }
        }
        
        const grandTotal = await prisma.gitHubProject.count();
        console.log(`\n🎯 Grand Total: ${grandTotal} projects in database`);
        
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedDatabase();
