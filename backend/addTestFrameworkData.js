const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestFrameworkData() {
    try {
        // NOTE: This script currently selects the top-starred project for testing purposes.
        // In production, consider filtering for specific project types (e.g., ML/fraud-detection related)
        // by adding a where clause on topics, techStack, or project tags to ensure the selected
        // project is relevant before overwriting with framework data.
        // Alternatively, add explicit user confirmation before updating the chosen project.
        const project = await prisma.gitHubProject.findFirst({
            orderBy: { stars: 'desc' }
        });

        if (!project) {
            console.log('No projects found!');
            return;
        }

        console.log(`Found project: ${project.title} (ID: ${project.id})`);

        // Update with Real-World Solution Framework data
        const updated = await prisma.gitHubProject.update({
            where: { id: project.id },
            data: {
                caseStudy: `A Fortune 500 financial institution needed to implement machine learning models for fraud detection. Their existing system was outdated and couldn't handle the scale of transactions they were processing daily. The ML team needed a flexible, scalable framework that could handle both training complex models and deploying them in production environments with low latency.`,
                
                problemStatement: `Building and deploying machine learning models at scale presents several challenges: training models requires significant computational resources, managing different model versions is complex, ensuring models perform consistently across environments is difficult, and integrating ML workflows with existing infrastructure requires significant engineering effort.`,
                
                solutionDescription: `This project provides an end-to-end machine learning platform that simplifies building, training, and deploying ML models. It offers high-level APIs for common ML tasks, supports distributed training across multiple GPUs/TPUs, includes built-in model versioning and experiment tracking, and provides production-ready serving infrastructure. The framework abstracts away complexity while remaining flexible enough for custom implementations.`,
                
                prerequisites: [
                    'Strong understanding of Python programming',
                    'Solid foundation in linear algebra and calculus',
                    'Experience with NumPy and basic data manipulation',
                    'Familiarity with machine learning concepts (supervised/unsupervised learning)',
                    'Understanding of neural networks and deep learning fundamentals',
                    'Basic knowledge of software engineering best practices'
                ],
                
                deliverables: [
                    'Complete source code with proper documentation and comments',
                    'Training pipeline implementation with data preprocessing',
                    'Model architecture definition and hyperparameter configuration',
                    'Evaluation metrics implementation and visualization',
                    'Deployment scripts for production environment',
                    'Comprehensive README with setup instructions',
                    'Unit tests covering core functionality',
                    'Performance benchmarks and optimization analysis'
                ],
                
                supposedDeadline: '6-8 weeks for implementation, testing, and deployment'
            }
        });

        console.log('\n✅ Successfully added Real-World Solution Framework data!');
        console.log(`Project ID: ${updated.id}`);
        console.log(`Project Title: ${updated.title}`);
        console.log(`\n📝 Framework Data:`);
        console.log(`- Case Study: ${updated.caseStudy ? '✓' : '✗'}`);
        console.log(`- Problem Statement: ${updated.problemStatement ? '✓' : '✗'}`);
        console.log(`- Solution Description: ${updated.solutionDescription ? '✓' : '✗'}`);
        console.log(`- Prerequisites: ${updated.prerequisites.length} items`);
        console.log(`- Deliverables: ${updated.deliverables.length} items`);
        console.log(`- Deadline: ${updated.supposedDeadline}`);
        console.log(`\n🌐 View it at: http://localhost:3000/github-projects/${updated.id}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

addTestFrameworkData();
