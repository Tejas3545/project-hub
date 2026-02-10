/**
 * Clear all existing GitHubProject records and re-seed with real-world projects
 */
import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Domain definitions
const DOMAINS = {
  web: { id: 'web-dev', name: 'Web Development', slug: 'web-development' },
  ai: { id: 'ai', name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  ml: { id: 'ml', name: 'Machine Learning', slug: 'machine-learning' },
  ds: { id: 'data-science', name: 'Data Science', slug: 'data-science' },
  cyber: { id: 'cyber', name: 'Cybersecurity', slug: 'cybersecurity' },
};

// Each base project title maps to a MATCHING real GitHub repo
type RepoInfo = { owner: string; name: string; branch: string; stars: number; forks: number; liveUrl?: string };

// Web Development – repos matched to project titles
const WEB_REPOS: Record<string, RepoInfo> = {
  'E-Commerce Platform':                  { owner: 'medusajs',    name: 'medusa',       branch: 'develop', stars: 24200, forks: 2400, liveUrl: 'https://medusajs.com/' },
  'Social Media Analytics Dashboard':     { owner: 'plausible',   name: 'analytics',    branch: 'master',  stars: 19800, forks: 1050, liveUrl: 'https://plausible.io/' },
  'Real-Time Collaborative Document Editor': { owner: 'yjs',      name: 'yjs',          branch: 'main',    stars: 16400, forks: 640,  liveUrl: 'https://docs.yjs.dev/' },
  'Video Streaming Platform':             { owner: 'livekit',     name: 'livekit',       branch: 'main',    stars: 10200, forks: 850,  liveUrl: 'https://livekit.io/' },
  'Progressive Web App (Offline-First)':  { owner: 'nicedayfor',  name: 'next-pwa',     branch: 'master',  stars: 3700,  forks: 330,  liveUrl: 'https://github.com/nicedayfor/next-pwa' },
};

// Artificial Intelligence – repos matched to project titles
const AI_REPOS: Record<string, RepoInfo> = {
  'Customer Support Chatbot':             { owner: 'RasaHQ',      name: 'rasa',          branch: 'main',    stars: 18700, forks: 4600, liveUrl: 'https://rasa.com/' },
  'Defect Detection System':              { owner: 'ultralytics', name: 'ultralytics',   branch: 'main',    stars: 31000, forks: 5900, liveUrl: 'https://ultralytics.com/' },
  'Voice Assistant':                       { owner: 'openai',      name: 'whisper',       branch: 'main',    stars: 69400, forks: 8100, liveUrl: 'https://openai.com/research/whisper' },
  'Text-to-Image Generation':             { owner: 'AUTOMATIC1111', name: 'stable-diffusion-webui', branch: 'master', stars: 141000, forks: 26800, liveUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui' },
  'Recommendation with LLM Re-ranking':   { owner: 'huggingface', name: 'transformers',  branch: 'main',    stars: 134000, forks: 26800, liveUrl: 'https://huggingface.co/docs/transformers' },
};

// Machine Learning – repos matched to project titles
const ML_REPOS: Record<string, RepoInfo> = {
  'Sales Forecasting':                    { owner: 'facebook',    name: 'prophet',        branch: 'main',    stars: 18300, forks: 4530, liveUrl: 'https://facebook.github.io/prophet/' },
  'Churn Prediction':                     { owner: 'dmlc',        name: 'xgboost',        branch: 'master',  stars: 26200, forks: 8700, liveUrl: 'https://xgboost.readthedocs.io/' },
  'Recommendation Engine':                { owner: 'lenskit',     name: 'lkpy',           branch: 'main',    stars: 700,   forks: 140,  liveUrl: 'https://lkpy.lenskit.org/' },
  'Anomaly Detection':                    { owner: 'yzhao062',    name: 'pyod',           branch: 'main',    stars: 8400,  forks: 1350, liveUrl: 'https://pyod.readthedocs.io/' },
  'Price Optimization':                   { owner: 'scikit-learn', name: 'scikit-learn',  branch: 'main',    stars: 59800, forks: 25400, liveUrl: 'https://scikit-learn.org/' },
};

// Data Science – repos matched to project titles
const DS_REPOS: Record<string, RepoInfo> = {
  'Customer Segmentation':                { owner: 'scikit-learn', name: 'scikit-learn',  branch: 'main',    stars: 59800, forks: 25400, liveUrl: 'https://scikit-learn.org/' },
  'A/B Testing Platform':                 { owner: 'spotify',     name: 'confidence',     branch: 'main',    stars: 270,   forks: 30,   liveUrl: 'https://spotify.github.io/confidence/' },
  'Time Series Forecasting':              { owner: 'unit8co',     name: 'darts',          branch: 'master',  stars: 7800,  forks: 870,  liveUrl: 'https://unit8co.github.io/darts/' },
  'Network Analysis':                     { owner: 'networkx',    name: 'networkx',       branch: 'main',    stars: 14800, forks: 3200, liveUrl: 'https://networkx.org/' },
  'Customer Lifetime Value':              { owner: 'CamDavidsonPilon', name: 'lifetimes', branch: 'master',  stars: 2300,  forks: 450,  liveUrl: 'https://lifetimes.readthedocs.io/' },
};

// Cybersecurity – repos matched to project titles
const CYBER_REPOS: Record<string, RepoInfo> = {
  'Penetration Testing Framework':        { owner: 'rapid7',      name: 'metasploit-framework', branch: 'master', stars: 33900, forks: 13900, liveUrl: 'https://www.metasploit.com/' },
  'Zero-Trust Architecture':              { owner: 'pomerium',    name: 'pomerium',       branch: 'main',    stars: 4000,  forks: 290,  liveUrl: 'https://www.pomerium.com/' },
  'Cloud Misconfiguration Detection':     { owner: 'aquasecurity', name: 'trivy',         branch: 'main',    stars: 23200, forks: 2300, liveUrl: 'https://trivy.dev/' },
  'Malware Analysis':                     { owner: 'mandiant',    name: 'capa',           branch: 'master',  stars: 4400,  forks: 550,  liveUrl: 'https://github.com/mandiant/capa' },
  'Incident Response Toolkit':            { owner: 'volatilityfoundation', name: 'volatility3', branch: 'develop', stars: 2600, forks: 440, liveUrl: 'https://www.volatilityfoundation.org/' },
};

const ALL_BASE_REPOS: Record<string, Record<string, RepoInfo>> = {
  web: WEB_REPOS,
  ai: AI_REPOS,
  ml: ML_REPOS,
  ds: DS_REPOS,
  cyber: CYBER_REPOS,
};

function generateWebProjects(): any[] {
  const subDomains = ['Full-Stack', 'Frontend', 'Backend', 'DevOps'];
  const projects: any[] = [];
  const baseProjects = [
    { title: 'E-Commerce Platform', caseStudy: 'Retail company loses $200K annually due to inventory mismatches across channels. Needs real-time sync.', problemStatement: 'Build scalable e-commerce with real-time inventory management, payment processing, and admin dashboard.', solution: 'Full-stack platform with Next.js, Node.js, PostgreSQL, Redis, WebSocket for real-time updates, Stripe integration.', skills: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe API'] },
    { title: 'Social Media Analytics Dashboard', caseStudy: 'Marketing team spends 6+ hours daily compiling metrics from 5 platforms. Tool improves RTI by 60%.', problemStatement: 'Consolidate metrics from Instagram, Twitter, TikTok, LinkedIn with predictive insights.', solution: 'React dashboard with Chart.js, API integrations (OAuth), real-time data sync, PDF/CSV export.', skills: ['React', 'Chart.js', 'OAuth 2.0', 'REST APIs', 'Data visualization'] },
    { title: 'Real-Time Collaborative Document Editor', caseStudy: 'Remote teams lose 4+ hours weekly in sync/version conflicts. Collaborative editor reduces to 15 min.', problemStatement: 'Multi-user editing with <50ms sync latency, conflict resolution, version history.', solution: 'WebSocket with Operational Transformation, CodeMirror, MongoDB, Docker deployment.', skills: ['WebSocket', 'React', 'Node.js', 'OT algorithms', 'Docker'] },
    { title: 'Video Streaming Platform', caseStudy: 'Content creators need scalable platform. Adaptive bitrate reduces buffering complaints by 40%.', problemStatement: 'Build Netflix-like platform with HLS/DASH streaming, adaptive bitrate, CDN integration.', solution: 'FFmpeg transcoding, AWS MediaConvert, CloudFront CDN, React player, subscription management.', skills: ['Video encoding', 'HLS/DASH', 'AWS', 'React', 'PostgreSQL'] },
    { title: 'Progressive Web App (Offline-First)', caseStudy: 'PWA generates 3x more revenue than traditional web. Installation rate 340% higher.', problemStatement: 'Build app working offline with background sync, push notifications, home screen install.', solution: 'Service Workers, IndexedDB, Web App Manifest, Firebase Cloud Messaging.', skills: ['PWA', 'Service Workers', 'IndexedDB', 'React'] },
  ];

  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const bp = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${bp.title} - ${subdomain} v${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 15 + (i % 50),
        estimatedMaxTime: 30 + (i % 50) + 20,
        caseStudy: `${bp.caseStudy} Implementation variation ${i + 1} focused on ${subdomain}.`,
        problemStatement: `${bp.problemStatement} With focus on ${subdomain} implementation patterns.`,
        solutionDescription: `${bp.solution} Includes error handling, monitoring, CI/CD pipeline.`,
        prerequisites: [...bp.skills, 'Git', 'Testing frameworks', 'Docker'],
        deliverables: ['Working application', 'Docker container', 'API documentation', 'Test coverage report'],
        optionalExtensions: 'Add AI features, mobile app, advanced caching, microservices architecture',
        evaluationCriteria: 'Functionality (30%), Performance (25%), Code quality (20%), Documentation (15%), Deployment (10%)',
        technicalSkills: bp.skills,
        toolsUsed: ['Git', 'Docker', 'VS Code', 'Postman'],
        conceptsUsed: ['API Design', 'Database Design', 'Security'],
        introduction: `Master ${subdomain} development with real-world constraints. Build ${bp.title} that scales to production.`,
      });
    }
  }
  return projects;
}

function generateAIProjects(): any[] {
  const subDomains = ['NLP', 'Computer Vision', 'Speech Processing', 'Generative Models'];
  const projects: any[] = [];
  const baseProjects = [
    { title: 'Customer Support Chatbot', caseStudy: 'Support team handles 2000 tickets/day. Chatbot reduces response time from 12h to 2m, satisfaction up 22%.', problemStatement: 'Build intelligent chatbot handling 70% of queries, understanding context, routing complex issues.', solution: 'BERT/GPT for intent classification, entity extraction, context preservation, fallback routing.', skills: ['NLP', 'Python', 'BERT', 'FastAPI', 'Rasa'] },
    { title: 'Defect Detection System', caseStudy: 'Manufacturing plant detects 98% of defects manually. AutoML system reaches 99.2%, cuts costs 40%.', problemStatement: 'Real-time defect identification on production line with >99% accuracy.', solution: 'YOLOv8 object detection, trained on 10K+ images, edge deployment on Jetson.', skills: ['Computer Vision', 'PyTorch', 'YOLOv8', 'OpenCV', 'Edge AI'] },
    { title: 'Voice Assistant', caseStudy: 'Smart home adoption 65% higher with voice control. Users complete tasks 3x faster.', problemStatement: 'Build voice interface understanding natural speech, executing commands, maintaining context.', solution: 'Whisper speech recognition, Rasa NLU, pyttsx3 TTS, MQTT device control.', skills: ['ASR', 'NLU', 'Python', 'Speech synthesis', 'IoT'] },
    { title: 'Text-to-Image Generation', caseStudy: 'Fashion brand generates 50K product images using fine-tuned diffusion. Saves $3M photography.', problemStatement: 'Fine-tune generative model for brand-specific image generation with style consistency.', solution: 'Stable Diffusion with LoRA fine-tuning, ControlNet for layout, Gradio interface.', skills: ['Diffusion models', 'LoRA', 'Python', 'GPU optimization'] },
    { title: 'Recommendation with LLM Re-ranking', caseStudy: 'Platform improves match quality 45% using LLM re-ranking. Engagement rate 31% (was 12%).', problemStatement: 'Two-stage recommender: CF for candidates, LLM for semantic re-ranking.', solution: 'Collaborative filtering + GPT re-ranking, embedding vectors, scoring pipeline.', skills: ['CF', 'LLMs', 'Embeddings', 'Python', 'ML ops'] },
  ];

  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const bp = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${bp.title} - ${subdomain} v${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 20 + (i % 50),
        estimatedMaxTime: 40 + (i % 50) + 20,
        caseStudy: `${bp.caseStudy} Specialized ${subdomain} variant ${i + 1}.`,
        problemStatement: `${bp.problemStatement} Focused on ${subdomain} techniques.`,
        solutionDescription: `${bp.solution} Including model evaluation, benchmarking, deployment.`,
        prerequisites: [...bp.skills, 'Python fundamentals', 'ML basics'],
        deliverables: ['Trained model', 'Inference API', 'Performance metrics', 'Deployment guide'],
        optionalExtensions: 'Add explainability (SHAP), multi-model ensemble, continuous learning, monitoring',
        evaluationCriteria: 'Model accuracy (35%), Inference speed (25%), Robustness (20%), Documentation (15%), Scalability (5%)',
        technicalSkills: bp.skills,
        toolsUsed: ['Python', 'PyTorch/TensorFlow', 'FastAPI', 'Docker'],
        conceptsUsed: ['Neural networks', 'Transfer learning', 'Model evaluation'],
        introduction: `Master ${subdomain} at scale. Build production AI systems with state-of-the-art results.`,
      });
    }
  }
  return projects;
}

function generateMLProjects(): any[] {
  const subDomains = ['Time Series', 'Classification', 'Regression', 'Clustering'];
  const projects: any[] = [];
  const baseProjects = [
    { title: 'Sales Forecasting', caseStudy: 'Retail chain forecasts demand 88% accurately 2 weeks ahead. Inventory costs down 22%.', problemStatement: 'Predict 4-week sales for 500+ SKUs considering seasonality, trends, promotions.', solution: 'ARIMA/Prophet/LSTM with feature engineering, automated retraining, REST API, dashboard.', skills: ['Time series', 'Prophet', 'LSTM', 'Python', 'SQL'] },
    { title: 'Churn Prediction', caseStudy: 'SaaS company reduces churn 8% to 4% via targeted retention. Saves $5M annually.', problemStatement: 'Identify at-risk customers 30 days before cancellation with 85%+ recall.', solution: 'Logistic regression + gradient boosting, SMOTE for imbalance, SHAP explainability.', skills: ['Classification', 'XGBoost', 'Feature engineering', 'Python', 'SHAP'] },
    { title: 'Recommendation Engine', caseStudy: 'Online library engagement up 40% via recommendations. Users finding items: 23% to 63%.', problemStatement: 'Recommend items achieving 30%+ CTR, handling 1M+ users, 100K+ items.', solution: 'Matrix factorization, embeddings, content-based filtering, cold-start handling.', skills: ['CF', 'Embeddings', 'Elasticsearch', 'Python'] },
    { title: 'Anomaly Detection', caseStudy: 'Cloud provider detects issues 10-15 min before downtime. Downtime 8h to 45m/month.', problemStatement: 'Detect anomalies in infrastructure metrics with <5% false positive rate.', solution: 'Isolation Forest, DBSCAN, autoencoders, adaptive thresholds, alerting system.', skills: ['Unsupervised learning', 'Statistics', 'Python', 'Time series'] },
    { title: 'Price Optimization', caseStudy: 'E-commerce optimizes pricing. Revenue up 18% ($50M), margins up 12%.', problemStatement: 'Dynamic pricing considering elasticity, competition, inventory, maximizing revenue.', solution: 'Demand elasticity modeling, competitor monitoring, optimization engine, A/B testing.', skills: ['Regression', 'Optimization', 'Causal inference', 'Python'] },
  ];

  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const bp = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${bp.title} - ${subdomain} v${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 25 + (i % 50),
        estimatedMaxTime: 45 + (i % 50) + 20,
        caseStudy: `${bp.caseStudy} Using ${subdomain} techniques with variant ${i + 1}.`,
        problemStatement: `${bp.problemStatement} Implemented via ${subdomain} analysis.`,
        solutionDescription: `${bp.solution} With enhanced feature engineering and deployment.`,
        prerequisites: [...bp.skills, 'Statistics', 'A/B testing basics'],
        deliverables: ['ML model', 'Pipeline script', 'Analysis report', 'Performance dashboard'],
        optionalExtensions: 'Add ensemble methods, AutoML exploration, hyperparameter optimization',
        evaluationCriteria: 'Model accuracy (35%), Business impact (30%), Scalability (20%), Documentation (15%)',
        technicalSkills: bp.skills,
        toolsUsed: ['Scikit-learn', 'XGBoost', 'Python', 'Jupyter'],
        conceptsUsed: ['Feature engineering', 'Model evaluation', 'Cross-validation'],
        introduction: `Leverage ${subdomain} ML for business impact. Build models generating millions in value.`,
      });
    }
  }
  return projects;
}

function generateDataScienceProjects(): any[] {
  const subDomains = ['Statistical Analysis', 'Business Analytics', 'Data Engineering', 'Experimentation'];
  const projects: any[] = [];
  const baseProjects = [
    { title: 'Customer Segmentation', caseStudy: 'Retail segments 10M customers into 8 groups. Personalized marketing ROI up 240%.', problemStatement: 'Segment customers into actionable groups for targeted campaigns.', solution: 'K-Means/DBSCAN clustering, RFM analysis, feature normalization, segment profiling.', skills: ['Clustering', 'RFM', 'Python', 'Pandas', 'Visualization'] },
    { title: 'A/B Testing Platform', caseStudy: 'Experimentation platform powers 500+ companies. Average experiment ROI: 250%.', problemStatement: 'Statistical framework for A/B testing with significance testing, power analysis.', solution: 'Hypothesis testing, power analysis, Bayesian methods, sensitivity analysis.', skills: ['Statistics', 'Hypothesis testing', 'Python', 'SciPy'] },
    { title: 'Time Series Forecasting', caseStudy: 'Energy company forecasts demand 96% accurately. Optimizes generation, saves $50M annually.', problemStatement: 'Deep learning forecasting for electricity demand with uncertainty quantification.', solution: 'LSTM/Transformer models, attention mechanisms, external regressors, probabilistic forecasts.', skills: ['Deep learning', 'Time series', 'PyTorch', 'TensorFlow'] },
    { title: 'Network Analysis', caseStudy: 'Social network improves recommendations via graph analysis. Engagement up 65%.', problemStatement: 'Community detection, influence analysis, anomaly detection in networks.', solution: 'PageRank, clustering algorithms, centrality measures, graph embeddings.', skills: ['Graph theory', 'NetworkX', 'Python', 'Algorithms'] },
    { title: 'Customer Lifetime Value', caseStudy: 'SaaS company predicts CLV, personalizes pricing. Revenue per customer up 35%.', problemStatement: 'Predict customer lifetime value for personalized retention campaigns.', solution: 'Regression models with behavioral features, cohort analysis, churn integration.', skills: ['Regression', 'Causal inference', 'Python', 'SQL'] },
  ];

  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const bp = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${bp.title} - ${subdomain} v${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 22 + (i % 50),
        estimatedMaxTime: 42 + (i % 50) + 20,
        caseStudy: `${bp.caseStudy} Analyzed using ${subdomain} approach, iteration ${i + 1}.`,
        problemStatement: `${bp.problemStatement} Via ${subdomain} methods and analytical frameworks.`,
        solutionDescription: `${bp.solution} Including data quality checks, visualization, and reporting.`,
        prerequisites: [...bp.skills, 'SQL', 'Data exploration'],
        deliverables: ['Analysis report', 'Visualizations', 'Data pipeline', 'Recommendations'],
        optionalExtensions: 'Add predictive modeling, causal analysis, advanced visualizations',
        evaluationCriteria: 'Analysis quality (30%), Business insights (30%), Data integrity (20%), Visualization (15%), Documentation (5%)',
        technicalSkills: bp.skills,
        toolsUsed: ['Python', 'Pandas', 'Matplotlib', 'SQL'],
        conceptsUsed: ['Data quality', 'Statistical inference', 'Business metrics'],
        introduction: `Transform data into business insights. Master ${subdomain} analytics powering billion-dollar decisions.`,
      });
    }
  }
  return projects;
}

function generateCybersecurityProjects(): any[] {
  const subDomains = ['Offensive Security', 'Cloud Security', 'Network Security', 'Application Security'];
  const projects: any[] = [];
  const baseProjects = [
    { title: 'Penetration Testing Framework', caseStudy: 'Automated pentest cuts time from 30 days to 1 day. Discoveries: 340 issues vs 120 manually.', problemStatement: 'Automated scanning for OWASP Top 10, generating reports, CI/CD integration.', solution: 'Port/service enumeration, vulnerability detection, custom exploits, risk scoring.', skills: ['Security testing', 'Python', 'Burp Suite', 'Metasploit'] },
    { title: 'Zero-Trust Architecture', caseStudy: 'Enterprise prevents ransomware via compromised VPN with zero-trust. Eliminates 3 breach vectors.', problemStatement: 'Design architecture verifying every access, implementing microsegmentation.', solution: 'Identity/access management, device compliance, network segmentation, encryption.', skills: ['Network security', 'Authentication', 'Cryptography', 'Cloud security'] },
    { title: 'Cloud Misconfiguration Detection', caseStudy: 'Platform finds 50K+ misconfigurations daily. Prevents 100+ breaches yearly.', problemStatement: 'Detect exposed S3 buckets, open security groups, encryption gaps.', solution: 'Cloud scanner for AWS/Azure/GCP, compliance checking, remediation automation.', skills: ['Cloud services', 'IaC', 'Python', 'Compliance'] },
    { title: 'Malware Analysis', caseStudy: 'Analyzes 500K samples daily. ML classification: 98% accuracy. Detects 20+ families.', problemStatement: 'Classify malware (ransomware, trojans, worms), extract IoCs, track campaigns.', solution: 'Static/dynamic analysis, behavior extraction, signature generation, ML classification.', skills: ['Malware analysis', 'Reverse engineering', 'Python', 'YARA'] },
    { title: 'Incident Response Toolkit', caseStudy: 'Forensic investigation finds breach scope. Reduces impact from $500M potential to $20M managed.', problemStatement: 'Artifact collection, timeline analysis, evidence extraction, incident reports.', solution: 'Forensics toolkit, artifact recovery, chain-of-custody, incident reporting.', skills: ['Digital forensics', 'System internals', 'Python', 'DFIR'] },
  ];

  for (const subdomain of subDomains) {
    for (let i = 0; i < 50; i++) {
      const bp = baseProjects[i % baseProjects.length];
      projects.push({
        title: `${bp.title} - ${subdomain} v${i + 1}`,
        subDomain: subdomain,
        difficulty: (i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD') as Difficulty,
        estimatedMinTime: 30 + (i % 50),
        estimatedMaxTime: 50 + (i % 50) + 20,
        caseStudy: `${bp.caseStudy} With emphasis on ${subdomain} controls.`,
        problemStatement: `${bp.problemStatement} Using ${subdomain} best practices.`,
        solutionDescription: `${bp.solution} Including threat modeling, security hardening, compliance.`,
        prerequisites: [...bp.skills, 'Networking', 'Linux/Windows'],
        deliverables: ['Security system', 'Assessment report', 'Remediation guide', 'Monitoring setup'],
        optionalExtensions: 'Add threat intelligence, automation, incident response, compliance reporting',
        evaluationCriteria: 'Security effectiveness (35%), Coverage (25%), Usability (20%), Documentation (15%), Compliance (5%)',
        technicalSkills: bp.skills,
        toolsUsed: ['Python', 'Security tools', 'Docker'],
        conceptsUsed: ['Threat modeling', 'Security patterns', 'Risk assessment'],
        introduction: `Master ${subdomain} protecting enterprises. Build security systems preventing billion-dollar breaches.`,
      });
    }
  }
  return projects;
}

async function clearAndReseed() {
  try {
    // Step 1: Delete ALL existing GitHubProject records
    console.log('Step 1: Clearing all existing GitHubProject records...');
    const deleted = await prisma.gitHubProject.deleteMany({});
    console.log(`  Deleted ${deleted.count} old projects.`);

    // Step 2: Upsert domains
    console.log('\nStep 2: Ensuring domains exist...');
    for (const domain of Object.values(DOMAINS)) {
      await prisma.domain.upsert({
        where: { slug: domain.slug },
        update: { name: domain.name },
        create: { id: domain.id, name: domain.name, slug: domain.slug, description: `${domain.name} - Industry-grade projects and real-world challenges` },
      });
      console.log(`  Domain: ${domain.name}`);
    }

    // Step 3: Generate and seed projects
    const allSets = [
      { name: 'Web Development', domainKey: 'web', projects: generateWebProjects(), language: 'TypeScript' },
      { name: 'Artificial Intelligence', domainKey: 'ai', projects: generateAIProjects(), language: 'Python' },
      { name: 'Machine Learning', domainKey: 'ml', projects: generateMLProjects(), language: 'Python' },
      { name: 'Data Science', domainKey: 'ds', projects: generateDataScienceProjects(), language: 'Python' },
      { name: 'Cybersecurity', domainKey: 'cyber', projects: generateCybersecurityProjects(), language: 'Python' },
    ];

    let totalSeeded = 0;

    for (const set of allSets) {
      console.log(`\nStep 3: Seeding ${set.name} projects (${set.projects.length})...`);
      const domainId = (DOMAINS as any)[set.domainKey].id;

      for (let i = 0; i < set.projects.length; i++) {
        const project = set.projects[i];
        const slugBase = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const uniqueSlug = `${set.domainKey}-${slugBase}-${i}`;

        // Look up the matching repo by BASE project title (before " - SubDomain vN" suffix)
        const baseTitle = project.title.replace(/ - .+$/, '');
        const domainRepos = ALL_BASE_REPOS[set.domainKey];
        const matchedRepo = domainRepos[baseTitle];

        if (!matchedRepo) {
          console.error(`  No repo mapping for: "${baseTitle}" in domain ${set.domainKey}`);
          continue;
        }

        const repoOwner = matchedRepo.owner;
        const repoName = matchedRepo.name;
        const defaultBranch = matchedRepo.branch;
        const repoUrl = `https://github.com/${repoOwner}/${repoName}`;
        const downloadUrl = `${repoUrl}/archive/refs/heads/${defaultBranch}.zip`;
        const liveUrl = matchedRepo.liveUrl || repoUrl;

        // Use real stats with small random variation so cards aren't all identical
        const variance = () => Math.floor(Math.random() * 400) - 200;
        const stars = Math.max(50, matchedRepo.stars + variance());
        const forks = Math.max(10, matchedRepo.forks + variance());
        const downloadCount = Math.floor(Math.random() * 2000) + 100;

        await prisma.gitHubProject.create({
          data: {
            title: project.title,
            description: project.problemStatement,
            repoUrl,
            repoOwner,
            repoName,
            defaultBranch,
            downloadUrl,
            liveUrl,
            stars,
            forks,
            downloadCount,
            domainId,
            language: set.language,
            difficulty: project.difficulty,
            subDomain: project.subDomain,
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
            author: 'Project Hub',
          } as any,
        });
      }

      console.log(`  ✓ ${set.name}: ${set.projects.length} projects seeded`);
      totalSeeded += set.projects.length;
    }

    console.log(`\n✅ Clear & Re-seed completed! Total: ${totalSeeded} projects`);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearAndReseed();
