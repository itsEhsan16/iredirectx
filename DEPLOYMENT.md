# iRedirectX - Vercel Deployment Guide

This guide will walk you through deploying iRedirectX to Vercel.

## Prerequisites

Before deploying, ensure you have:
1. A [Vercel account](https://vercel.com/signup)
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Supabase project with database configured

## Environment Variables

You'll need to configure the following environment variables in Vercel:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import project on Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the repository containing iRedirectX

3. **Configure project settings**
   - Framework Preset: `Vite` (should be auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add environment variables**
   - In the Environment Variables section
   - Add each variable from `.env.example`
   - Use your actual Supabase credentials
   - Select all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the project**
   ```bash
   # For production deployment
   vercel --prod
   
   # For preview deployment
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N` (for first deployment)
   - Project name: `iredirectx` (or your preferred name)
   - Directory: `./`
   - Override settings: `N`

5. **Add environment variables**
   ```bash
   # Add each environment variable
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_SUPABASE_PROJECT_ID
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
   ```

## Post-Deployment Configuration

### 1. Update Supabase Settings

Add your Vercel deployment URL to Supabase:
1. Go to your Supabase project dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/*`

### 2. Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 3. Set up Environment for Different Stages

You can have different environment variables for:
- **Production**: Main branch deployments
- **Preview**: PR and branch deployments
- **Development**: Local development

## Build Optimization

The project is configured with:
- **Code splitting**: Automatic vendor chunk separation
- **Asset optimization**: Hashed filenames for cache busting
- **Compression**: Enabled by default in Vercel
- **Security headers**: Configured in `vercel.json`

## Monitoring & Analytics

### Vercel Analytics (Optional)
1. Enable Analytics in your Vercel project dashboard
2. Install the package:
   ```bash
   npm install @vercel/analytics
   ```
3. Add to your main component:
   ```tsx
   import { Analytics } from '@vercel/analytics/react';
   
   // In your App component
   <Analytics />
   ```

## Troubleshooting

### Common Issues

1. **Build fails with module not found**
   - Ensure all dependencies are in `package.json`
   - Clear cache: `vercel --force`

2. **Environment variables not working**
   - Check variable names match exactly
   - Ensure variables are added for the correct environment
   - Redeploy after adding variables

3. **404 errors on page refresh**
   - Verify `rewrites` configuration in `vercel.json`
   - Should redirect all routes to `index.html` for SPA

4. **Supabase connection issues**
   - Verify environment variables are correct
   - Check Supabase URL allowlist includes Vercel domain

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Inspect environment variables
vercel env ls

# Redeploy with clean cache
vercel --force
```

## Rollback

If you need to rollback to a previous deployment:
1. Go to Vercel Dashboard
2. Navigate to your project
3. Click on "Deployments"
4. Find the previous stable deployment
5. Click "..." menu → "Promote to Production"

## Security Considerations

- ✅ Environment variables are encrypted
- ✅ `.env` files are gitignored
- ✅ Security headers configured in `vercel.json`
- ✅ Using Supabase anon key (safe for client-side)
- ⚠️ Never commit sensitive keys to git
- ⚠️ Use Row Level Security (RLS) in Supabase

## Performance Tips

1. **Enable Vercel Edge Network**
   - Automatically enabled for all deployments
   - Provides global CDN distribution

2. **Monitor Web Vitals**
   - Check Vercel Analytics dashboard
   - Optimize based on Core Web Vitals metrics

3. **Use ISR for Dynamic Content** (if applicable)
   - Consider Next.js for ISR capabilities
   - Current Vite setup serves static SPA

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Project Repository](https://github.com/yourusername/iredirectx)

## Checklist Before Deployment

- [ ] All environment variables configured
- [ ] Build runs successfully locally (`npm run build`)
- [ ] Git repository is up to date
- [ ] Supabase database is configured
- [ ] `.env` is in `.gitignore`
- [ ] `vercel.json` is configured
- [ ] Dependencies are up to date

---

Last updated: October 2024
