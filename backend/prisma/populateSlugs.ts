import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create URL-friendly slug
function createSlug(title: string, id: string): string {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
    
    // Add first 8 chars of ID to ensure uniqueness
    return `${baseSlug}-${id.substring(0, 8)}`;
}

async function populateSlugs() {
    try {
        console.log('Starting slug population for github_projects...');
        
        // Get all projects without slugs
        const projects = await prisma.gitHubProject.findMany({
            where: {
                slug: null
            },
            select: {
                id: true,
                title: true
            }
        });

        console.log(`Found ${projects.length} projects without slugs`);

        // Update each project
        let updated = 0;
        for (const project of projects) {
            const slug = createSlug(project.title, project.id);
            await prisma.gitHubProject.update({
                where: { id: project.id },
                data: { slug }
            });
            updated++;
            
            if (updated % 50 === 0) {
                console.log(`Updated ${updated}/${projects.length} projects...`);
            }
        }

        console.log(`✅ Successfully updated ${updated} projects with slugs`);
    } catch (error) {
        console.error('Error populating slugs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

populateSlugs();
