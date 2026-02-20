# GitHub Projects Scraping Guide

## 🎯 What's New - Improved Filtering System

### Problems Solved:
1. ✅ **No more libraries/frameworks** - P5.js, D3.js, React components, etc. are filtered out
2. ✅ **Live demo link required** - Only projects with working deployed applications are included
3. ✅ **No duplicate versions** - Filters out project-v1, project-v2, project-v3 variations
4. ✅ **Real-world applications only** - Stricter validation ensures only production-grade apps
5. ✅ **Test mode enabled** - Web Development only for quality verification

### Key Improvements:

#### 1. Comprehensive Exclusion Filtering
- 60+ exclusion keywords covering libraries, frameworks, tools, learning materials, books
- Pattern matching for common library naming conventions (react-*, vue-*, *-js, etc.)
- Description analysis to catch phrases like "is a library", "is a framework"
- Explicit filtering of known libraries (P5.js, D3.js, Chart.js, etc.)

#### 2. Live Demo Link Validation
- ✅ Checks `homepage` field for valid deployment URLs
- ✅ Validates common deployment platforms (Vercel, Netlify, Heroku, etc.)
- ✅ Scans README for demo/live links
- ❌ Rejects projects with only GitHub URLs
- ❌ Rejects projects with no live demo

#### 3. Duplicate Prevention
- Removes version suffixes (-v1, -v2, _v3, -version-1, etc.)
- Tracks base project names to prevent similar duplicates
- Ensures unique, high-quality project selection

#### 4. Stricter Quality Thresholds
- Minimum 50 stars (up from 10)
- Minimum 20-character meaningful descriptions
- Must have application-indicating keywords
- Must have production indicators

## 🚀 How to Use

### Step 1: Clear Existing Projects (Optional)
If you want to start fresh and clear ALL existing projects:

```bash
cd backend
npx ts-node prisma/clearAllProjects.ts
```

**Warning**: This will delete:
- All GitHub projects
- All project progress records
- All bookmarks for GitHub projects

### Step 2: Run the Scraper (Web Development Test Mode)
The scraper is currently configured to only fetch Web Development projects for testing:

```bash
cd backend
npx ts-node prisma/scrapeRealGitHubProjects.ts
```

This will:
- Clear existing GitHub projects automatically
- Fetch ~200 Web Development projects
- Apply strict filtering (libraries/tools excluded)
- Validate live demo links
- Prevent duplicates
- Seed them into the database

**Expected Duration**: 30-60 minutes (includes API rate limiting delays)

### Step 3: Verify Quality
After scraping completes:

1. **Check the Project Library** 
   - Go to Web Development domain
   - Verify NO libraries/frameworks appear (P5.js, D3.js, etc.)
   - All projects should be real applications

2. **Check Live Links**
   - Click on projects
   - Verify "Live Demo" links work
   - Should see deployed applications, not GitHub repos

3. **Check for Duplicates**
   - No "Project v1", "Project v2" variations
   - Each project should be unique

### Step 4: Enable All Domains (If Quality is Good)
If the Web Development projects look good, enable other domains:

**In `scrapeRealGitHubProjects.ts`**, uncomment the other domains:

```typescript
const domainFetchers = [
  { name: 'Web Development', fetch: fetchWebDevelopmentProjects, domainId: DOMAINS.web.id },
  { name: 'Artificial Intelligence', fetch: fetchAIProjects, domainId: DOMAINS.ai.id },        // Uncomment
  { name: 'Machine Learning', fetch: fetchMLProjects, domainId: DOMAINS.ml.id },               // Uncomment
  { name: 'Data Science', fetch: fetchDataScienceProjects, domainId: DOMAINS.ds.id },          // Uncomment
  { name: 'Cybersecurity', fetch: fetchCybersecurityProjects, domainId: DOMAINS.cyber.id }     // Uncomment
];
```

Then run again:
```bash
npx ts-node prisma/scrapeRealGitHubProjects.ts
```

## 📊 Filtering Logic Details

### Exclusion Keywords (60+):
- **Libraries/Frameworks**: library, framework, plugin, sdk, react-component, vue-component
- **Dev Tools**: boilerplate, template, starter, cli-tool, generator, bundler
- **Learning**: tutorial, example, demo, course, workshop, awesome-list, cheatsheet
- **Documentation**: docs, book, ebook, manual, wiki, reference, guide
- **Specific Libraries**: p5.js, d3.js, three.js, chart.js, lodash, jquery, react, vue, angular
- **Versioned Projects**: -v1, -v2, -v3, version-1, version-2

### Inclusion Requirements (ALL must pass):
1. ✅ Meaningful description (20+ characters)
2. ✅ Minimum 50 GitHub stars
3. ✅ Contains application keywords (platform, app, system, dashboard, etc.)
4. ✅ Has production indicators (deployed, live, production, saas, etc.)
5. ✅ **Has valid live demo URL**

### Demo Link Validation:
- Accepts: Vercel, Netlify, Heroku, Railway, Render, Firebase, AWS, Azure, custom domains
- Rejects: GitHub URLs, GitHub Pages (same repo name), localhost, example.com

## 🔧 Configuration

### GitHub API Token
The scraper uses a GitHub API token from environment variables. Create a `.env` file in the backend directory:
```bash
GITHUB_TOKEN=your_github_personal_access_token_here
```

**How to get a token**:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `public_repo` scope
3. Copy the token to your `.env` file

**Rate Limits**:
- Authenticated: 5,000 requests/hour
- Built-in delays prevent rate limiting
- README fetching adds extra requests

### Search Queries
Each domain has ~15-25 specific search queries targeting real applications:

**Example Web Development queries**:
- `e-commerce shop application stars:>100`
- `chat messaging application stars:>100`
- `project management dashboard stars:>100`
- `video streaming platform stars:>100`

## 📝 Console Output Guide

### Good Signs (✓):
```
✓ Added: user/project-name (1234 ⭐) - Live: https://project.vercel.app
✓ Valid live URL found: https://example.com
✓ Demo link found in README: https://demo.netlify.app
```

### Filtered Out (✗):
```
✗ Excluded (library/tool/learning): facebook/react
✗ No meaningful description: user/test-repo
✗ Insufficient stars (23): user/small-project
✗ No application keywords: user/utils-collection
✗ No valid live demo URL: user/project-name
✗ Duplicate/versioned project: user/app-v2
```

## 🎓 Best Practices

1. **Always run in test mode first** - Verify Web Development quality before all domains
2. **Monitor console output** - Watch what gets filtered and what passes
3. **Check GitHub API rate limits** - Script will show errors if rate limited
4. **Verify live links manually** - Sample check a few projects after scraping
5. **Clear old data** - Run clearAllProjects.ts before fresh scraping

## 🐛 Troubleshooting

### "No valid live URL found" for many projects:
- This is expected! Many popular repos are libraries or don't have demos
- The strict filtering is intentional to ensure quality
- You may need to run longer searches to get 200 projects

### GitHub API Rate Limit Exceeded:
```bash
# Check your rate limit
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit
```
- Wait for rate limit reset (shows in error message)
- Script has built-in delays to prevent this

### Projects still showing libraries:
- Check the exclusion keywords list
- Add specific keywords to EXCLUSION_KEYWORDS array
- Increase minimum stars threshold in isRealApplication()

### Scraping takes too long:
- Normal! ~30-60 minutes for 200 projects
- Adding README checks adds time
- Strict filtering requires checking more repos

## 📈 Expected Results

### Web Development Domain (Test Mode):
- **Target**: 200 projects
- **Success Rate**: ~30-40% (many repos filtered out)
- **Time**: 30-60 minutes
- **Quality**: 0 libraries/tools, 100% real applications with live demos

### All Domains (Full Mode):
- **Target**: 1000 projects (200 per domain)
- **Success Rate**: ~30-40% per domain
- **Time**: 2-3 hours total
- **Quality**: Production-grade applications only

## ✅ Verification Checklist

After scraping completes, verify:

- [ ] No libraries appear (P5.js, D3.js, React, Vue, etc.)
- [ ] No frameworks or dev tools
- [ ] No tutorials or learning materials
- [ ] All projects have working live demo links
- [ ] No duplicate versions (v1, v2, v3)
- [ ] Projects match the domain category
- [ ] Descriptions are meaningful
- [ ] Star counts are reasonable (50+)
- [ ] Project cards display correctly
- [ ] Time estimates are appropriate

## 🔄 Future Improvements

Potential enhancements:
- Add webhook monitoring for deprecated demo links
- Implement periodic re-validation of live URLs
- Add more deployment platform patterns
- Machine learning-based library detection
- User feedback loop for false positives
- Automated quality scoring system
