# DEPLOY_001: GitHub Pages Deployment

## Overview

This document explains how to set up and manage GitHub Pages deployment for the Music Manager application. The deployment is automated via GitHub Actions CI/CD pipeline.

---

## Prerequisites

- GitHub repository created for this project
- GitHub Actions enabled (default for public repos)
- Supabase project created with credentials
- Environment variables configured locally

---

## Step 1: Add GitHub Secrets

GitHub Actions needs your Supabase credentials to build the app.

### How to Add Secrets

1. **Open GitHub Repository**
   - Go to: https://github.com/your-username/Podcast_claude

2. **Go to Settings**
   - Click "Settings" tab (top right area of repo)

3. **Find Secrets & Variables**
   - Left sidebar: Security > Secrets and variables > Actions

4. **Create New Secrets (click "New repository secret")**

   **Secret 1: VITE_SUPABASE_URL**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co` (from Supabase dashboard)
   - Click "Add secret"

   **Secret 2: VITE_SUPABASE_ANON_KEY**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your anon key (from Supabase dashboard)
   - Click "Add secret"

5. **Verify**
   - You should see both secrets listed (value masked as `***`)

---

## Step 2: Configure GitHub Pages

1. **Go to Settings > Pages**
   - Left sidebar: Pages

2. **Configure Source**
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Click "Save"

3. **Done!**
   - GitHub will monitor the `gh-pages` branch for changes

---

## Step 3: Deploy the App

### First Deployment

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **GitHub Actions Triggers**
   - Automatically runs the "Build and Deploy" workflow
   - You'll see a yellow dot (running) next to the commit

3. **Wait for Completion**
   - Go to "Actions" tab in GitHub
   - Watch the workflow execute:
     1. Install dependencies (~30 seconds)
     2. Build React app (~15 seconds)
     3. Deploy to gh-pages (~10 seconds)
   - When complete, you'll see a green checkmark ✅

4. **Access Deployed App**
   - App available at: `https://your-username.github.io/Podcast_claude/`
   - Open in browser and verify login form appears

### Subsequent Deployments

Every push to `main` automatically triggers:
- Build
- Test (if tests were added)
- Deploy to GitHub Pages

No additional action needed.

---

## Monitoring Deployments

### View Build Status

1. **In GitHub Repository**
   - Click "Actions" tab
   - See list of workflow runs
   - Click any run to see logs

2. **View Build Logs**
   - Click "Build and Deploy to GitHub Pages" workflow
   - See detailed logs:
     - Node.js setup
     - npm install output
     - Vite build output
     - Deployment status

### Troubleshooting

**Build Fails with "MissingEnvVars" error**
- Solution: Check GitHub secrets are set correctly
- Verify names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Build Succeeds but Page shows 404**
- Likely issue: GitHub Pages not configured yet
- Check: Settings > Pages shows gh-pages branch

**App Loads but Shows Blank Page**
- Check browser console (F12)
- Verify Supabase credentials are correct
- Check network tab for failed API calls

### View Deployment History

In GitHub:
- Go to "Actions" tab
- Filter by workflow "Build and Deploy to GitHub Pages"
- See all previous deployments with timestamps

---

## Local Testing (Optional)

Before pushing to main, test locally:

```bash
cd frontend
npm run dev
```

- App runs at http://localhost:5173
- Test login with your test user
- Verify no console errors

---

## Rollback (If Needed)

If deployed version has issues:

### Option 1: Revert Recent Commits
```bash
git revert HEAD
git push origin main
```
- Creates a new commit that undoes changes
- Triggers new deployment automatically

### Option 2: Deploy Previous Commit
```bash
git push origin commit-hash:main
git push origin main
```
- Redeploy a specific working commit

---

## Custom Domain (Optional)

If you want to use a custom domain (e.g., musicmanager.example.com):

1. **Buy domain** from registrar (GoDaddy, Namecheap, etc.)

2. **Point DNS to GitHub Pages**
   - Add CNAME record pointing to `your-username.github.io`
   - Or use 4 A records (see GitHub docs)

3. **Add CNAME file to repo**
   - Create `frontend/public/CNAME` with your domain
   - Or configure in GitHub Settings > Pages

4. **Redeploy**
   - Push to main
   - GitHub Actions rebuilds with custom domain

---

## Environment-Based Deployments

The current setup deploys to GitHub Pages. For different environments:

### Staging Environment
- Use a `develop` branch
- Create separate workflow for `staging` deployment
- Deploy to `https://staging.your-username.github.io/Podcast_claude/`

### Production Environment
- Current setup (`main` → GitHub Pages)
- Or use Vercel/Netlify for more advanced features

---

## Performance Tips

### Optimize Build Size
- Current bundle: ~96KB gzipped (good!)
- To reduce further:
  - Code splitting (lazy load components)
  - Remove unused dependencies
  - Enable minification (already done)

### Cache Busting
- GitHub Pages automatically caches assets
- Vite generates unique filenames per build
- Old cache invalidates automatically

---

## Git Commit Strategy

Every commit to `main` triggers deployment:

```bash
# Small feature
git commit -m "feat: add logout button"
git push origin main

# Multiple features - batch or push individual
git commit -m "feat: add auth service"
git push origin main

git commit -m "feat: add LoginPage component"
git push origin main
```

Each push = fresh deployment (takes ~1-2 minutes total)

---

## Disable Auto-Deploy (If Needed)

To prevent auto-deployment on push:

1. **Disable workflow**
   - Go to Actions > Build and Deploy
   - Click "..." > Disable workflow

2. **Deploy manually**
   - Run: `npm run build && git subtree push --prefix frontend/dist origin gh-pages`

3. **Re-enable for auto-deploy**
   - Click "Enable workflow"

---

## Summary Checklist

- [ ] VITE_SUPABASE_URL secret added to GitHub
- [ ] VITE_SUPABASE_ANON_KEY secret added to GitHub
- [ ] GitHub Pages configured to use gh-pages branch
- [ ] .github/workflows/deploy.yml exists and is valid
- [ ] Test commit pushed to main
- [ ] Actions workflow ran successfully ✅
- [ ] App deployed to `https://your-username.github.io/Podcast_claude/`
- [ ] Login form appears on deployed app
- [ ] Login works with test user credentials

---

**Status:** Ready for Deployment
**Version:** 1.0
**Last Updated:** 2026-03-25
