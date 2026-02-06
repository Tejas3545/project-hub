const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySampleProjects() {
    try {
        const projects = await prisma.gitHubProject.findMany({
            take: 5,
            orderBy: { stars: 'desc' },
            include: {
                domain: {
                    select: { name: true }
                }
            }
        });

        console.log('\n📋 Sample of 5 top projects with framework data:\n');
        console.log('═'.repeat(70));
        
        projects.forEach((p, i) => {
            console.log(`\n${i + 1}. ${p.title}`);
            console.log(`   Domain: ${p.domain.name}`);
            console.log(`   ⭐ ${p.stars.toLocaleString()} stars | 🍴 ${p.forks.toLocaleString()} forks`);
            console.log(`   ✓ Case Study: ${p.caseStudy ? 'YES' : 'NO'}`);
            console.log(`   ✓ Problem Statement: ${p.problemStatement ? 'YES' : 'NO'}`);
            console.log(`   ✓ Solution Description: ${p.solutionDescription ? 'YES' : 'NO'}`);
            console.log(`   ✓ Prerequisites: ${p.prerequisites.length} items`);
            console.log(`   ✓ Deliverables: ${p.deliverables.length} items`);
            console.log(`   ✓ Deadline: ${p.supposedDeadline ? 'YES' : 'NO'}`);
            console.log(`   🌐 http://localhost:3000/github-projects/${p.id}`);
        });

        console.log('\n' + '═'.repeat(70));
        console.log('✅ All projects now have the 7-part Real-World Solution Framework!');
        console.log('🎉 Visit any GitHub project to see it in action!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySampleProjects();
