import axios from 'axios';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  homepage: string | null;
  updated_at: string;
  default_branch: string;
  owner: {
    login: string;
  };
}

interface GitHubSearchResponse {
  items: GitHubRepo[];
  total_count: number;
}

// Domain to GitHub topics mapping - ONLY FOR 5 MAIN DOMAINS
const DOMAIN_TOPICS: Record<string, string[]> = {
  // Web Development
  'web-development': [
    'webapp', 'web-application', 'fullstack', 'frontend', 'backend',
    'reactjs', 'nextjs', 'nodejs', 'express', 'vue', 'angular',
    'ecommerce', 'cms', 'blog', 'dashboard'
  ],
  // Artificial Intelligence
  'artificial-intelligence': [
    'artificial-intelligence', 'ai', 'neural-network', 'computer-vision',
    'nlp', 'chatbot', 'image-recognition', 'speech-recognition',
    'reinforcement-learning', 'generative-ai', 'llm'
  ],
  // Machine Learning
  'machine-learning': [
    'machine-learning', 'ml', 'deep-learning', 'tensorflow', 'pytorch',
    'scikit-learn', 'ml-model', 'supervised-learning', 'unsupervised-learning',
    'neural-networks', 'keras', 'xgboost'
  ],
  // Data Science
  'data-science': [
    'data-analysis', 'data-visualization', 'pandas', 'jupyter',
    'analytics', 'statistics', 'data-mining', 'big-data',
    'data-processing', 'visualization', 'dashboard'
  ],
  // Cybersecurity
  'cybersecurity': [
    'security', 'cybersecurity', 'penetration-testing', 'vulnerability-scanner',
    'ethical-hacking', 'infosec', 'cryptography', 'network-security',
    'web-security', 'malware-analysis', 'forensics', 'ctf'
  ]
};

export class GitHubApiService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly token = process.env.GITHUB_TOKEN || ''; // Optional: for higher rate limits
  
  private readonly headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...(this.token && { 'Authorization': `token ${this.token}` })
  };

  /**
   * Fetch real, high-quality GitHub repositories for a domain
   * @param domainSlug - Domain identifier (e.g., 'cyber-security')
   * @param minStars - Minimum stars required (default: 50 for quality)
   * @param limit - Maximum number of repos to fetch
   */
  async fetchRepositoriesForDomain(
    domainSlug: string,
    minStars: number = 50,
    limit: number = 100
  ): Promise<GitHubRepo[]> {
    const topics = DOMAIN_TOPICS[domainSlug as keyof typeof DOMAIN_TOPICS] || [];
    
    if (topics.length === 0) {
      throw new Error(`No topics mapped for domain: ${domainSlug}`);
    }

    const allRepos: GitHubRepo[] = [];
    const repoIds = new Set<number>(); // Prevent duplicates

    // Fetch repos for each topic to get 100+ diverse projects
    for (const topic of topics.slice(0, 4)) { // Use top 4 topics
      try {
        const query = `topic:${topic} stars:>=${minStars} archived:false`;
        const url = `${this.baseUrl}/search/repositories`;
        
        const response = await axios.get<GitHubSearchResponse>(url, {
          headers: this.headers,
          params: {
            q: query,
            sort: 'stars',
            order: 'desc',
            per_page: 30 // Fetch 30 per topic
          }
        });

        // Add unique repos
        for (const repo of response.data.items) {
          if (!repoIds.has(repo.id) && allRepos.length < limit) {
            repoIds.add(repo.id);
            allRepos.push(repo);
          }
        }

        // Rate limit protection
        await this.sleep(1000);
        
        if (allRepos.length >= limit) break;
      } catch (error: any) {
        const errorMsg = error.response?.status === 401 
          ? `Authentication required. Please add GITHUB_TOKEN to .env file. Get token from: https://github.com/settings/tokens`
          : error.message;
        console.error(`Error fetching repos for topic ${topic}:`, errorMsg);
      }
    }

    return allRepos.slice(0, limit);
  }

  /**
   * Get detailed information for a specific repository
   */
  async getRepositoryDetails(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}`;
      const response = await axios.get<GitHubRepo>(url, {
        headers: this.headers
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching repo ${owner}/${repo}:`, error.message);
      return null;
    }
  }

  /**
   * Generate direct ZIP download URL for a repository
   */
  generateDownloadUrl(owner: string, repo: string, branch: string = 'main'): string {
    return `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  }

  /**
   * Verify if a repository exists and is accessible
   */
  async verifyRepository(owner: string, repo: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}`;
      await axios.head(url, { headers: this.headers });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if download URL is valid
   */
  async verifyDownloadUrl(downloadUrl: string): Promise<boolean> {
    try {
      const response = await axios.head(downloadUrl, { timeout: 5000 });
      return response.status === 200 || response.status === 302;
    } catch {
      return false;
    }
  }

  /**
   * Determine difficulty based on repo characteristics
   */
  determineDifficulty(repo: GitHubRepo): 'EASY' | 'MEDIUM' | 'HARD' {
    const stars = repo.stargazers_count;
    const topics = repo.topics || [];
    
    // Check for beginner indicators
    const beginnerKeywords = ['beginner', 'tutorial', 'starter', 'simple', 'basic', 'intro'];
    const isBeginnerFriendly = topics.some(t => 
      beginnerKeywords.some(k => t.toLowerCase().includes(k))
    );
    
    if (isBeginnerFriendly || stars < 500) return 'EASY';
    if (stars < 5000) return 'MEDIUM';
    return 'HARD';
  }

  /**
   * Extract tech stack from repository data
   */
  extractTechStack(repo: GitHubRepo): string[] {
    const techStack: string[] = [];
    
    // Primary language
    if (repo.language) {
      techStack.push(repo.language);
    }
    
    // From topics
    const techTopics = repo.topics.filter(t => 
      !['beginner', 'tutorial', 'awesome', 'list', 'resources'].includes(t.toLowerCase())
    );
    
    techStack.push(...techTopics.slice(0, 5));
    
    return [...new Set(techStack)]; // Remove duplicates
  }

  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all available topics for a domain
   */
  getTopicsForDomain(domainSlug: string): string[] {
    return DOMAIN_TOPICS[domainSlug as keyof typeof DOMAIN_TOPICS] || [];
  }
}

export const githubApiService = new GitHubApiService();
