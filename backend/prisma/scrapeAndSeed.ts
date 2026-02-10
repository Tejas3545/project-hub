/**
 * Scrape real GitHub repositories and seed the database with 200 unique projects per domain.
 * Each project gets unique 7-section content derived from the actual repo metadata.
 */
import { PrismaClient, Difficulty } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const PROJECTS_PER_DOMAIN = 200;

if (!GITHUB_TOKEN) {
  console.error('ERROR: GITHUB_TOKEN not found in .env');
  process.exit(1);
}

// ============================================================
// TYPES
// ============================================================
interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  description: string | null; 
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  homepage: string | null;
  default_branch: string;
  html_url: string;
  archived: boolean;
  fork: boolean;
}

// ============================================================
// DOMAIN CONFIGURATION
// ============================================================
const DOMAINS = {
  web:   { id: 'web-dev',       name: 'Web Development',          slug: 'web-development',          description: 'Full-stack web applications, frontend frameworks, backend APIs, and modern web technologies' },
  ai:    { id: 'ai',            name: 'Artificial Intelligence',   slug: 'artificial-intelligence',  description: 'Deep learning, NLP, computer vision, generative AI, and intelligent systems' },
  ml:    { id: 'ml',            name: 'Machine Learning',          slug: 'machine-learning',         description: 'Supervised and unsupervised learning, model training, MLOps, and prediction systems' },
  ds:    { id: 'data-science',  name: 'Data Science',              slug: 'data-science',             description: 'Data analysis, visualization, pipelines, statistical modeling, and big data processing' },
  cyber: { id: 'cyber',         name: 'Cybersecurity',             slug: 'cybersecurity',            description: 'Security tools, penetration testing, vulnerability scanning, encryption, and forensics' },
};

// Search queries per domain – enough variety to find 200+ unique repos each
const DOMAIN_QUERIES: Record<string, string[]> = {
  web: [
    'topic:web-development stars:>800',
    'topic:react stars:>2000',
    'topic:nextjs stars:>800',
    'topic:vuejs stars:>800',
    'topic:angular stars:>800',
    'topic:svelte stars:>400',
    'topic:nodejs stars:>2000',
    'topic:express stars:>500',
    'topic:django stars:>800',
    'topic:flask stars:>400',
    'topic:ecommerce stars:>300',
    'topic:fullstack stars:>200',
    'topic:dashboard stars:>300',
    'topic:cms stars:>400',
    'topic:graphql stars:>500',
    'topic:tailwindcss stars:>400',
    'topic:typescript web stars:>1000',
    'topic:pwa stars:>300',
    'topic:jamstack stars:>200',
    'topic:rest-api stars:>300',
  ],
  ai: [
    'topic:artificial-intelligence stars:>500',
    'topic:deep-learning stars:>800',
    'topic:nlp stars:>400',
    'topic:computer-vision stars:>400',
    'topic:chatbot stars:>300',
    'topic:neural-network stars:>400',
    'topic:generative-ai stars:>200',
    'topic:llm stars:>300',
    'topic:transformer stars:>300',
    'topic:object-detection stars:>300',
    'topic:speech-recognition stars:>200',
    'topic:face-recognition stars:>200',
    'topic:image-classification stars:>200',
    'topic:reinforcement-learning stars:>300',
    'topic:stable-diffusion stars:>200',
    'topic:text-generation stars:>200',
    'topic:sentiment-analysis stars:>200',
    'topic:question-answering stars:>100',
    'topic:image-segmentation stars:>200',
    'topic:gpt stars:>200',
  ],
  ml: [
    'topic:machine-learning stars:>800',
    'topic:scikit-learn stars:>200',
    'topic:pytorch stars:>800',
    'topic:tensorflow stars:>800',
    'topic:classification stars:>200',
    'topic:time-series stars:>200',
    'topic:recommendation-system stars:>200',
    'topic:anomaly-detection stars:>200',
    'topic:xgboost stars:>200',
    'topic:automl stars:>200',
    'topic:mlops stars:>200',
    'topic:model-serving stars:>100',
    'topic:feature-engineering stars:>100',
    'topic:gradient-boosting stars:>100',
    'topic:hyperparameter-optimization stars:>100',
    'topic:keras stars:>300',
    'topic:prediction stars:>100',
    'topic:regression stars:>100',
    'topic:clustering stars:>100',
    'topic:ensemble-learning stars:>50',
  ],
  ds: [
    'topic:data-science stars:>400',
    'topic:data-analysis stars:>300',
    'topic:data-visualization stars:>300',
    'topic:pandas stars:>200',
    'topic:jupyter stars:>300',
    'topic:data-pipeline stars:>200',
    'topic:etl stars:>200',
    'topic:statistics stars:>200',
    'topic:apache-spark stars:>300',
    'topic:data-engineering stars:>200',
    'topic:plotly stars:>200',
    'topic:web-scraping stars:>300',
    'topic:analytics stars:>300',
    'topic:big-data stars:>300',
    'topic:data-cleaning stars:>50',
    'topic:sql stars:>300',
    'topic:airflow stars:>200',
    'topic:notebook stars:>200',
    'topic:business-intelligence stars:>100',
    'topic:streaming stars:>300',
  ],
  cyber: [
    'topic:security stars:>800',
    'topic:cybersecurity stars:>300',
    'topic:penetration-testing stars:>200',
    'topic:vulnerability stars:>200',
    'topic:hacking stars:>300',
    'topic:ctf stars:>200',
    'topic:encryption stars:>200',
    'topic:malware stars:>100',
    'topic:network-security stars:>200',
    'topic:infosec stars:>200',
    'topic:osint stars:>200',
    'topic:forensics stars:>100',
    'topic:reverse-engineering stars:>200',
    'topic:bug-bounty stars:>100',
    'topic:privacy stars:>200',
    'topic:password stars:>100',
    'topic:scanning stars:>100',
    'topic:devsecops stars:>100',
    'topic:siem stars:>50',
    'topic:threat-intelligence stars:>50',
  ],
};

// Subdomain classification keywords
const SUBDOMAIN_MAP: Record<string, Record<string, string[]>> = {
  web: {
    'Frontend':  ['react', 'vue', 'angular', 'svelte', 'frontend', 'ui', 'css', 'tailwind', 'component', 'design-system', 'animation'],
    'Backend':   ['express', 'fastify', 'nestjs', 'django', 'flask', 'rails', 'api', 'graphql', 'rest', 'server', 'middleware', 'authentication'],
    'Full-Stack': ['fullstack', 'full-stack', 'nextjs', 'nuxt', 'remix', 'sveltekit', 'ecommerce', 'cms', 'dashboard', 'admin'],
    'DevOps':    ['docker', 'kubernetes', 'ci-cd', 'deployment', 'devops', 'monitoring', 'infrastructure', 'nginx', 'cloud'],
  },
  ai: {
    'NLP':               ['nlp', 'natural-language', 'text', 'sentiment', 'chatbot', 'language-model', 'gpt', 'llm', 'bert', 'transformer', 'question-answering', 'translation'],
    'Computer Vision':   ['computer-vision', 'image', 'object-detection', 'face', 'segmentation', 'ocr', 'yolo', 'opencv', 'video'],
    'Speech Processing': ['speech', 'voice', 'audio', 'asr', 'tts', 'whisper', 'sound'],
    'Generative Models': ['generative', 'diffusion', 'stable-diffusion', 'gan', 'generation', 'text-to-image', 'creative'],
  },
  ml: {
    'Classification':  ['classification', 'classifier', 'logistic', 'svm', 'decision-tree', 'random-forest', 'xgboost', 'gradient-boosting', 'label'],
    'Regression':      ['regression', 'prediction', 'forecasting', 'price', 'estimation'],
    'Clustering':      ['clustering', 'kmeans', 'dbscan', 'unsupervised', 'segmentation', 'anomaly-detection', 'outlier'],
    'Time Series':     ['time-series', 'timeseries', 'temporal', 'lstm', 'arima', 'prophet', 'forecast'],
  },
  ds: {
    'Data Engineering':     ['pipeline', 'etl', 'airflow', 'spark', 'kafka', 'streaming', 'data-pipeline', 'ingestion', 'warehouse'],
    'Data Visualization':   ['visualization', 'plotly', 'matplotlib', 'chart', 'd3', 'grafana', 'dashboard', 'visual'],
    'Statistical Analysis': ['statistics', 'probability', 'hypothesis', 'bayesian', 'regression', 'inference', 'r-lang'],
    'Business Analytics':   ['analytics', 'business', 'marketing', 'scraping', 'web-scraping', 'sql', 'bi', 'reporting', 'jupyter', 'notebook'],
  },
  cyber: {
    'Offensive Security':    ['penetration', 'pentest', 'exploit', 'hacking', 'ctf', 'metasploit', 'offensive', 'red-team', 'bug-bounty'],
    'Network Security':      ['network', 'firewall', 'ids', 'intrusion', 'packet', 'vpn', 'proxy', 'dns', 'scanning', 'nmap'],
    'Application Security':  ['owasp', 'web-security', 'xss', 'injection', 'authentication', 'encryption', 'password', 'devsecops', 'sast'],
    'Cloud Security':        ['cloud', 'container', 'kubernetes', 'docker', 'compliance', 'iam', 'secrets', 'vault', 'privacy', 'forensics', 'osint', 'malware', 'reverse-engineering', 'threat'],
  },
};

// ============================================================
// PERSONA & TEMPLATE POOLS FOR UNIQUE CONTENT GENERATION
// ============================================================
const FIRST_NAMES = [
  'Sarah','James','Maria','Chen','Priya','Alexander','Fatima','David','Yuki','Marcus',
  'Ana','Raj','Emma','Michael','Sofia','Ahmed','Lisa','Wei','Daniel','Olga',
  'Carlos','Amara','Noah','Zara','Brandon','Mei','Nathaniel','Aisha','Lucas','Keiko',
  'Omar','Isabella','Viktor','Nina','Tariq','Elena','Jackson','Linh','Benjamin','Anya',
  'Gabriel','Suki','Erik','Mira','Felix','Leila','Marco','Jasmine','Dimitri','Thandi',
  'Ravi','Chloe','Hassan','Ingrid','Paulo','Nadia','Thomas','Yara','Liam','Jun',
  'Aaliya','Simon','Rosa','Ivan','Dina','Oscar','Kira','Mateo','Freya','Kofi',
  'Vera','Adrian','Sana','Hugo','Tara','Anton','Zoe','Idris','Hana','Leo',
  'Petra','Emeka','Marta','Rashid','Camille','Sven','Lina','Jorge','Ayumi','Philip',
  'Nora','Amir','Grace','Tobias','Elise','Kwame','Maya','Finn','Lucia','Dante',
  'Annika','Youssef','Beatrice','Stefan','Chika','Ruben','Isla','Henri','Amina','Theo',
  'Serena','Oleg','Wanda','Kamal','Elsa','Diego','Fiona','Nikolai','Lara','Jesse',
  'Bianca','Arjun','Celine','Pavlo','Stella','Emir','Hannah','Dario','Olive','Kai',
  'Rita','Maxwell','Iris','Bao','Margot','Samir','Phoebe','Vladimir','Ines','Curtis',
  'Vivian','Alonso','Greta','Farid','Simone','Heath','Lydia','Esteban','Uma','Cedric',
  'Wendy','Tarquin','Renata','Gil','Esme','Hamza','Aurora','Lukas','Selma','Rio',
  'Clara','Yosef','Maeve','Ilya','Paloma','Orion','Sabrina','Niels','Dalia','Quinn',
  'Tessa','Aiden','Carla','Ezra','Flora','Nico','Harlow','Cy','Adriana','Jude',
  'Penelope','Shane','Milena','Bruno','Astrid','Reed','Valentina','Cosmo','Naomi','Ellis',
  'Rosalind','Matteo','Briar','Leandro','Sylvie','Declan','Maren','Idris','Corinne','Bodhi',
];

const ROLES = [
  'software engineer at','startup founder of','product manager at','data analyst at','UX designer at',
  'DevOps lead at','CTO of','freelance developer for','engineering team lead at','professor at',
  'graduate researcher at','security analyst at','system administrator at','project manager at','solutions architect at',
  'mobile developer at','backend engineer at','frontend developer at','full-stack developer at','ML engineer at',
  'data scientist at','cloud architect at','technical lead at','community manager at','open-source maintainer of',
  'IT director at','QA lead at','platform engineer at','developer advocate at','VP of Engineering at',
  'site reliability engineer at','database administrator at','infrastructure engineer at','tech lead at','research engineer at',
  'application developer at','automation engineer at','integration specialist at','digital transformation lead at','innovation manager at',
];

const ORGS = [
  'a fast-growing SaaS startup','a mid-size e-commerce company','a leading healthcare network','a regional logistics firm',
  'a fintech startup','a university research lab','a media publishing house','a government digital services team',
  'a social impact nonprofit','a retail chain with 200+ stores','a global insurance company','an AI-focused startup',
  'a manufacturing plant','a real estate platform','a food delivery service','a travel booking platform',
  'a legal tech firm','an EdTech company','a cybersecurity consultancy','a renewable energy startup',
  'a pharmaceutical company','an online marketplace','a gaming studio','a bank\'s innovation lab',
  'an agricultural technology company','a telecommunications provider','a smart city initiative','a digital health platform',
  'a content streaming service','an autonomous vehicle company','a supply chain management firm','a hotel chain',
  'a fitness technology startup','a climate-tech organization','a music streaming platform','an insurance technology firm',
  'a defense contractor','a sports analytics company','a construction technology startup','a public transit agency',
];

// Impact templates – parameterized by what the project relates to
const IMPACTS = [
  'This was costing the team over 20 hours per week in manual effort',
  'The lack of automation led to a 30% drop in operational efficiency',
  'Customer complaints had risen by 45% in the last quarter due to this gap',
  'Over $150K in annual revenue was being lost because of these inefficiencies',
  'Team productivity had plateaued, and onboarding new members took 3x longer than expected',
  'Error rates had climbed to 12%, causing production incidents every other week',
  'Users were abandoning the platform at a 60% rate during the critical workflow',
  'The manual process was error-prone and could not scale beyond 500 daily operations',
  'Security vulnerabilities were being discovered weeks after deployment, creating compliance risk',
  'Data silos across departments meant decisions were based on incomplete, stale information',
  'The legacy system could not handle the 5x traffic increase after the product went viral',
  'Integration failures between services caused 8 hours of downtime per month on average',
  'Response times had degraded to over 10 seconds, and user satisfaction scores dropped to 2.1 out of 5',
  'The lack of observability meant issues were only found after customers reported them',
  'Manual testing covered only 15% of the codebase, leading to frequent regressions',
  'Knowledge was siloed in one team member, creating a critical bus-factor risk',
  'The company was spending 40% of its engineering budget maintaining legacy infrastructure',
  'Competitors had already shipped similar features six months ago, threatening market share',
  'Regulatory compliance requirements were impossible to meet with the existing tooling',
  'The prototype worked for 10 users but collapsed entirely when scaled to 10,000',
];

const DELIVERABLE_SETS: string[][] = [
  ['Fully functional web application with responsive design', 'Source code hosted on GitHub with comprehensive README', 'Database schema documentation', 'API documentation with example requests', 'Deployment guide for cloud hosting'],
  ['Working software system with automated tests', 'Source code repository with CI/CD pipeline', 'Architecture diagram and technical design document', 'User guide with screenshots', 'Performance benchmarks and optimization report'],
  ['Complete application with all core features implemented', 'GitHub repository with clean commit history', 'Technical documentation covering system design', '2-minute video demo showcasing key features', 'Setup and installation guide'],
  ['Production-ready application with error handling', 'Documented source code with inline comments', 'Test suite with >70% code coverage', 'Docker containerization for easy deployment', 'Project retrospective document'],
  ['End-to-end working prototype', 'Well-structured codebase following best practices', 'API/SDK documentation', 'Sample data and seed scripts', 'Presentation slides summarizing approach and learnings'],
  ['Functional MVP with all specified features', 'Source code with modular architecture', 'Data model documentation', 'Integration testing results', 'Deployment instructions for production environment'],
  ['Complete system with user authentication and authorization', 'GitHub repo with branching strategy documented', 'REST/GraphQL API reference', 'Load testing results', 'Security audit checklist'],
  ['Working application with real-time features', 'Clean codebase following SOLID principles', 'System architecture documentation', 'User acceptance test results', 'Monitoring and logging setup guide'],
  ['Fully tested application with edge case handling', 'Source code with automated build pipeline', 'Database migration scripts', 'Performance profiling report', 'Incident response runbook'],
  ['Scalable application with caching layer', 'Documented codebase with contributing guidelines', 'API versioning strategy document', 'Accessibility compliance report', 'Cost estimation for cloud deployment'],
];

// ============================================================
// GITHUB API FUNCTIONS
// ============================================================
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchGitHub(query: string): Promise<GitHubRepo[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query + ' fork:false')}&sort=stars&order=desc&per_page=100`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'project-hub-seeder',
      },
    });
    if (res.status === 403) {
      console.warn('  Rate limited. Waiting 60s...');
      await sleep(60000);
      return searchGitHub(query);
    }
    if (!res.ok) {
      console.warn(`  Search failed (${res.status}): ${query}`);
      return [];
    }
    const data: any = await res.json();
    return (data.items || []) as GitHubRepo[];
  } catch (err) {
    console.warn(`  Network error for query: ${query}`);
    return [];
  }
}

function isValidRepo(repo: GitHubRepo): boolean {
  if (!repo.description || repo.description.length < 15) return false;
  if (repo.archived) return false;
  if (repo.fork) return false;
  const desc = repo.description.toLowerCase();
  const name = repo.name.toLowerCase();
  // Filter out awesome-lists, cheatsheets, tutorials, interview prep, etc.
  if (name.startsWith('awesome') || name.includes('cheatsheet') || name.includes('interview')) return false;
  if (desc.startsWith('a curated list') || desc.startsWith('a list of') || desc.includes('awesome list')) return false;
  if (desc.includes('cheat sheet') || desc.includes('interview questions') || desc.includes('learning resources')) return false;
  if (desc.includes('collection of') && desc.includes('links')) return false;
  return true;
}

async function fetchReposForDomain(domainKey: string, usedIds: Set<number>): Promise<GitHubRepo[]> {
  const queries = DOMAIN_QUERIES[domainKey];
  const repos: Map<number, GitHubRepo> = new Map();

  for (const query of queries) {
    console.log(`    Searching: ${query}`);
    const results = await searchGitHub(query);
    for (const repo of results) {
      if (!usedIds.has(repo.id) && !repos.has(repo.id) && isValidRepo(repo)) {
        repos.set(repo.id, repo);
      }
    }
    console.log(`    Found ${results.length} results, ${repos.size} unique valid so far`);
    await sleep(2200); // Respect rate limit (30/min)

    if (repos.size >= PROJECTS_PER_DOMAIN + 50) {
      console.log(`    Got enough repos (${repos.size}), stopping early`);
      break;
    }
  }

  // Sort by stars descending, take top N
  const sorted = Array.from(repos.values())
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, PROJECTS_PER_DOMAIN);

  // Mark as used globally
  for (const r of sorted) usedIds.add(r.id);

  return sorted;
}

// ============================================================
// CONTENT GENERATION ENGINE
// ============================================================
function titleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/\b(Api|Ui|Cli|Sdk|Ai|Ml|Nlp|Iot|Sql|Css|Html|Jwt|Oauth|Llm|Gpt)\b/gi, m => m.toUpperCase());
  }

function generateTitle(repo: GitHubRepo): string {
  const cleanName = titleCase(repo.name);
  if (repo.description && repo.description.length > 0) {
    // Use first sentence of description, up to 80 chars
    let desc = repo.description.replace(/[:\-–—]\s*$/, '').trim();
    const firstSentence = desc.split(/[.!]/)[0].trim();
    if (firstSentence.length <= 80) {
      return `${cleanName} – ${firstSentence}`;
    }
    return `${cleanName} – ${firstSentence.substring(0, 77)}...`;
  }
  return cleanName;
}

function classifySubdomain(repo: GitHubRepo, domainKey: string): string {
  const map = SUBDOMAIN_MAP[domainKey];
  const tokens = [
    ...(repo.topics || []),
    ...(repo.description || '').toLowerCase().split(/\W+/),
    (repo.language || '').toLowerCase(),
  ];

  let bestMatch = '';
  let bestScore = 0;
  for (const [subdomain, keywords] of Object.entries(map)) {
    const score = keywords.filter(kw => tokens.some(t => t.includes(kw))).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = subdomain;
    }
  }
  // Fallback to first subdomain if no match
  if (!bestMatch) {
    const subdomains = Object.keys(map);
    bestMatch = subdomains[repo.id % subdomains.length];
  }
  return bestMatch;
}

function classifyDifficulty(repo: GitHubRepo): Difficulty {
  const desc = (repo.description || '').toLowerCase();
  const topics = repo.topics || [];
  // Complex: deep learning, distributed, enterprise, production, scalable
  const hardSignals = ['distributed', 'enterprise', 'production', 'scalable', 'kubernetes', 'microservices', 'deep-learning', 'compiler', 'operating-system', 'blockchain'];
  const easySignals = ['beginner', 'simple', 'lightweight', 'minimal', 'starter', 'template', 'boilerplate', 'todo', 'basic'];
  const hardScore = hardSignals.filter(s => desc.includes(s) || topics.includes(s)).length;
  const easyScore = easySignals.filter(s => desc.includes(s) || topics.includes(s)).length;
  if (hardScore >= 2 || repo.stargazers_count > 20000) return 'HARD';
  if (easyScore >= 1 || repo.stargazers_count < 500) return 'EASY';
  return 'MEDIUM';
}

function generateCaseStudy(repo: GitHubRepo, globalIndex: number): string {
  const name = FIRST_NAMES[globalIndex % FIRST_NAMES.length];
  const role = ROLES[(globalIndex * 7 + 3) % ROLES.length];
  const org = ORGS[(globalIndex * 13 + 5) % ORGS.length];
  const impact = IMPACTS[(globalIndex * 11 + 7) % IMPACTS.length];

  const desc = repo.description || repo.name;

  // Build a situation from the repo's actual purpose
  const situation = buildSituation(desc, repo.topics, repo.language);

  return `${name}, a ${role} ${org}, was struggling with a critical challenge: ${situation}. ${impact}. ${name} needed a robust, well-architected solution that could ${extractGoal(desc)} and scale with growing demands.`;
}

function buildSituation(description: string, topics: string[], language: string | null): string {
  const desc = description.toLowerCase();
  // Create a contextual situation from what the project does
  if (desc.includes('web') || desc.includes('frontend') || desc.includes('ui'))
    return `building a modern, responsive web interface that ${description.toLowerCase()}`;
  if (desc.includes('api') || desc.includes('backend') || desc.includes('server'))
    return `designing a reliable backend system to ${description.toLowerCase()}`;
  if (desc.includes('machine learning') || desc.includes('ml') || desc.includes('model'))
    return `implementing machine learning capabilities to ${description.toLowerCase()}`;
  if (desc.includes('data') || desc.includes('analytics') || desc.includes('visualization'))
    return `harnessing data effectively to ${description.toLowerCase()}`;
  if (desc.includes('security') || desc.includes('vulnerability') || desc.includes('encryption'))
    return `securing their infrastructure against threats — specifically needing to ${description.toLowerCase()}`;
  if (desc.includes('deploy') || desc.includes('docker') || desc.includes('kubernetes'))
    return `streamlining deployment and operations for a system that ${description.toLowerCase()}`;
  if (desc.includes('chat') || desc.includes('messaging') || desc.includes('real-time'))
    return `enabling real-time communication through a tool that ${description.toLowerCase()}`;
  if (desc.includes('test') || desc.includes('quality') || desc.includes('ci'))
    return `improving software quality through a system that ${description.toLowerCase()}`;
  return `finding the right tool to ${description.toLowerCase()}`;
}

function extractGoal(description: string): string {
  const desc = description.toLowerCase();
  if (desc.length > 100) return description.substring(0, 97).trim() + '...';
  return description.toLowerCase();
}

function generateProblemStatement(repo: GitHubRepo, globalIndex: number): string {
  const desc = repo.description || repo.name;
  const lang = repo.language || 'multiple languages';
  const topics = (repo.topics || []).slice(0, 5).join(', ');

  const problemContexts = [
    `Existing solutions were either too complex to integrate, too expensive for the budget, or lacked the specific capabilities needed.`,
    `Off-the-shelf tools did not meet the unique requirements, and building from scratch without a clear architecture would lead to unmaintainable code.`,
    `The team lacked a unified approach, resulting in fragmented implementations that were difficult to debug and extend.`,
    `Without proper tooling, the process was manual, error-prone, and could not keep pace with growing demand.`,
    `Legacy systems could not support the new requirements, and migrating without a solid framework risked introducing regressions.`,
    `The current workflow had no automation, making it impossible to iterate quickly or respond to changing needs.`,
    `Multiple teams were reinventing the wheel independently, leading to inconsistent solutions and wasted engineering effort.`,
    `Performance bottlenecks in the existing architecture were causing user-facing degradation that impacted business metrics.`,
    `The absence of observability and monitoring meant issues went undetected until users reported them.`,
    `Security and compliance requirements had evolved, but the existing tooling had not kept pace.`,
  ];

  const ctx = problemContexts[globalIndex % problemContexts.length];

  return `The core challenge is to ${desc.charAt(0).toLowerCase() + desc.slice(1)}${desc.endsWith('.') ? '' : '.'} ${ctx} The project must be built using ${lang}${topics ? ` with expertise in ${topics}` : ''}, following industry best practices for code quality, testing, and documentation.`;
}

function generateSolution(repo: GitHubRepo): string {
  const desc = repo.description || repo.name;
  const lang = repo.language || 'the appropriate language';
  const topics = (repo.topics || []).slice(0, 6);

  let techDetails = '';
  if (topics.length > 0) {
    techDetails = ` Key technologies include ${topics.join(', ')}.`;
  }

  return `Build and extend "${repo.name}" — ${desc}${desc.endsWith('.') ? '' : '.'} The project is implemented in ${lang} and demonstrates real-world software engineering patterns.${techDetails} Students will clone the repository, understand its architecture, implement enhancements, write tests, and deploy the solution. This hands-on approach ensures mastery of both the domain concepts and the engineering practices required for production-quality software.`;
}

function generatePrerequisites(repo: GitHubRepo): string {
  const prereqs: string[] = [];
  const lang = (repo.language || '').toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const desc = (repo.description || '').toLowerCase();

  // Language prereqs
  if (lang === 'javascript' || lang === 'typescript') prereqs.push('Proficiency in JavaScript/TypeScript', 'Understanding of Node.js and npm ecosystem');
  if (lang === 'python') prereqs.push('Proficiency in Python 3.x', 'Familiarity with pip and virtual environments');
  if (lang === 'java') prereqs.push('Proficiency in Java', 'Understanding of Maven/Gradle build systems');
  if (lang === 'go') prereqs.push('Proficiency in Go', 'Understanding of Go modules');
  if (lang === 'rust') prereqs.push('Proficiency in Rust', 'Understanding of Cargo and ownership model');
  if (lang === 'c++' || lang === 'c') prereqs.push(`Proficiency in ${lang.toUpperCase()}`, 'Understanding of memory management and build tools');
  if (lang === 'ruby') prereqs.push('Proficiency in Ruby', 'Familiarity with Bundler and Gems');
  if (lang === 'php') prereqs.push('Proficiency in PHP', 'Understanding of Composer');

  // Topic-based prereqs
  if (topics.some(t => ['react', 'vue', 'angular', 'svelte'].includes(t))) prereqs.push('Experience with component-based frontend frameworks');
  if (topics.some(t => ['docker', 'kubernetes', 'devops'].includes(t))) prereqs.push('Basic Docker and containerization knowledge');
  if (topics.some(t => ['machine-learning', 'deep-learning', 'tensorflow', 'pytorch'].includes(t))) prereqs.push('Fundamentals of machine learning (supervised, unsupervised)');
  if (topics.some(t => ['nlp', 'text', 'language-model'].includes(t))) prereqs.push('Understanding of natural language processing basics');
  if (topics.some(t => ['database', 'sql', 'mongodb', 'postgresql'].includes(t))) prereqs.push('Understanding of database design and query languages');
  if (topics.some(t => ['rest', 'api', 'graphql'].includes(t))) prereqs.push('Knowledge of REST API design principles');
  if (topics.some(t => ['security', 'penetration-testing', 'vulnerability'].includes(t))) prereqs.push('Basic understanding of cybersecurity concepts (OWASP Top 10)');
  if (desc.includes('data') || topics.includes('data-science')) prereqs.push('Familiarity with data manipulation and analysis');

  // Always include
  prereqs.push('Git version control and GitHub workflow');
  prereqs.push('Command-line proficiency');

  return [...new Set(prereqs)].join(', ');
}

function generateTechStack(repo: GitHubRepo): { skills: string[]; tools: string[]; concepts: string[] } {
  const skills: string[] = [];
  const tools: string[] = ['Git', 'GitHub'];
  const concepts: string[] = [];
  const lang = (repo.language || '').toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());

  // Language
  if (lang) skills.push(repo.language!);

  // Detect frameworks/tools from topics
  const frameworkMap: Record<string, string> = {
    'react': 'React', 'nextjs': 'Next.js', 'vue': 'Vue.js', 'angular': 'Angular',
    'svelte': 'Svelte', 'express': 'Express.js', 'fastify': 'Fastify', 'django': 'Django',
    'flask': 'Flask', 'rails': 'Ruby on Rails', 'spring': 'Spring Boot', 'nestjs': 'NestJS',
    'graphql': 'GraphQL', 'docker': 'Docker', 'kubernetes': 'Kubernetes', 'redis': 'Redis',
    'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL', 'mysql': 'MySQL', 'elasticsearch': 'Elasticsearch',
    'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch', 'keras': 'Keras', 'scikit-learn': 'Scikit-learn',
    'pandas': 'Pandas', 'numpy': 'NumPy', 'jupyter': 'Jupyter Notebook', 'airflow': 'Apache Airflow',
    'spark': 'Apache Spark', 'kafka': 'Apache Kafka', 'aws': 'AWS', 'azure': 'Azure', 'gcp': 'GCP',
    'tailwindcss': 'Tailwind CSS', 'bootstrap': 'Bootstrap', 'sass': 'Sass/SCSS',
  };

  for (const topic of topics) {
    if (frameworkMap[topic]) {
      skills.push(frameworkMap[topic]);
    }
  }

  // Tools
  tools.push('VS Code');
  if (topics.some(t => ['rest', 'api'].includes(t))) tools.push('Postman');
  if (topics.some(t => ['docker'].includes(t))) tools.push('Docker Desktop');
  if (topics.some(t => ['ci', 'github-actions'].includes(t))) tools.push('GitHub Actions');
  if (lang === 'python') tools.push('pip/Poetry');
  if (lang === 'javascript' || lang === 'typescript') tools.push('npm/yarn');

  // Concepts
  concepts.push('Software Architecture');
  if (topics.some(t => ['api', 'rest', 'graphql'].includes(t))) concepts.push('API Design');
  if (topics.some(t => ['database', 'sql', 'mongodb'].includes(t))) concepts.push('Database Design');
  if (topics.some(t => ['testing', 'test'].includes(t))) concepts.push('Testing Strategies');
  if (topics.some(t => ['security', 'authentication'].includes(t))) concepts.push('Security Best Practices');
  if (topics.some(t => ['machine-learning', 'deep-learning'].includes(t))) concepts.push('Model Training & Evaluation');
  if (topics.some(t => ['data-science', 'data-analysis'].includes(t))) concepts.push('Exploratory Data Analysis');
  if (topics.some(t => ['devops', 'ci-cd', 'deployment'].includes(t))) concepts.push('CI/CD Pipelines');
  concepts.push('Clean Code Principles');
  concepts.push('Version Control Workflow');

  return {
    skills: [...new Set(skills)].slice(0, 8),
    tools: [...new Set(tools)].slice(0, 6),
    concepts: [...new Set(concepts)].slice(0, 6),
  };
}

function generateDeliverables(globalIndex: number): string[] {
  return DELIVERABLE_SETS[globalIndex % DELIVERABLE_SETS.length];
}

function estimateDeadline(repo: GitHubRepo): { min: number; max: number; text: string } {
  const desc = (repo.description || '').toLowerCase();
  const topics = repo.topics || [];
  // Use stars as a rough complexity proxy combined with description length
  const complexitySignals = ['distributed', 'enterprise', 'production', 'scalable', 'kubernetes', 'microservices', 'compiler', 'operating-system', 'platform', 'framework'];
  const complexity = complexitySignals.filter(s => desc.includes(s) || topics.includes(s)).length;

  if (complexity >= 2) return { min: 28, max: 42, text: '4-6 Weeks' };
  if (complexity >= 1 || repo.stargazers_count > 10000) return { min: 21, max: 35, text: '3-5 Weeks' };
  if (repo.stargazers_count > 2000) return { min: 14, max: 28, text: '2-4 Weeks' };
  return { min: 7, max: 21, text: '1-3 Weeks' };
}

function generateIntroduction(repo: GitHubRepo, domainName: string): string {
  const desc = repo.description || repo.name;
  return `Dive into a real-world ${domainName} project by studying and extending "${repo.name}." This project — ${desc}${desc.endsWith('.') ? '' : '.'} — represents production-grade software used by thousands of developers worldwide (${repo.stargazers_count.toLocaleString()} stars on GitHub). You will analyze its architecture, understand design decisions, implement new features, and produce a portfolio-ready deliverable that demonstrates your engineering capabilities.`;
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function scrapeAndSeed() {
  console.log('='.repeat(70));
  console.log('  GITHUB REAL-PROJECT SCRAPER & SEEDER');
  console.log('  Target: 200 unique real projects per domain (1000 total)');
  console.log('='.repeat(70));

  // Step 1: Clear all existing GitHubProject records
  console.log('\n[1/4] Clearing all existing GitHubProject records...');
  const deleted = await prisma.gitHubProject.deleteMany({});
  console.log(`  Deleted ${deleted.count} old projects.`);

  // Step 2: Upsert domains
  console.log('\n[2/4] Ensuring all 5 domains exist...');
  for (const domain of Object.values(DOMAINS)) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: { name: domain.name, description: domain.description },
      create: { id: domain.id, name: domain.name, slug: domain.slug, description: domain.description },
    });
    console.log(`  ✓ ${domain.name}`);
  }

  // Step 3: Scrape GitHub and seed per domain
  console.log('\n[3/4] Scraping GitHub for real projects...');
  const usedRepoIds = new Set<number>();
  const domainKeys = Object.keys(DOMAINS) as (keyof typeof DOMAINS)[];
  let totalSeeded = 0;
  let globalIndex = 0;

  for (const domainKey of domainKeys) {
    const domain = DOMAINS[domainKey];
    console.log(`\n  --- ${domain.name} ---`);

    const repos = await fetchReposForDomain(domainKey, usedRepoIds);
    console.log(`  Fetched ${repos.length} unique repos for ${domain.name}`);

    if (repos.length < PROJECTS_PER_DOMAIN) {
      console.warn(`  WARNING: Only ${repos.length} repos found (need ${PROJECTS_PER_DOMAIN}). Will seed what we have.`);
    }

    let domainSeeded = 0;
    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      const idx = globalIndex++;

      const title = generateTitle(repo);
      const subdomain = classifySubdomain(repo, domainKey);
      const difficulty = classifyDifficulty(repo);
      const caseStudy = generateCaseStudy(repo, idx);
      const problemStatement = generateProblemStatement(repo, idx);
      const solutionDescription = generateSolution(repo);
      const prerequisitesText = generatePrerequisites(repo);
      const techStack = generateTechStack(repo);
      const deliverables = generateDeliverables(idx);
      const deadline = estimateDeadline(repo);
      const introduction = generateIntroduction(repo, domain.name);

      const repoUrl = repo.html_url;
      const downloadUrl = `${repoUrl}/archive/refs/heads/${repo.default_branch}.zip`;
      const liveUrl = repo.homepage && repo.homepage.length > 5 ? repo.homepage : repoUrl;
      const slugBase = `${domainKey}-${repo.owner.login}-${repo.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 80);

      try {
        await prisma.gitHubProject.create({
          data: {
            title,
            description: repo.description || title,
            repoUrl,
            repoOwner: repo.owner.login,
            repoName: repo.name,
            defaultBranch: repo.default_branch,
            downloadUrl,
            liveUrl,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            downloadCount: Math.floor(Math.random() * 5000) + 200,
            domainId: domain.id,
            language: repo.language || 'Multiple',
            difficulty,
            subDomain: subdomain,
            caseStudy,
            problemStatement,
            solutionDescription,
            prerequisitesText,
            deliverables,
            optionalExtensions: `Explore advanced features of ${repo.name}: add comprehensive test coverage, implement CI/CD pipeline, write technical blog post about the architecture, contribute back to the open-source project, and create a presentation for a tech meetup.`,
            evaluationCriteria: 'Code quality and architecture (25%), Feature completeness (25%), Testing and reliability (20%), Documentation quality (15%), Deployment readiness (15%)',
            estimatedMinTime: deadline.min,
            estimatedMaxTime: deadline.max,
            technicalSkills: techStack.skills,
            toolsUsed: techStack.tools,
            conceptsUsed: techStack.concepts,
            introduction,
            slug: slugBase,
            isActive: true,
            author: repo.owner.login,
          } as any,
        });
        domainSeeded++;
      } catch (err: any) {
        if (err.code === 'P2002') {
          console.warn(`    Skipping duplicate slug: ${slugBase}`);
        } else {
          console.error(`    Error seeding ${repo.full_name}: ${err.message}`);
        }
      }
    }

    console.log(`  ✅ ${domain.name}: ${domainSeeded} projects seeded`);
    totalSeeded += domainSeeded;
  }

  // Step 4: Summary
  console.log('\n[4/4] Summary');
  console.log('='.repeat(70));
  console.log(`  Total projects seeded: ${totalSeeded}`);
  for (const domainKey of domainKeys) {
    const domain = DOMAINS[domainKey];
    const count = await prisma.gitHubProject.count({ where: { domainId: domain.id } });
    console.log(`    ${domain.name}: ${count} projects`);
  }
  console.log('='.repeat(70));
  console.log('✅ Done! All projects are real GitHub repos with unique content.');
}

scrapeAndSeed()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
