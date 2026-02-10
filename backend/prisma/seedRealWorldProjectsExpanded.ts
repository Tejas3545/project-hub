/**
 * Expanded Real-World Project Seed Script
 * Generates 800 industry-grade, domain-specific projects (200 per domain)
 * Programmatically creates variations of comprehensive project templates
 */
// @ts-nocheck

import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Domain definitions
const DOMAINS = {
  web: {
    id: 'web-dev',
    name: 'Web Development',
    slug: 'web-development',
  },
  ai: {
    id: 'ai',
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
  },
  ml: {
    id: 'ml',
    name: 'Machine Learning',
    slug: 'machine-learning',
  },
  ds: {
    id: 'data-science',
    name: 'Data Science',
    slug: 'data-science',
  },
  cyber: {
    id: 'cyber',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
  },
};

// Helper function to create variations of projects
function generateWebProjects(): any[] {
  const subDomains = ['Full-Stack', 'Frontend', 'Backend', 'DevOps'];
  const projects = [];
  const baseProjects = [
    {
      title: 'E-Commerce Platform',
      caseStudy: 'Retail company loses $200K annually due to inventory mismatches across channels. Needs real-time sync.',
      problemStatement: 'Build scalable e-commerce with real-time inventory management, payment processing, and admin dashboard.',
      solution: 'Full-stack platform with Next.js, Node.js, PostgreSQL, Redis, WebSocket for real-time updates, Stripe integration.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe API'],
    },
    {
      title: 'Social Media Analytics Dashboard',
      caseStudy: 'Marketing team spends 6+ hours daily compiling metrics from 5 platforms. Tool improves RTI by 60%.',
      problemStatement: 'Consolidate metrics from Instagram, Twitter, TikTok, LinkedIn with predictive insights.',
      solution: 'React dashboard with Chart.js, API integrations (OAuth), real-time data sync, PDF/CSV export.',
      skills: ['React', 'Chart.js', 'OAuth 2.0', 'REST APIs', 'Data visualization'],
    },
    {
      title: 'Real-Time Collaborative Document Editor',
      caseStudy: 'Remote teams lose 4+ hours weekly in sync/version conflicts. Collaborative editor reduces to 15 min.',
      problemStatement: 'Multi-user editing with <50ms sync latency, conflict resolution, version history.',
      solution: 'WebSocket with Operational Transformation, CodeMirror, MongoDB, Docker deployment.',
      skills: ['WebSocket', 'React', 'Node.js', 'OT algorithms', 'Docker'],
    },
    {
      title: 'Video Streaming Platform',
      caseStudy: 'Content creators need scalable platform. Adaptive bitrate reduces buffering complaints by 40%.',
      problemStatement: 'Build Netflix-like platform with HLS/DASH streaming, adaptive bitrate, CDN integration.',
      solution: 'FFmpeg transcoding, AWS MediaConvert, CloudFront CDN, React player, subscription management.',
      skills: ['Video encoding', 'HLS/DASH', 'AWS', 'React', 'PostgreSQL'],
    },
    {
      title: 'Progressive Web App (Offline-First)',
      caseStudy: 'PWA generates 3x more revenue than traditional web. Installation rate 340% higher.',
      problemStatement: 'Build app working offline with background sync, push notifications, home screen install.',
      solution: 'Service Workers, IndexedDB, Web App Manifest, Firebase Cloud Messaging.',
      skills: ['PWA', 'Service Workers', 'IndexedDB', 'React'],
    },
  ];

  // Generate 40 projects per subdomain = 200 total
  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const baseProject = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${baseProject.title} - Variant ${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 15 + (i % 50),
        estimatedMaxTime: 30 + (i % 50) + 20,
        caseStudy: `${baseProject.caseStudy} Implementation variation ${i + 1} with specific domain focus on ${subdomain}.`,
        problemStatement: `${baseProject.problemStatement} With focus on ${subdomain} implementation patterns and best practices.`,
        solutionDescription: `${baseProject.solution} Includes comprehensive error handling, monitoring, CI/CD pipeline setup.`,
        prerequisites: [...baseProject.skills, 'Git', 'Testing frameworks', 'Docker'],
        deliverables: ['Working application', 'Docker container', 'API documentation', 'Test coverage report'],
        optionalExtensions: 'Add AI features, mobile app, advanced caching, microservices architecture',
        evaluationCriteria: 'Functionality (30%), Performance (25%), Code quality (20%), Documentation (15%), Deployment (10%)',
        technicalSkills: baseProject.skills,
        toolsUsed: ['Git', 'Docker', 'VS Code', 'Postman'],
        conceptsUsed: ['API Design', 'Database Design', 'Security'],
        introduction: `Master ${subdomain} development with real-world constraints. Build ${baseProject.title} that scales to production with millions of users.`,
      });
    }
  }
  
  return projects;
}

function generateAIProjects(): any[] {
  const subDomains = ['NLP', 'Computer Vision', 'Speech Processing', 'Generative Models'];
  const projects = [];
  const baseProjects = [
    {
      title: 'Customer Support Chatbot',
      caseStudy: 'Support team handles 2000 tickets/day. Chatbot reduces response time from 12h to 2m, satisfaction up 22%.',
      problemStatement: 'Build intelligent chatbot handling 70% of queries, understanding context, routing complex issues.',
      solution: 'BERT/GPT for intent classification, entities extraction, context preservation, fallback routing.',
      skills: ['NLP', 'Python', 'BERT', 'FastAPI', 'Rasa'],
    },
    {
      title: 'Defect Detection (Computer Vision)',
      caseStudy: 'Manufacturing plant detects 98% of defects manually. AutoML system reaches 99.2%, cuts costs 40%.',
      problemStatement: 'Real-time defect identification on production line with >99% accuracy.',
      solution: 'YOLOv8 object detection, trained on 10K+ images, edge deployment on Jetson.',
      skills: ['Computer Vision', 'PyTorch', 'YOLOv8', 'OpenCV', 'Edge AI'],
    },
    {
      title: 'Voice Assistant',
      caseStudy: 'Smart home adoption 65% higher with voice control. Users complete tasks 3x faster.',
      problemStatement: 'Build voice interface understanding natural speech, executing commands, maintaining context.',
      solution: 'Whisper speech recognition, Rasa NLU, pyttsx3 TTS, MQTT device control.',
      skills: ['ASR', 'NLU', 'Python', 'Speech synthesis', 'IoT'],
    },
    {
      title: 'Text-to-Image Generation',
      caseStudy: 'Fashion brand generates 50K product images using fine-tuned diffusion. Saves $3M photography, increases sales 28%.',
      problemStatement: 'Fine-tune generative model for brand-specific image generation with style consistency.',
      solution: 'Stable Diffusion with LoRA fine-tuning, ControlNet for layout control, Gradio interface.',
      skills: ['Diffusion models', 'LoRA', 'Python', 'GPU optimization'],
    },
    {
      title: 'Recommendation with LLM Re-ranking',
      caseStudy: 'Dating app improves match quality 45% using LLM re-ranking. Conversation rate 31% (was 12%).',
      problemStatement: 'Two-stage recommender: CF for candidates, LLM for semantic re-ranking.',
      solution: 'Collaborative filtering + GPT re-ranking, embedding vectors, conversation potential scoring.',
      skills: ['CF', 'LLMs', 'Embeddings', 'Python', 'ML ops'],
    },
  ];

  // Generate 40 projects per subdomain = 200 total
  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const baseProject = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${baseProject.title} - ${subdomain} Implementation ${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 20 + (i % 50),
        estimatedMaxTime: 40 + (i % 50) + 20,
        caseStudy: `${baseProject.caseStudy} Specialized ${subdomain} variant with industry-specific requirements.`,
        problemStatement: `${baseProject.problemStatement} Focused on ${subdomain} techniques and methodologies.`,
        solutionDescription: `${baseProject.solution} Including model evaluation, performance benchmarking, production deployment strategies.`,
        prerequisites: [...baseProject.skills, 'Python fundamentals', 'ML basics'],
        deliverables: ['Trained model', 'Inference API', 'Performance metrics', 'Deployment guide'],
        optionalExtensions: 'Add explainability (SHAP), multi-model ensemble, continuous learning, monitoring',
        evaluationCriteria: 'Model accuracy (35%), Inference speed (25%), Robustness (20%), Documentation (15%), Scalability (5%)',
        technicalSkills: baseProject.skills,
        toolsUsed: ['Python', 'PyTorch/TensorFlow', 'FastAPI', 'Docker'],
        conceptsUsed: ['Neural networks', 'Transfer learning', 'Model evaluation'],
        introduction: `Master ${subdomain} at scale. Build production AI systems powering millions of users with state-of-the-art results.`,
      });
    }
  }

  return projects;
}

function generateMLProjects(): any[] {
  const subDomains = ['Time Series', 'Classification', 'Regression', 'Clustering'];
  const projects = [];
  const baseProjects = [
    {
      title: 'Sales Forecasting',
      caseStudy: 'Retail chain forecasts demand 88% accurately 2 weeks ahead. Inventory costs down 22%, stockouts down 35%.',
      problemStatement: 'Predict 4-week sales for 500+ SKUs considering seasonality, trends, promotions.',
      solution: 'ARIMA/Prophet/LSTM with feature engineering, automated retraining, REST API, dashboard.',
      skills: ['Time series', 'Prophet', 'LSTM', 'Python', 'SQL'],
    },
    {
      title: 'Churn Prediction',
      caseStudy: 'SaaS company reduces churn 8% → 4% via targeted retention. Saves $5M annually.',
      problemStatement: 'Identify at-risk customers 30 days before cancellation with 85%+ recall.',
      solution: 'Logistic regression + gradient boosting, SMOTE for imbalance, SHAP explainability.',
      skills: ['Classification', 'XGBoost', 'Feature engineering', 'Python', 'SHAP'],
    },
    {
      title: 'Recommendation Engine',
      caseStudy: 'Online library engagement up 40% via recommendations. Users finding relevant items: 23% → 63%.',
      problemStatement: 'Recommend items achieving 30%+ CTR, handling 1M+ users, 100K+ items.',
      solution: 'Matrix factorization, embeddings, content-based filtering, cold-start handling.',
      skills: ['CF', 'Embeddings', 'Elasticsearch', 'Python'],
    },
    {
      title: 'Anomaly Detection',
      caseStudy: 'Cloud provider detects issues 10-15 min before downtime. Downtime 8h → 45m/month.',
      problemStatement: 'Detect anomalies in infrastructure metrics with <5% false positive rate.',
      solution: 'Isolation Forest, DBSCAN, autoencoders, adaptive thresholds, alerting system.',
      skills: ['Unsupervised learning', 'Statistics', 'Python', 'Time series'],
    },
    {
      title: 'Price Optimization',
      caseStudy: 'E-commerce optimizes pricing. Revenue up 18% ($50M), margins up 12%.',
      problemStatement: 'Dynamic pricing considering elasticity, competition, inventory, maximizing revenue.',
      solution: 'Demand elasticity modeling, competitor monitoring, optimization engine, A/B test framework.',
      skills: ['Regression', 'Optimization', 'Causal inference', 'Python'],
    },
  ];

  // Generate 40 projects per subdomain = 200 total
  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const baseProject = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${baseProject.title} - ${subdomain} Approach ${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 25 + (i % 50),
        estimatedMaxTime: 45 + (i % 50) + 20,
        caseStudy: `${baseProject.caseStudy} Using ${subdomain} techniques with variant ${i + 1} methodology.`,
        problemStatement: `${baseProject.problemStatement} Implemented via ${subdomain} analysis and modeling.`,
        solutionDescription: `${baseProject.solution} With enhanced feature engineering, model selection, and deployment considerations.`,
        prerequisites: [...baseProject.skills, 'Statistics', 'A/B testing basics'],
        deliverables: ['ML model', 'Pipeline script', 'Analysis report', 'Performance dashboard'],
        optionalExtensions: 'Add ensemble methods, AutoML exploration, hyperparameter optimization, monitoring',
        evaluationCriteria: 'Model accuracy (35%), Business impact (30%), Scalability (20%), Documentation (15%)',
        technicalSkills: baseProject.skills,
        toolsUsed: ['Scikit-learn', 'XGBoost', 'Python', 'Jupyter'],
        conceptsUsed: ['Feature engineering', 'Model evaluation', 'Cross-validation'],
        introduction: `Leverage ${subdomain} ML for business impact. Build models generating millions in value across retail, SaaS, and finance.`,
      });
    }
  }

  return projects;
}

function generateDataScienceProjects(): any[] {
  const subDomains = ['Statistical Analysis', 'Business Analytics', 'Data Engineering', 'Experimentation'];
  const projects = [];
  const baseProjects = [
    {
      title: 'Customer Segmentation',
      caseStudy: 'Retail segments 10M customers into 8 groups. Personalized marketing ROI up 240%.',
      problemStatement: 'Segment customers into actionable groups for targeted campaigns.',
      solution: 'K-Means/DBSCAN clustering, RFM analysis, feature normalization, segment profiling.',
      skills: ['Clustering', 'RFM', 'Python', 'Pandas', 'Visualization'],
    },
    {
      title: 'A/B Testing Platform',
      caseStudy: 'Experimentation platform powers 500+ companies. Average experiment ROI: 250%.',
      problemStatement: 'Statistical framework for A/B testing with significance testing, power analysis.',
      solution: 'Hypothesis testing, power analysis, Bayesian methods, sensitivity analysis.',
      skills: ['Statistics', 'Hypothesis testing', 'Python', 'SciPy'],
    },
    {
      title: 'Time Series Forecasting',
      caseStudy: 'Energy company forecasts demand 96% accurately. Optimizes generation, saves $50M annually.',
      problemStatement: 'Deep learning forecasting for electricity demand with uncertainty quantification.',
      solution: 'LSTM/Transformer models, attention mechanisms, external regressors, probabilistic forecasts.',
      skills: ['Deep learning', 'Time series', 'PyTorch', 'TensorFlow'],
    },
    {
      title: 'Network Analysis',
      caseStudy: 'Social network improves recommendations via graph analysis. Engagement up 65%.',
      problemStatement: 'Community detection, influence analysis, anomaly detection in networks.',
      solution: 'PageRank, clustering algorithms, centrality measures, graph embeddings.',
      skills: ['Graph theory', 'NetworkX', 'Python', 'Algorithms'],
    },
    {
      title: 'Customer Lifetime Value',
      caseStudy: 'SaaS company predicts CLV, personalizes pricing. Revenue per customer up 35%.',
      problemStatement: 'Predict customer lifetime value for personalized retention campaigns.',
      solution: 'Regression models with behavioral features, cohort analysis, churn probability integration.',
      skills: ['Regression', 'Causal inference', 'Python', 'SQL'],
    },
  ];

  // Generate 40 projects per subdomain = 200 total
  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const baseProject = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${baseProject.title} - ${subdomain} Analysis ${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 22 + (i % 50),
        estimatedMaxTime: 42 + (i % 50) + 20,
        caseStudy: `${baseProject.caseStudy} Analyzed using ${subdomain} approach, iteration ${i + 1}.`,
        problemStatement: `${baseProject.problemStatement} Via ${subdomain} methods and analytical frameworks.`,
        solutionDescription: `${baseProject.solution} Including comprehensive data quality checks, visualization, and reporting.`,
        prerequisites: [...baseProject.skills, 'SQL', 'Data exploration'],
        deliverables: ['Analysis report', 'Visualizations', 'Data pipeline', 'Recommendations'],
        optionalExtensions: 'Add predictive modeling, causal analysis, advanced visualizations, real-time dashboards',
        evaluationCriteria: 'Analysis quality (30%), Business insights (30%), Data integrity (20%), Visualization (15%), Documentation (5%)',
        technicalSkills: baseProject.skills,
        toolsUsed: ['Python', 'Pandas', 'Matplotlib', 'SQL'],
        conceptsUsed: ['Data quality', 'Statistical inference', 'Business metrics'],
        introduction: `Transform data into business insights. Master ${subdomain} analytics powering billion-dollar business decisions.`,
      });
    }
  }

  return projects;
}

function generateCybersecurityProjects(): any[] {
  const subDomains = ['Offensive Security', 'Cloud Security', 'Network Security', 'Application Security'];
  const projects = [];
  const baseProjects = [
    {
      title: 'Penetration Testing Framework',
      caseStudy: 'Automated pent, testing cuts time from 30 days to 1 day. Discoveries: 340 issues vs 120 manually.',
      problemStatement: 'Automated scanning for OWASP Top 10, generating reports, CI/CD integration.',
      solution: 'Port/service enumeration, vulnerability detection, custom exploits, risk scoring.',
      skills: ['Security testing', 'Python', 'Burp', 'Metasploit'],
    },
    {
      title: 'Zero-Trust Architecture',
      caseStudy: 'Enterprise prevents ransomware via compromised VPN with zero-trust. Eliminates 3 breach vectors.',
      problemStatement: 'Design architecture verifying every access, implementing microsegmentation.',
      solution: 'Identity/access management, device compliance, network segmentation, encryption.',
      skills: ['Network security', 'Authentication', 'Cryptography', 'Cloud security'],
    },
    {
      title: 'Cloud Misconfiguration Detection',
      caseStudy: 'Platform finds 50K+ misconfigurations daily. Prevents 100+ breaches yearly.',
      problemStatement: 'Detect exposed S3 buckets, open security groups, encryption gaps.',
      solution: 'Cloud scanner for AWS/Azure/GCP, compliance checking, remediation automation.',
      skills: ['Cloud services', 'IaC', 'Python', 'Compliance'],
    },
    {
      title: 'Malware Analysis',
      caseStudy: 'Analyzes 500K samples daily. ML classification: 98% accuracy. Detects 20+ families before disclosure.',
      problemStatement: 'Classify malware (ransomware, trojans, worms), extract IoCs, track campaigns.',
      solution: 'Static/dynamic analysis, behavior extraction, signature generation, ML classification.',
      skills: ['Malware analysis', 'Reverse engineering', 'Python', 'YARA'],
    },
    {
      title: 'Incident Response Toolkit',
      caseStudy: 'Forensic investigation finds breach scope. Reduces impact from $500M potential to $20M managed.',
      problemStatement: 'Artifact collection, timeline analysis, evidence extraction, incident reports.',
      solution: 'Forensics toolkit, artifact recovery, chain-of-custody, incident reporting.',
      skills: ['Digital forensics', 'System internals', 'Python', 'DFIR'],
    },
  ];

  // Generate 40 projects per subdomain = 200 total
  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const baseProject = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${baseProject.title} - ${subdomain} Focus ${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 30 + (i % 50),
        estimatedMaxTime: 50 + (i % 50) + 20,
        caseStudy: `${baseProject.caseStudy} With emphasis on ${subdomain} controls and practices.`,
        problemStatement: `${baseProject.problemStatement} Using ${subdomain} best practices and frameworks.`,
        solutionDescription: `${baseProject.solution} Including threat modeling, security hardening, compliance validation.`,
        prerequisites: [...baseProject.skills, 'Networking', 'Linux/Windows'],
        deliverables: ['Security system', 'Assessment report', 'Remediation guide', 'Monitoring setup'],
        optionalExtensions: 'Add threat intelligence, automation, incident response integration, compliance reporting',
        evaluationCriteria: 'Security effectiveness (35%), Coverage (25%), Usability (20%), Documentation (15%), Compliance (5%)',
        technicalSkills: baseProject.skills,
        toolsUsed: ['Python', 'Security tools', 'Docker'],
        conceptsUsed: ['Threat modeling', 'Security patterns', 'Risk assessment'],
        introduction: `Master ${subdomain} protecting enterprises. Build security systems preventing billion-dollar breaches.`,
      });
    }
  }

  return projects;
}

async function seedProjects() {
  try {
    console.log('Starting real-world project expansion seeding...');

    // Create/update domains
    const domainsToCreate = Object.values(DOMAINS);
    for (const domain of domainsToCreate) {
      await prisma.domain.upsert({
        where: { slug: domain.slug },
        update: {},
        create: domain,
      });
    }
    console.log('✓ Domains created/updated');

    // Generate and seed projects for each domain
    const webProjects = generateWebProjects();
    const aiProjects = generateAIProjects();
    const mlProjects = generateMLProjects();
    const dsProjects = generateDataScienceProjects();
    const cyberProjects = generateCybersecurityProjects();

    // Seed Web Development (200 projects)
    console.log('Seeding Web Development projects...');
    for (let i = 0; i < webProjects.length; i++) {
      const project = webProjects[i];
      const uniqueSlug = `${project.title.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      await prisma.gitHubProject.create({
        data: {
          title: project.title,
          description: project.problemStatement,
          repoUrl: `https://github.com/projects/${uniqueSlug}`,
          liveUrl: `https://${uniqueSlug}.example.com`,
          domainId: DOMAINS.web.id,
          language: 'TypeScript',
          difficulty: project.difficulty,
          subDomain: project.subDomain as any,
          caseStudy: project.caseStudy,
          problemStatement: project.problemStatement,
          solutionDescription: project.solutionDescription,
          prerequisitesText: project.prerequisites.join(', '),
          deliverables: project.deliverables,
          optionalExtensions: project.optionalExtensions,
          evaluationCriteria: project.evaluationCriteria,
          estimatedMinTime: project.estimatedMinTime,
          estimatedMaxTime: project.estimatedMaxTime,
          technicalSkills: project.technicalSkills,
          toolsUsed: project.toolsUsed,
          conceptsUsed: project.conceptsUsed,
          introduction: project.introduction,
          slug: uniqueSlug,
          isActive: true,
        },
      });
    }
    console.log(`✓ Web Development: ${webProjects.length} projects seeded`);

    // Seed AI (200 projects)
    console.log('Seeding AI projects...');
    for (let i = 0; i < aiProjects.length; i++) {
      const project = aiProjects[i];
      const uniqueSlug = `ai-${project.title.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      await prisma.gitHubProject.create({
        data: {
          title: project.title,
          description: project.problemStatement,
          repoUrl: `https://github.com/projects/${uniqueSlug}`,
          liveUrl: `https://${uniqueSlug}.example.com`,
          domainId: DOMAINS.ai.id,
          language: 'Python',
          difficulty: project.difficulty,
          subDomain: project.subDomain as any,
          caseStudy: project.caseStudy,
          problemStatement: project.problemStatement,
          solutionDescription: project.solutionDescription,
          prerequisitesText: project.prerequisites.join(', '),
          deliverables: project.deliverables,
          optionalExtensions: project.optionalExtensions,
          evaluationCriteria: project.evaluationCriteria,
          estimatedMinTime: project.estimatedMinTime,
          estimatedMaxTime: project.estimatedMaxTime,
          technicalSkills: project.technicalSkills,
          toolsUsed: project.toolsUsed,
          conceptsUsed: project.conceptsUsed,
          introduction: project.introduction,
          slug: uniqueSlug,
          isActive: true,
        },
      });
    }
    console.log(`✓ AI: ${aiProjects.length} projects seeded`);

    // Seed Machine Learning (200 projects)
    console.log('Seeding Machine Learning projects...');
    for (let i = 0; i < mlProjects.length; i++) {
      const project = mlProjects[i];
      const uniqueSlug = `ml-${project.title.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      await prisma.gitHubProject.create({
        data: {
          title: project.title,
          description: project.problemStatement,
          repoUrl: `https://github.com/projects/${uniqueSlug}`,
          liveUrl: `https://${uniqueSlug}.example.com`,
          domainId: DOMAINS.ml.id,
          language: 'Python',
          difficulty: project.difficulty,
          subDomain: project.subDomain as any,
          caseStudy: project.caseStudy,
          problemStatement: project.problemStatement,
          solutionDescription: project.solutionDescription,
          prerequisitesText: project.prerequisites.join(', '),
          deliverables: project.deliverables,
          optionalExtensions: project.optionalExtensions,
          evaluationCriteria: project.evaluationCriteria,
          estimatedMinTime: project.estimatedMinTime,
          estimatedMaxTime: project.estimatedMaxTime,
          technicalSkills: project.technicalSkills,
          toolsUsed: project.toolsUsed,
          conceptsUsed: project.conceptsUsed,
          introduction: project.introduction,
          slug: uniqueSlug,
          isActive: true,
        },
      });
    }
    console.log(`✓ Machine Learning: ${mlProjects.length} projects seeded`);

    // Seed Data Science (200 projects)
    console.log('Seeding Data Science projects...');
    for (let i = 0; i < dsProjects.length; i++) {
      const project = dsProjects[i];
      const uniqueSlug = `ds-${project.title.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      await prisma.gitHubProject.create({
        data: {
          title: project.title,
          description: project.problemStatement,
          repoUrl: `https://github.com/projects/${uniqueSlug}`,
          liveUrl: `https://${uniqueSlug}.example.com`,
          domainId: DOMAINS.ds.id,
          language: 'Python',
          difficulty: project.difficulty,
          subDomain: project.subDomain as any,
          caseStudy: project.caseStudy,
          problemStatement: project.problemStatement,
          solutionDescription: project.solutionDescription,
          prerequisitesText: project.prerequisites.join(', '),
          deliverables: project.deliverables,
          optionalExtensions: project.optionalExtensions,
          evaluationCriteria: project.evaluationCriteria,
          estimatedMinTime: project.estimatedMinTime,
          estimatedMaxTime: project.estimatedMaxTime,
          technicalSkills: project.technicalSkills,
          toolsUsed: project.toolsUsed,
          conceptsUsed: project.conceptsUsed,
          introduction: project.introduction,
          slug: uniqueSlug,
          isActive: true,
        },
      });
    }
    console.log(`✓ Data Science: ${dsProjects.length} projects seeded`);

    // Seed Cybersecurity (200 projects)
    console.log('Seeding Cybersecurity projects...');
    for (let i = 0; i < cyberProjects.length; i++) {
      const project = cyberProjects[i];
      const uniqueSlug = `cyber-${project.title.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      await prisma.gitHubProject.create({
        data: {
          title: project.title,
          description: project.problemStatement,
          repoUrl: `https://github.com/projects/${uniqueSlug}`,
          liveUrl: `https://${uniqueSlug}.example.com`,
          domainId: DOMAINS.cyber.id,
          language: 'Python',
          difficulty: project.difficulty,
          subDomain: project.subDomain as any,
          caseStudy: project.caseStudy,
          problemStatement: project.problemStatement,
          solutionDescription: project.solutionDescription,
          prerequisitesText: project.prerequisites.join(', '),
          deliverables: project.deliverables,
          optionalExtensions: project.optionalExtensions,
          evaluationCriteria: project.evaluationCriteria,
          estimatedMinTime: project.estimatedMinTime,
          estimatedMaxTime: project.estimatedMaxTime,
          technicalSkills: project.technicalSkills,
          toolsUsed: project.toolsUsed,
          conceptsUsed: project.conceptsUsed,
          introduction: project.introduction,
          slug: uniqueSlug,
          isActive: true,
        },
      });
    }
    console.log(`✓ Cybersecurity: ${cyberProjects.length} projects seeded`);

    console.log('\n✅ Expanded project seeding completed!');
    console.log(`Total projects seeded: ${webProjects.length + aiProjects.length + mlProjects.length + dsProjects.length + cyberProjects.length}`);
  } catch (error) {
    console.error('Error seeding projects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProjects();
