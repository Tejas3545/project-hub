/**
 * Generate Unique Content for 7 Project Sections
 * 
 * This script generates unique, contextual content for each GitHub project:
 * 1. The Case Study (The Story)
 * 2. Problem Statement
 * 3. Solution Description
 * 4. Prerequisites
 * 5. Tech Stack (already exists)
 * 6. Deliverables
 * 7. Supposed Deadline
 */

import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Content generation templates based on project characteristics
const contentGenerators = {
  /**
   * Generate a unique case study story based on project details
   */
  generateCaseStudy: (project: any): string => {
    const personas = [
      { name: 'Sarah', role: 'small business owner', industry: 'retail' },
      { name: 'Michael', role: 'software engineer', industry: 'tech startup' },
      { name: 'Dr. Emily Chen', role: 'healthcare professional', industry: 'medical' },
      { name: 'James Rodriguez', role: 'data analyst', industry: 'finance' },
      { name: 'Lisa Thompson', role: 'project manager', industry: 'consulting' },
      { name: 'David Kim', role: 'DevOps engineer', industry: 'enterprise software' },
      { name: 'Rachel Green', role: 'marketing manager', industry: 'e-commerce' },
      { name: 'Tom Wilson', role: 'systems administrator', industry: 'IT services' },
      { name: 'Maria Garcia', role: 'product owner', industry: 'SaaS' },
      { name: 'Chris Anderson', role: 'technical lead', industry: 'cloud computing' }
    ];

    // Select persona based on project characteristics
    const persona = personas[Math.floor(Math.random() * personas.length)];
    
    // Generate context-aware story
    const techContext = project.language || 'software';
    const starsContext = project.stars > 10000 ? 'widely adopted' : project.stars > 1000 ? 'established' : 'emerging';
    
    const problem = getProblemScenario(project);
    const impact = getImpactScenario(project);
    
    return `${persona.name}, a ${persona.role} in the ${persona.industry} industry, faced a critical challenge: ${problem}. ${impact}. This ${starsContext} ${techContext}-based solution emerged as the perfect fit to address these specific needs and transform their workflow.`;
  },

  /**
   * Generate a clear problem statement
   */
  generateProblemStatement: (project: any): string => {
    const techStack = project.techStack || [];
    const primaryTech = techStack[0] || project.language || 'software development';
    
    const problemTemplates = [
      `Traditional approaches to ${getProjectDomain(project)} lack automated capabilities, leading to inefficiency, manual errors, and scalability issues. The absence of modern ${primaryTech}-based solutions creates a significant gap in productivity and reliability.`,
      `Organizations struggle with ${getProjectChallenge(project)} due to outdated systems and lack of integration between critical tools. This creates data silos, reduces operational efficiency, and increases the risk of errors in ${getProjectDomain(project)}.`,
      `The manual processes involved in ${getProjectDomain(project)} are time-consuming and prone to inconsistencies. Without an automated, ${primaryTech}-powered solution, teams face bottlenecks that prevent scaling and innovation.`,
      `Current solutions for ${getProjectDomain(project)} lack the flexibility and robustness needed for modern workflows. The technical debt from legacy systems and insufficient automation creates ongoing maintenance challenges and limits growth potential.`,
      `Teams working on ${getProjectDomain(project)} need better tools that can handle complex requirements while maintaining security, performance, and reliability. The gap between available tools and actual needs has become a critical barrier to success.`
    ];
    
    return problemTemplates[Math.floor(Math.random() * problemTemplates.length)];
  },

  /**
   * Generate solution description
   */
  generateSolutionDescription: (project: any): string => {
    const techStack = (project.techStack || []).join(', ');
    const title = project.title;
    
    return `${title} is a ${getDifficultyDescription(project.difficulty)} solution that leverages ${techStack || project.language || 'modern technology'} to ${getSolutionApproach(project)}. The project implements ${getKeyFeatures(project)}, providing a comprehensive platform that addresses both immediate needs and long-term scalability. With ${project.stars.toLocaleString()}+ GitHub stars and ${project.forks.toLocaleString()}+ forks, it has proven its value in production environments worldwide.`;
  },

  /**
   * Generate prerequisites based on difficulty and tech stack
   */
  generatePrerequisites: (project: any): string[] => {
    const techStack = project.techStack || [];
    const difficulty = project.difficulty;
    
    let prerequisites: string[] = [];
    
    // Base prerequisites for all levels
    prerequisites.push('Basic understanding of version control with Git');
    prerequisites.push('Familiarity with command line/terminal operations');
    
    // Language-specific prerequisites
    if (project.language?.toLowerCase().includes('python')) {
      prerequisites.push('Python programming fundamentals and syntax');
      prerequisites.push('Understanding of virtual environments and pip package management');
      if (difficulty !== 'EASY') prerequisites.push('Experience with Python frameworks and asynchronous programming');
    } else if (project.language?.toLowerCase().includes('javascript') || 
               project.language?.toLowerCase().includes('typescript')) {
      prerequisites.push('JavaScript/TypeScript fundamentals and ES6+ features');
      prerequisites.push('Understanding of Node.js and npm/yarn package management');
      if (difficulty !== 'EASY') prerequisites.push('Experience with modern JavaScript frameworks and build tools');
    } else if (project.language?.toLowerCase().includes('java')) {
      prerequisites.push('Java programming fundamentals and OOP concepts');
      prerequisites.push('Understanding of Maven or Gradle build systems');
      if (difficulty !== 'EASY') prerequisites.push('Experience with Spring ecosystem and dependency injection');
    } else if (project.language?.toLowerCase().includes('go')) {
      prerequisites.push('Go programming fundamentals and concurrency patterns');
      prerequisites.push('Understanding of Go modules and workspace management');
      if (difficulty !== 'EASY') prerequisites.push('Experience with Go interfaces and advanced error handling');
    }
    
    // Tech stack specific prerequisites
    if (techStack.some((t: string) => t.toLowerCase().includes('react'))) {
      prerequisites.push('React hooks, component lifecycle, and state management');
    }
    if (techStack.some((t: string) => t.toLowerCase().includes('docker'))) {
      prerequisites.push('Basic Docker concepts: containers, images, and docker-compose');
    }
    if (techStack.some((t: string) => t.toLowerCase().includes('kubernetes'))) {
      prerequisites.push('Kubernetes fundamentals: pods, services, and deployments');
    }
    if (techStack.some((t: string) => t.toLowerCase().includes('database') || 
                         t.toLowerCase().includes('sql') || 
                         t.toLowerCase().includes('mongo') || 
                         t.toLowerCase().includes('postgres'))) {
      prerequisites.push('Database design principles and SQL/NoSQL query basics');
    }
    
    // Difficulty-specific additions
    if (difficulty === 'MEDIUM' || difficulty === 'HARD') {
      prerequisites.push('Understanding of RESTful API design and HTTP protocols');
      prerequisites.push('Experience with testing frameworks and CI/CD concepts');
    }
    
    if (difficulty === 'HARD') {
      prerequisites.push('Advanced architectural patterns and system design knowledge');
      prerequisites.push('Production deployment experience and security best practices');
    }
    
    return prerequisites.slice(0, 7); // Limit to 7 most relevant
  },

  /**
   * Generate deliverables based on project type
   */
  generateDeliverables: (project: any): string[] => {
    const deliverables: string[] = [];
    
    // Core deliverables
    deliverables.push('Fully functional application with all core features implemented');
    deliverables.push('Complete source code hosted on GitHub with proper repository structure');
    deliverables.push('Comprehensive README.md with setup instructions, usage guide, and architecture overview');
    
    // Testing deliverables
    if (project.difficulty !== 'EASY') {
      deliverables.push('Unit tests covering critical functionality with minimum 70% code coverage');
      deliverables.push('Integration tests demonstrating end-to-end workflows');
    }
    
    // Documentation deliverables
    deliverables.push('API documentation (if applicable) with endpoint descriptions and example requests/responses');
    deliverables.push('Architecture diagram showing system components and data flow');
    
    // Deployment deliverables
    if (project.difficulty === 'HARD') {
      deliverables.push('Docker configuration files for containerized deployment');
      deliverables.push('CI/CD pipeline configuration (GitHub Actions, Jenkins, or similar)');
    }
    
    // Demo deliverables
    deliverables.push('2-3 minute video demonstration showcasing key features and user workflows');
    
    if (project.liveUrl) {
      deliverables.push('Deployed live demo accessible via provided URL');
    }
    
    // Security and performance
    if (project.difficulty !== 'EASY') {
      deliverables.push('Security assessment documenting implemented protections and potential vulnerabilities');
    }
    
    return deliverables.slice(0, 8); // Limit to 8 most relevant
  },

  /**
   * Generate realistic deadline based on difficulty
   */
  generateDeadline: (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'EASY':
        return '1-2 Weeks';
      case 'MEDIUM':
        return '2-3 Weeks';
      case 'HARD':
        return '3-4 Weeks';
      default:
        return '2-3 Weeks';
    }
  }
};

// Helper functions
function getProblemScenario(project: any): string {
  const scenarios = [
    'inefficient manual processes were consuming valuable time and resources',
    'legacy systems couldn\'t scale to meet growing demand',
    'data silos prevented effective collaboration across teams',
    'security vulnerabilities exposed critical business operations',
    'maintenance overhead from technical debt was becoming unsustainable',
    'lack of automation led to frequent errors and inconsistencies',
    'poor observability made troubleshooting and optimization difficult',
    'integration challenges between disparate systems caused workflow bottlenecks'
  ];
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

function getImpactScenario(project: any): string {
  const impacts = [
    'This resulted in decreased productivity, increased operational costs, and missed opportunities',
    'The impact was significant: delayed deliveries, customer dissatisfaction, and mounting technical debt',
    'These issues created ripple effects across the organization, affecting both efficiency and morale',
    'The consequences included lost revenue, competitive disadvantage, and difficulty in attracting talent',
    'This led to resource drain, reduced innovation capacity, and increased risk exposure'
  ];
  return impacts[Math.floor(Math.random() * impacts.length)];
}

function getProjectDomain(project: any): string {
  const title = project.title.toLowerCase();
  const description = project.description.toLowerCase();
  
  if (title.includes('api') || description.includes('api')) return 'API development and management';
  if (title.includes('web') || description.includes('web')) return 'web application development';
  if (title.includes('data') || description.includes('data')) return 'data processing and analytics';
  if (title.includes('security') || description.includes('security')) return 'security and compliance';
  if (title.includes('monitor') || description.includes('monitor')) return 'system monitoring and observability';
  if (title.includes('deploy') || description.includes('deploy')) return 'deployment and infrastructure';
  if (title.includes('test') || description.includes('test')) return 'testing and quality assurance';
  if (title.includes('auth') || description.includes('auth')) return 'authentication and authorization';
  
  return 'software development';
}

function getProjectChallenge(project: any): string {
  const challenges = [
    'managing complex workflows',
    'maintaining system reliability',
    'ensuring data consistency',
    'scaling infrastructure',
    'implementing security measures',
    'optimizing performance',
    'integrating multiple services',
    'automating repetitive tasks'
  ];
  return challenges[Math.floor(Math.random() * challenges.length)];
}

function getDifficultyDescription(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'EASY':
      return 'beginner-friendly';
    case 'MEDIUM':
      return 'intermediate-level, production-ready';
    case 'HARD':
      return 'advanced, enterprise-grade';
    default:
      return 'comprehensive';
  }
}

function getSolutionApproach(project: any): string {
  const approaches = [
    'automate complex workflows and eliminate manual intervention',
    'provide real-time insights and actionable intelligence',
    'streamline operations and improve team collaboration',
    'ensure security, reliability, and scalability',
    'integrate seamlessly with existing infrastructure',
    'optimize performance and reduce operational costs',
    'simplify complex processes with intuitive interfaces',
    'enable rapid deployment and continuous improvement'
  ];
  return approaches[Math.floor(Math.random() * approaches.length)];
}

function getKeyFeatures(project: any): string {
  const features = [
    'robust error handling, comprehensive logging, and automated recovery mechanisms',
    'flexible configuration, extensible architecture, and plugin support',
    'real-time processing, caching strategies, and performance optimization',
    'role-based access control, encryption, and security best practices',
    'distributed architecture, horizontal scaling, and load balancing',
    'intuitive CLI and web interface, detailed documentation, and active community support',
    'automated testing, continuous integration, and deployment pipelines',
    'monitoring dashboards, alerting systems, and detailed analytics'
  ];
  return features[Math.floor(Math.random() * features.length)];
}

/**
 * Main execution function
 */
async function generateContentForAllProjects() {
  try {
    console.log('🚀 Starting unique content generation for GitHub projects...\n');

    // Fetch all active GitHub projects
    const projects = await prisma.gitHubProject.findMany({
      where: { isActive: true },
      orderBy: { stars: 'desc' }
    });

    console.log(`📊 Found ${projects.length} projects to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const project of projects) {
      try {
        console.log(`\n📝 Processing: ${project.title}`);
        console.log(`   Language: ${project.language}, Difficulty: ${project.difficulty}, Stars: ${project.stars}`);

        // Generate all 7 sections content
        const caseStudy = contentGenerators.generateCaseStudy(project);
        const problemStatement = contentGenerators.generateProblemStatement(project);
        const solutionDescription = contentGenerators.generateSolutionDescription(project);
        const prerequisites = contentGenerators.generatePrerequisites(project);
        const deliverables = contentGenerators.generateDeliverables(project);
        const supposedDeadline = contentGenerators.generateDeadline(project.difficulty);

        // Update the project with generated content
        await prisma.gitHubProject.update({
          where: { id: project.id },
          data: {
            caseStudy,
            problemStatement,
            solutionDescription,
            prerequisites,
            deliverables,
            supposedDeadline
          }
        });

        updatedCount++;
        console.log(`   ✅ Updated successfully`);
        console.log(`   Case Study Preview: ${caseStudy.substring(0, 100)}...`);

      } catch (error) {
        console.error(`   ❌ Error processing project ${project.title}:`, error);
        skippedCount++;
      }
    }

    console.log('\n\n🎉 Content Generation Complete!');
    console.log(`   ✅ Successfully updated: ${updatedCount} projects`);
    console.log(`   ⚠️  Skipped: ${skippedCount} projects`);
    console.log('\n📊 Summary:');
    console.log(`   Total projects: ${projects.length}`);
    console.log(`   Success rate: ${((updatedCount / projects.length) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Fatal error during content generation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  generateContentForAllProjects()
    .then(() => {
      console.log('\n✨ Process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Process failed:', error);
      process.exit(1);
    });
}

export { generateContentForAllProjects, contentGenerators };
