const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Framework data templates based on domain
const frameworkTemplates = {
    'Web Development': {
        caseStudy: (project) => `A rapidly growing startup needed to modernize their web application architecture. Their legacy system was struggling with performance issues and couldn't scale to meet increasing user demand. The development team evaluated multiple solutions and chose ${project.title} for its robust features, active community support, and proven track record in production environments. This project became the foundation of their new scalable platform.`,
        
        problemStatement: (project) => `Modern web applications face critical challenges: maintaining high performance under heavy load, ensuring security against evolving threats, providing excellent user experience across devices, managing complex state and data flow, implementing efficient build and deployment processes, and maintaining code quality as teams grow. ${project.title} addresses these challenges with a comprehensive approach.`,
        
        solutionDescription: (project) => `${project.title} provides a complete solution for building modern web applications. It offers optimized rendering for fast page loads, built-in security best practices, responsive design patterns, efficient state management, developer-friendly tooling, and production-ready deployment configurations. The project includes comprehensive documentation, real-world examples, and active community support to help developers build robust applications efficiently.`,
        
        prerequisites: [
            'Strong proficiency in JavaScript/TypeScript',
            'Deep understanding of HTML5 and CSS3',
            'Experience with modern web APIs and browser features',
            'Knowledge of responsive design principles',
            'Familiarity with version control (Git)',
            'Understanding of web security fundamentals (XSS, CSRF, etc.)',
            'Experience with package managers (npm/yarn)',
            'Basic understanding of backend integration and APIs'
        ],
        
        deliverables: [
            'Fully functional web application with responsive design',
            'Clean, well-documented source code following best practices',
            'Comprehensive test suite (unit, integration, e2e)',
            'Performance optimization implementation and metrics',
            'Security implementation with vulnerability assessment',
            'Deployment configuration for production environment',
            'User documentation and API documentation',
            'Project README with setup and contribution guidelines'
        ],
        
        supposedDeadline: '8-12 weeks for full implementation and deployment'
    },

    'Artificial Intelligence': {
        caseStudy: (project) => `A healthcare technology company needed to implement advanced AI capabilities to analyze medical images and assist doctors in diagnosis. They required a solution that could handle complex neural networks, process large datasets efficiently, and provide reliable predictions in a clinical setting. After evaluating several frameworks, they selected ${project.title} for its cutting-edge algorithms, extensive research backing, and production-ready infrastructure.`,
        
        problemStatement: (project) => `Implementing AI solutions presents unique challenges: training models requires massive computational resources and time, ensuring model accuracy and reliability is critical, managing different model architectures and hyperparameters is complex, deploying models to production requires optimization, monitoring model performance and drift is essential, and integrating AI pipelines with existing systems demands careful engineering. ${project.title} tackles these challenges systematically.`,
        
        solutionDescription: (project) => `${project.title} offers a comprehensive AI development platform with pre-built models and algorithms, distributed training capabilities across multiple GPUs/TPUs, advanced optimization techniques, model versioning and experiment tracking, production deployment tools, and real-time monitoring. The framework supports both research and production use cases, providing flexibility for custom implementations while maintaining ease of use for common tasks.`,
        
        prerequisites: [
            'Strong Python programming skills',
            'Solid understanding of machine learning fundamentals',
            'Knowledge of linear algebra, calculus, and statistics',
            'Experience with NumPy, Pandas, and data manipulation',
            'Understanding of neural networks and deep learning',
            'Familiarity with model evaluation metrics',
            'Experience with GPU computing (CUDA) is beneficial',
            'Knowledge of software engineering and MLOps practices'
        ],
        
        deliverables: [
            'Trained AI model with documented architecture',
            'Complete training pipeline with data preprocessing',
            'Model evaluation report with performance metrics',
            'Hyperparameter tuning results and configurations',
            'Production deployment scripts and documentation',
            'API endpoints for model inference',
            'Monitoring and logging implementation',
            'Comprehensive documentation with usage examples'
        ],
        
        supposedDeadline: '10-16 weeks for research, development, and deployment'
    },

    'Machine Learning': {
        caseStudy: (project) => `An e-commerce platform wanted to implement personalized recommendations to increase user engagement and sales. Their data science team needed a flexible ML framework that could handle large-scale data processing, support various algorithms, and integrate seamlessly with their existing infrastructure. ${project.title} provided the perfect balance of power and usability, enabling them to build, test, and deploy sophisticated ML models efficiently.`,
        
        problemStatement: (project) => `Machine learning projects face numerous obstacles: data quality and preparation consume significant time, selecting appropriate algorithms requires expertise, training at scale demands robust infrastructure, model validation and testing are complex, maintaining model performance over time requires monitoring, and productionizing models involves significant engineering effort. ${project.title} provides solutions for each of these challenges.`,
        
        solutionDescription: (project) => `${project.title} delivers an end-to-end machine learning solution with powerful data processing capabilities, extensive algorithm library, automated hyperparameter tuning, distributed training support, model evaluation tools, and production deployment features. It includes data visualization tools, experiment tracking, model registry, and serving infrastructure, making it ideal for both exploratory analysis and production systems.`,
        
        prerequisites: [
            'Proficiency in Python and data structures',
            'Strong foundation in statistics and probability',
            'Understanding of machine learning algorithms',
            'Experience with data analysis and visualization',
            'Knowledge of scikit-learn or similar ML libraries',
            'Familiarity with SQL and database operations',
            'Understanding of model evaluation techniques',
            'Experience with Jupyter notebooks and data exploration'
        ],
        
        deliverables: [
            'Complete ML pipeline from data ingestion to prediction',
            'Well-documented source code with inline comments',
            'Exploratory data analysis (EDA) report',
            'Trained models with performance benchmarks',
            'Feature engineering implementation and documentation',
            'Model evaluation and comparison report',
            'Deployment configuration and serving endpoints',
            'User guide and technical documentation'
        ],
        
        supposedDeadline: '8-14 weeks for development, testing, and deployment'
    },

    'Data Science': {
        caseStudy: (project) => `A financial services firm needed to analyze vast amounts of transaction data to identify patterns, detect anomalies, and generate business insights. Their analytics team required tools that could handle big data processing, provide statistical analysis capabilities, and create compelling visualizations for stakeholders. ${project.title} emerged as their solution, offering the perfect combination of power, flexibility, and ease of use for complex data science workflows.`,
        
        problemStatement: (project) => `Data science projects encounter specific challenges: handling massive datasets requires efficient processing, extracting meaningful insights demands advanced analytics, ensuring data quality and consistency is critical, communicating findings to non-technical stakeholders needs clear visualization, reproducibility of analyses is essential, and scaling computations for big data requires specialized infrastructure. ${project.title} addresses these needs comprehensively.`,
        
        solutionDescription: (project) => `${project.title} provides a complete data science toolkit with advanced data manipulation capabilities, statistical analysis functions, machine learning integration, interactive visualization tools, and big data processing support. It includes features for data cleaning, transformation, aggregation, and analysis, along with tools for creating publication-ready visualizations and reproducible research workflows.`,
        
        prerequisites: [
            'Strong programming skills in Python or R',
            'Deep understanding of statistics and probability theory',
            'Experience with data manipulation and cleaning',
            'Knowledge of data visualization best practices',
            'Familiarity with SQL and database queries',
            'Understanding of exploratory data analysis techniques',
            'Experience with statistical modeling',
            'Knowledge of big data concepts and distributed computing'
        ],
        
        deliverables: [
            'Complete data analysis pipeline with reproducible code',
            'Comprehensive data cleaning and preprocessing scripts',
            'Statistical analysis report with findings',
            'Interactive visualizations and dashboards',
            'Predictive models with validation results',
            'Data quality assessment and documentation',
            'Automated reporting system',
            'Technical documentation and user guides'
        ],
        
        supposedDeadline: '6-12 weeks for analysis, modeling, and reporting'
    },

    'Cybersecurity': {
        caseStudy: (project) => `A multinational corporation discovered increasing security threats targeting their infrastructure. Their security team needed advanced tools to detect vulnerabilities, monitor network traffic, and respond to incidents quickly. After evaluating multiple solutions, they implemented ${project.title} to strengthen their security posture. The tool provided comprehensive coverage for threat detection, vulnerability assessment, and security automation.`,
        
        problemStatement: (project) => `Cybersecurity presents unique challenges: threats evolve rapidly requiring constant vigilance, detecting sophisticated attacks demands advanced techniques, managing security across complex infrastructure is difficult, responding to incidents quickly is critical, ensuring compliance with regulations is mandatory, and balancing security with usability requires careful planning. ${project.title} helps organizations address these security challenges effectively.`,
        
        solutionDescription: (project) => `${project.title} offers a comprehensive security solution with vulnerability scanning, threat detection, security monitoring, incident response capabilities, and compliance checking. It includes automated security testing, real-time alerting, detailed logging and auditing, integration with security tools, and extensive reporting features. The project provides both defensive and offensive security capabilities for comprehensive protection.`,
        
        prerequisites: [
            'Strong understanding of networking fundamentals (TCP/IP, DNS, HTTP)',
            'Knowledge of operating systems (Linux, Windows) and security',
            'Experience with security tools and frameworks',
            'Understanding of common vulnerabilities (OWASP Top 10)',
            'Familiarity with cryptography and encryption',
            'Knowledge of security best practices and standards',
            'Experience with scripting (Python, Bash) for automation',
            'Understanding of threat modeling and risk assessment'
        ],
        
        deliverables: [
            'Complete security assessment report with findings',
            'Vulnerability scanning results and remediation plans',
            'Security monitoring implementation and dashboards',
            'Incident response procedures and playbooks',
            'Security automation scripts and tools',
            'Compliance checklist and audit documentation',
            'Network security configuration and hardening guide',
            'Comprehensive security documentation and training materials'
        ],
        
        supposedDeadline: '10-16 weeks for assessment, implementation, and testing'
    }
};

async function populateAllProjects() {
    try {
        console.log('🚀 Starting to populate ALL GitHub projects with Real-World Solution Framework data...\n');

        // Get all domains
        const domains = await prisma.domain.findMany({
            select: { id: true, name: true }
        });

        console.log(`📊 Found ${domains.length} domains\n`);

        let totalUpdated = 0;
        let totalSkipped = 0;

        for (const domain of domains) {
            console.log(`\n📁 Processing domain: ${domain.name}`);
            console.log('─'.repeat(60));

            // Get all projects in this domain
            const projects = await prisma.gitHubProject.findMany({
                where: { domainId: domain.id },
                orderBy: { stars: 'desc' }
            });

            console.log(`   Found ${projects.length} projects in ${domain.name}`);

            const template = frameworkTemplates[domain.name] || frameworkTemplates['Web Development'];

            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                
                // Skip if already has framework data
                if (project.caseStudy && project.problemStatement && project.solutionDescription) {
                    totalSkipped++;
                    continue;
                }

                try {
                    await prisma.gitHubProject.update({
                        where: { id: project.id },
                        data: {
                            caseStudy: template.caseStudy(project),
                            problemStatement: template.problemStatement(project),
                            solutionDescription: template.solutionDescription(project),
                            prerequisites: template.prerequisites,
                            deliverables: template.deliverables,
                            supposedDeadline: template.supposedDeadline
                        }
                    });

                    totalUpdated++;
                    
                    // Show progress every 10 projects
                    if ((i + 1) % 10 === 0) {
                        process.stdout.write(`   Progress: ${i + 1}/${projects.length} projects updated\r`);
                    }
                } catch (error) {
                    console.error(`   ❌ Failed to update ${project.title}: ${error.message}`);
                }
            }

            console.log(`   ✅ Completed ${domain.name}: ${projects.length} projects processed`);
        }

        console.log('\n' + '═'.repeat(60));
        console.log('✅ COMPLETED! Real-World Solution Framework populated for ALL projects');
        console.log('═'.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   - Total projects updated: ${totalUpdated}`);
        console.log(`   - Total projects skipped (already had data): ${totalSkipped}`);
        console.log(`   - Total projects processed: ${totalUpdated + totalSkipped}`);
        console.log('\n🌐 You can now view any GitHub project and see the 7-part framework!');
        console.log('   Example: http://localhost:3000/github-projects/<any-project-id>');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

populateAllProjects();
