-- Fix difficulty values to match frontend filter
UPDATE "GitHubProject" SET difficulty = 'Beginner' WHERE difficulty = 'EASY';
UPDATE "GitHubProject" SET difficulty = 'Intermediate' WHERE difficulty = 'MEDIUM';
UPDATE "GitHubProject" SET difficulty = 'Advanced' WHERE difficulty = 'HARD';

-- Verify the update
SELECT difficulty, COUNT(*) as count 
FROM "GitHubProject" 
GROUP BY difficulty;

-- Verify projects are domain-specific
SELECT d.name as domain, COUNT(g.id) as project_count
FROM "Domain" d
LEFT JOIN "GitHubProject" g ON g."domainId" = d.id
GROUP BY d.id, d.name
ORDER BY d.name;
