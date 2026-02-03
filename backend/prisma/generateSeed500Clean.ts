import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  default_branch: string;
  owner: {
    login: string;
  };
}

interface DomainConfig {
  slug: string;
  queries: string[];
  difficulty: ('EASY' | 'MEDIUM' | 'HARD')[];
}

const domains: DomainConfig[] = [
  {
    slug: 'web-development',
    queries: [
      'react stars:>5000',
      'vue stars:>5000',
      'angular stars:>3000',
      'nextjs stars:>3000',
      'svelte stars:>2000',
      'express stars:>3000',
      'django stars:>3000',
      'flask stars:>3000',
      'laravel stars:>3000',
      'rails stars:>3000',
    ],
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
  },
  {
    slug: 'cybersecurity',
    queries: [
      'security stars:>1000',
      'penetration-testing stars:>1000',
      'vulnerability stars:>500',
      'encryption stars:>1000',
      'authentication stars:>1000',
    ],
    difficulty: ['MEDIUM', 'HARD'],
  },
  {
    slug: 'artificial-intelligence',
    queries: [
      'deep-learning stars:>3000',
      'neural-network stars:>2000',
      'computer-vision stars:>2000',
      'nlp stars:>2000',
      'ai stars:>3000',
    ],
    difficulty: ['MEDIUM', 'HARD'],
  },
  {
    slug: 'machine-learning',
    queries: [
      'machine-learning stars:>2000',
      'ml stars:>1000',
      'gradient-boosting stars:>1000',
      'decision-tree stars:>500',
      'clustering stars:>500',
    ],
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
  },
  {
    slug: 'data-science',
    queries: [
      'data-analysis stars:>2000',
      'data-visualization stars:>2000',
      'pandas stars:>2000',
      'data-processing stars:>1000',
      'big-data stars:>1000',
    ],
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
  },
];

async function fetchGitHubProjects(query: string): Promise<GitHubRepo[]> {
  try {
    console.log(`    Fetching: ${query}`);
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 20,
      },
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return response.data.items;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`    Error: ${error.message}`);
      if (error.response?.status === 403) {
        console.log('    Rate limit hit. Waiting 60 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return fetchGitHubProjects(query);
      }
    }
    return [];
  }
}

function getRandomDifficulty(difficulties: ('EASY' | 'MEDIUM' | 'HARD')[]): string {
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function cleanDescription(str: string): string {
  if (!str) return 'GitHub project';
  // Remove emojis and special unicode
  let cleaned = str.replace(/[^\x00-\x7F]/g, '');
  // Remove quotes and special chars
  cleaned = cleaned.replace(/'/g, '');
  cleaned = cleaned.replace(/"/g, '');
  cleaned = cleaned.replace(/\\/g, '');
  cleaned = cleaned.replace(/\n/g, ' ');
  // Limit length
  return cleaned.substring(0, 200).trim();
}

async function generateInsertStatements(
  project: GitHubRepo,
  domainVar: string,
  difficulty: string
): Promise<string> {
  const title = project.name;
  const description = cleanDescription(project.description ?? '');
  const repoUrl = project.html_url;
  const repoOwner = project.owner.login;
  const repoName = project.name;
  const defaultBranch = project.default_branch || 'main';
  const downloadUrl = `${project.html_url}/archive/refs/heads/${defaultBranch}.zip`;
  const liveUrl = project.homepage ? `'${project.homepage}'` : 'NULL';
  const language = project.language || 'Unknown';
  const techStack = project.language ? `ARRAY['${project.language}']` : "ARRAY['Unknown']";
  const topics = project.topics.length > 0 
    ? `ARRAY[${project.topics.slice(0, 3).map(t => `'${t}'`).join(', ')}]`
    : `ARRAY['github']`;

  return `(gen_random_uuid(), '${title}', '${description}', '${repoUrl}', '${repoOwner}', '${repoName}', '${defaultBranch}', '${downloadUrl}', ${liveUrl}, ${domainVar}, ${project.stargazers_count}, ${project.forks_count}, '${language}', ${techStack}, '${difficulty}', ${topics}, NOW(), NOW(), NOW())`;
}

async function collectProjects(
  domainSlug: string,
  queries: string[],
  difficulties: ('EASY' | 'MEDIUM' | 'HARD')[],
  targetCount: number
): Promise<string[]> {
  console.log(`\n🔄 Collecting ${domainSlug}...`);

  const allProjects: GitHubRepo[] = [];
  const seenRepos = new Set<string>();

  for (const query of queries) {
    const projects = await fetchGitHubProjects(query);
    
    for (const project of projects) {
      if (!seenRepos.has(project.full_name) && allProjects.length < targetCount * 2) {
        seenRepos.add(project.full_name);
        allProjects.push(project);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (allProjects.length >= targetCount) {
      break;
    }
  }

  const projectsToSeed = allProjects.slice(0, targetCount);
  console.log(`  ✓ Collected ${projectsToSeed.length} unique projects`);

  const domainVar = domainSlug.replace(/-/g, '_') + '_id';
  const statements: string[] = [];

  for (let i = 0; i < projectsToSeed.length; i++) {
    const stmt = await generateInsertStatements(
      projectsToSeed[i],
      domainVar,
      getRandomDifficulty(difficulties)
    );
    statements.push(stmt);
  }

  return statements;
}

async function main() {
  console.log('🚀 Generating SQL seed file with 500 unique real GitHub projects...\n');

  let sql = `-- Delete all existing GitHub projects
DELETE FROM github_projects;

-- Get domain IDs
DO $$
DECLARE
    cybersecurity_id TEXT;
    web_development_id TEXT;
    artificial_intelligence_id TEXT;
    machine_learning_id TEXT;
    data_science_id TEXT;
BEGIN
    SELECT id INTO cybersecurity_id FROM domains WHERE slug = 'cybersecurity' LIMIT 1;
    SELECT id INTO web_development_id FROM domains WHERE slug = 'web-development' LIMIT 1;
    SELECT id INTO artificial_intelligence_id FROM domains WHERE slug = 'artificial-intelligence' LIMIT 1;
    SELECT id INTO machine_learning_id FROM domains WHERE slug = 'machine-learning' LIMIT 1;
    SELECT id INTO data_science_id FROM domains WHERE slug = 'data-science' LIMIT 1;

`;

  for (const domain of domains) {
    const statements = await collectProjects(
      domain.slug,
      domain.queries,
      domain.difficulty,
      100
    );

    const domainLabel = domain.slug.toUpperCase().replace(/-/g, ' ');
    sql += `    -- ${domainLabel} (100 projects)\n`;
    sql += `    INSERT INTO github_projects (id, title, description, "repoUrl", "repoOwner", "repoName", "defaultBranch", "downloadUrl", "liveUrl", "domainId", stars, forks, language, "techStack", difficulty, topics, "lastUpdated", "createdAt", "updatedAt") VALUES\n`;
    
    for (let i = 0; i < statements.length; i++) {
      sql += `    ${statements[i]}`;
      sql += i === statements.length - 1 ? ';\n\n' : ',\n';
    }
  }

  sql += 'END $$;';

  const outputPath = path.join(__dirname, 'seed_500_clean.sql');
  fs.writeFileSync(outputPath, sql, 'utf-8');

  console.log(`\n✅ SQL file generated: ${outputPath}`);
  console.log(`   Total size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  console.log('\n📋 Next steps:');
  console.log('1. Copy the contents of seed_500_clean.sql');
  console.log('2. Open Supabase SQL Editor: https://supabase.com/dashboard/project/miwhxvpatqaflcxqvknu/sql/new');
  console.log('3. Paste and run the SQL');
}

main().catch(console.error);
