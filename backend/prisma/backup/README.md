# Database Backup & Recovery Procedure

## Overview

This folder contains critical scripts to rebuild your database with 500 unique GitHub projects. These files should be preserved for future database recovery scenarios.

## Files Included

### 1. `seed_500_clean.sql`

**Purpose**: Direct SQL script to seed the database with 500 real GitHub projects

**Contents**:

- Deletes existing projects
- Fetches domain IDs (cybersecurity, web-development, artificial-intelligence, machine-learning, data-science)
- Inserts 100 unique projects per domain

**How to use**:

1. Go to Supabase Dashboard: [https://supabase.com/dashboard/project/miwhxvpatqaflcxqvknu/sql/new](https://supabase.com/dashboard/project/miwhxvpatqaflcxqvknu/sql/new)
2. Copy entire contents of `seed_500_clean.sql`
3. Paste into SQL editor
4. Click RUN
5. Wait for completion (~5-10 seconds)

**Expected Result**: 500 projects in `github_projects` table

---

### 2. `generateSeed500Clean.ts`

**Purpose**: TypeScript script that generates fresh seed SQL by fetching real projects from GitHub API

**When to use**:

- If you want to update projects with fresh GitHub data
- If `seed_500_clean.sql` becomes outdated
- To add more projects beyond 500

**How to use**:

```bash
cd backend
npx tsx prisma/backup/generateSeed500Clean.ts
```

**What it does**:

1. Fetches projects from GitHub API using search queries for each domain
2. Collects 100 unique projects per domain
3. Generates `seed_500_clean.sql` with updated data
4. Takes ~3-5 minutes (includes rate limit handling)

**Output**: Creates/overwrites `seed_500_clean.sql` with fresh data

---

## Database Recovery Workflow

### Scenario 1: Database Reset/Wipe

If your database loses all data:

```sql
1. Run seed_500_clean.sql directly in Supabase SQL editor
2. Done! 500 projects will be restored
```

### Scenario 2: Update Projects with Fresh GitHub Data

```bash
1. Run: npx tsx prisma/backup/generateSeed500Clean.ts
2. Copy generated seed_500_clean.sql
3. Run in Supabase SQL editor
4. Projects updated with current GitHub stats (stars, forks, etc.)
```

### Scenario 3: Emergency Database Recovery

If database is down or inaccessible:

1. Contact Supabase support or restore from backup
2. Run `seed_500_clean.sql` to repopulate projects
3. All other data (users, domains, bookmarks) will need separate recovery

---

## Project Statistics

- **Total Projects**: 500
- **Per Domain**: 100 projects each
  - Web Development: React, Vue, Angular, Express, Django, Flask, Laravel, Rails, etc.
  - Cybersecurity: Security scanners, penetration testing, encryption, authentication, etc.
  - Artificial Intelligence: Deep learning, NLP, computer vision, transformers, etc.
  - Machine Learning: ML frameworks, gradient boosting, clustering, AutoML, etc.
  - Data Science: Data analysis, visualization, Pandas, Jupyter, Big Data, etc.

---

## Important Notes

✅ **Keep These Files Safe**

- `seed_500_clean.sql` - Quick restore from SQL
- `generateSeed500Clean.ts` - Generate fresh data anytime

❌ **Deleted/Not Needed**

- `seed.ts` - Created duplicates, removed
- `seedRealGitHubProjects.ts` - Had connection issues, removed
- `seed_unique_projects.sql` - Only had 50 projects, removed
- Debug scripts - `checkCount.ts`, `debugProjects.ts`, etc. removed
- Data files - `githubProjectsData.json`, `githubProjectsData.ts` removed

---

## Troubleshooting

**Issue**: Rate limit when running `generateSeed500Clean.ts`

**Solution**: Script automatically waits 60 seconds and retries. Just wait.

**Issue**: SQL error "syntax error at or near"

**Solution**: Use the latest `seed_500_clean.sql` from this folder. Text is properly escaped.

**Issue**: Projects not appearing in frontend

**Solution**:

1. Verify database has data: Check Supabase dashboard
2. Clear browser cache
3. Restart frontend server

---

## Database Credentials (for reference)

- **Supabase Project**: miwhxvpatqaflcxqvknu
- **Database**: PostgreSQL
- **Table**: `github_projects`
- **Backup Location**: This folder (`backend/prisma/backup/`)

---

## Last Updated

February 2, 2026

## Future Maintenance

- Run `generateSeed500Clean.ts` quarterly to keep GitHub stats fresh
- Archive old SQL files with date stamps
- Monitor database size and performance
