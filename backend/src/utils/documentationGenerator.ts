import { GitHubProject } from '@prisma/client';

export const generateProfessionalDocumentation = (project: any): string => {
    return `# ${project.title}

## 1. Project Introduction
${project.introduction || project.description}

## 2. Implementation / Framework
${project.implementation || 'Refer to source code for implementation details.'}

## 3. The Story (Case Study)
${project.caseStudy || 'Industry-standard project framework.'}

## 4. Problem Statement
${project.problemStatement || project.description}

## 5. What You Need to Build
${project.solutionDescription || 'Full implementation as per repository structure.'}

## 6. Technical Skills Used
${(project.technicalSkills || []).join(', ')}

## 7. Tools Used
${(project.toolsUsed || []).join(', ')}

## 8. Prerequisites
${project.prerequisitesText || (project.prerequisites || []).join(', ')}

## 9. Deliverables
${(project.deliverables || []).map((d: string) => `- ${d}`).join('\n')}

---
*Documented by Project Hub Review Team*
`;
};
