# 🚀 Complete Deployment Guide - Info Sphere

This comprehensive guide will walk you through deploying Info Sphere to various free hosting platforms. Choose the platform that best fits your needs.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Platform Comparison](#platform-comparison)
3. [Cloudflare Pages (Recommended)](#1-cloudflare-pages-recommended)
4. [Vercel](#2-vercel)
5. [Netlify](#3-netlify)
6. [Railway](#4-railway)
7. [Render](#5-render)
8. [GitHub Pages](#6-github-pages)
9. [Post-Deployment Steps](#post-deployment-steps)
10. [Troubleshooting](#troubleshooting)
11. [Custom Domain Setup](#custom-domain-setup)
12. [Performance Optimization](#performance-optimization)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ **NewsAPI Key** - [Get it free](https://newsapi.org/register)
- ✅ **Weather API Key** (optional) - [OpenWeatherMap](https://openweathermap.org/api)
- ✅ **Git repository** - Code pushed to GitHub/GitLab/Bitbucket
- ✅ **Node.js 18+** installed locally
- ✅ **Build tested locally** - Run `npm run build` successfully
- ✅ **Environment variables** documented
- ✅ **Account created** on your chosen platform

### Local Build Test

```bash
# Navigate to project directory
cd Info_sphere

# Install dependencies
npm install

# Build the project
npm run build

# Preview the build
npm run preview
```

If the build succeeds and preview works, you're ready to deploy!

---

## Platform Comparison

| Platform             | Free Tier          | Build Time | Global CDN | Serverless | Best For           |
| -------------------- | ------------------ | ---------- | ---------- | ---------- | ------------------ |
| **Cloudflare Pages** | ✅ Unlimited       | Fast       | ✅ Yes     | ✅ Yes     | Production apps    |
| **Vercel**           | ✅ 100GB bandwidth | Very Fast  | ✅ Yes     | ✅ Yes     | Next.js/React apps |
| **Netlify**          | ✅ 100GB bandwidth | Fast       | ✅ Yes     | ✅ Yes     | Static sites       |
| **Railway**          | ✅ $5 credit/month | Medium     | ❌ No      | ✅ Yes     | Full-stack apps    |
| **Render**           | ✅ 750 hours/month | Slow       | ❌ No      | ✅ Yes     | Simple deployments |
| **GitHub Pages**     | ✅ Unlimited       | Fast       | ❌ No      | ❌ No      | Static sites only  |

---

## 1. Cloudflare Pages (Recommended)

### Why Cloudflare Pages?

- ✅ **Unlimited bandwidth** on free tier
- ✅ **Global CDN** with 275+ data centers
- ✅ **Edge computing** with Workers
- ✅ **Automatic HTTPS** and DDoS protection
- ✅ **Built-in analytics** and Web3 support
- ✅ **Zero cold starts** for serverless functions

### Step-by-Step Deployment

#### Method 1: Using Wrangler CLI (Recommended)

1. **Install Wrangler CLI**

```bash
npm install -g wrangler
```

2. **Login to Cloudflare**

```bash
wrangler login
```

This will open a browser window for authentication.

3. **Configure wrangler.jsonc**

Update the `wrangler.jsonc` file in your project root:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "info-sphere",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/server.ts",
  "vars": {
    "NEWS_API_KEY": "",
    "WEATHER_API_KEY": "",
  },
}
```

4. **Set Environment Variables**

```bash
# Set NEWS_API_KEY
wrangler secret put NEWS_API_KEY
# Enter your API key when prompted

# Set WEATHER_API_KEY (optional)
wrangler secret put WEATHER_API_KEY
# Enter your weather API key when prompted
```

5. **Build and Deploy**

```bash
# Build the project
npm run build

# Deploy to Cloudflare
wrangler deploy
```

6. **Access Your App**

Your app will be live at: `https://info-sphere.pages.dev`

#### Method 2: Using Cloudflare Dashboard

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** section

2. **Create a New Project**
   - Click **Create a project**
   - Connect your Git repository (GitHub/GitLab)
   - Select your Info_sphere repository

3. **Configure Build Settings**
   - **Framework preset**: None (or Vite)
   - **Build command**: `npm run build`
   - **Build output directory**: `.output/public`
   - **Root directory**: `/` (or `Info_sphere` if in subdirectory)

4. **Set Environment Variables**
   - Click **Environment variables**
   - Add `NEWS_API_KEY` with your API key
   - Add `WEATHER_API_KEY` (optional)
   - Set for **Production** environment

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for build to complete (2-5 minutes)

6. **Custom Domain (Optional)**
   - Go to **Custom domains**
   - Click **Set up a custom domain**
   - Follow DNS configuration steps

### Cloudflare Pages Features

- **Preview Deployments**: Every PR gets a unique URL
- **Rollback**: Easily rollback to previous deployments
- **Analytics**: Built-in Web Analytics
- **Functions**: Deploy serverless functions alongside your site

---

## 2. Vercel

### Why Vercel?

- ✅ **Zero-config** deployment
- ✅ **Instant rollbacks** and preview deployments
- ✅ **Edge Network** with 70+ regions
- ✅ **Built-in analytics** and monitoring
- ✅ **Optimized for React** and Next.js

### Step-by-Step Deployment

#### Method 1: Using Vercel CLI

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy**

```bash
# Navigate to project directory
cd Info_sphere

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

4. **Set Environment Variables**

```bash
# Add environment variables
vercel env add NEWS_API_KEY
# Enter your API key when prompted

vercel env add WEATHER_API_KEY
# Enter your weather API key when prompted
```

5. **Redeploy with Environment Variables**

```bash
vercel --prod
```

#### Method 2: Using Vercel Dashboard

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **Sign Up** or **Login**

2. **Import Project**
   - Click **Add New** → **Project**
   - Import your Git repository
   - Select Info_sphere repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output/public`
   - **Install Command**: `npm install`

4. **Environment Variables**
   - Click **Environment Variables**
   - Add `NEWS_API_KEY`
   - Add `WEATHER_API_KEY`
   - Select **Production**, **Preview**, and **Development**

5. **Deploy**
   - Click **Deploy**
   - Wait for deployment (1-3 minutes)

6. **Access Your App**
   - Your app will be live at: `https://your-project.vercel.app`

### Vercel Features

- **Automatic HTTPS**: SSL certificates automatically provisioned
- **Preview URLs**: Every git push gets a unique URL
- **Analytics**: Real-time analytics dashboard
- **Edge Functions**: Deploy serverless functions at the edge

---

## 3. Netlify

### Why Netlify?

- ✅ **Continuous deployment** from Git
- ✅ **Form handling** and identity management
- ✅ **Split testing** A/B testing built-in
- ✅ **Deploy previews** for every PR
- ✅ **Free SSL** certificates

### Step-by-Step Deployment

#### Method 1: Using Netlify CLI

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Login to Netlify**

```bash
netlify login
```

3. **Initialize Project**

```bash
cd Info_sphere
netlify init
```

Follow the prompts:

- Create a new site
- Connect to Git repository
- Configure build settings

4. **Create netlify.toml**

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".output/public"
  functions = ".output/server"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

5. **Set Environment Variables**

```bash
netlify env:set NEWS_API_KEY "your_api_key_here"
netlify env:set WEATHER_API_KEY "your_weather_key_here"
```

6. **Deploy**

```bash
# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Method 2: Using Netlify Dashboard

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click **Sign Up** or **Login**

2. **New Site from Git**
   - Click **Add new site** → **Import an existing project**
   - Connect to GitHub/GitLab/Bitbucket
   - Select Info_sphere repository

3. **Build Settings**
   - **Branch to deploy**: main (or master)
   - **Build command**: `npm run build`
   - **Publish directory**: `.output/public`

4. **Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Click **Add a variable**
   - Add `NEWS_API_KEY` and `WEATHER_API_KEY`

5. **Deploy**
   - Click **Deploy site**
   - Wait for deployment (2-4 minutes)

6. **Access Your App**
   - Your app will be live at: `https://random-name.netlify.app`

### Netlify Features

- **Deploy Previews**: Test changes before merging
- **Form Handling**: Built-in form submissions
- **Identity**: User authentication service
- **Functions**: Serverless functions support

---

## 4. Railway

### Why Railway?

- ✅ **Simple deployment** process
- ✅ **Database support** (PostgreSQL, MySQL, Redis)
- ✅ **Environment variables** management
- ✅ **Free tier** with $5 credit/month
- ✅ **Automatic HTTPS** and custom domains

### Step-by-Step Deployment

#### Method 1: Using Railway CLI

1. **Install Railway CLI**

```bash
npm install -g @railway/cli
```

2. **Login to Railway**

```bash
railway login
```

3. **Initialize Project**

```bash
cd Info_sphere
railway init
```

4. **Link to Project**

```bash
railway link
```

5. **Set Environment Variables**

```bash
railway variables set NEWS_API_KEY="your_api_key_here"
railway variables set WEATHER_API_KEY="your_weather_key_here"
```

6. **Deploy**

```bash
railway up
```

#### Method 2: Using Railway Dashboard

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Click **Login with GitHub**

2. **New Project**
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Choose Info_sphere repository

3. **Configure Deployment**
   - Railway will auto-detect settings
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`

4. **Environment Variables**
   - Click **Variables** tab
   - Add `NEWS_API_KEY`
   - Add `WEATHER_API_KEY`

5. **Deploy**
   - Click **Deploy**
   - Wait for deployment (3-5 minutes)

6. **Access Your App**
   - Click **Settings** → **Generate Domain**
   - Your app will be live at: `https://your-app.up.railway.app`

### Railway Features

- **Database Integration**: Easy PostgreSQL/MySQL setup
- **Metrics**: CPU, memory, and network monitoring
- **Logs**: Real-time application logs
- **Cron Jobs**: Schedule tasks

---

## 5. Render

### Why Render?

- ✅ **Free static site** hosting
- ✅ **Automatic deploys** from Git
- ✅ **Custom domains** with SSL
- ✅ **DDoS protection** included
- ✅ **Simple pricing** and setup

### Step-by-Step Deployment

1. **Login to Render**
   - Go to [render.com](https://render.com)
   - Click **Sign Up** or **Login**

2. **New Static Site**
   - Click **New** → **Static Site**
   - Connect your Git repository
   - Select Info_sphere repository

3. **Configure Build**
   - **Name**: info-sphere
   - **Branch**: main
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.output/public`

4. **Environment Variables**
   - Click **Advanced**
   - Add environment variable:
     - Key: `NEWS_API_KEY`
     - Value: Your API key
   - Add `WEATHER_API_KEY` (optional)

5. **Create Static Site**
   - Click **Create Static Site**
   - Wait for deployment (5-10 minutes)

6. **Access Your App**
   - Your app will be live at: `https://info-sphere.onrender.com`

### Render Features

- **Auto-Deploy**: Automatic deploys on git push
- **Pull Request Previews**: Test PRs before merging
- **Custom Headers**: Configure security headers
- **Redirects**: Set up URL redirects

---

## 6. GitHub Pages

### Why GitHub Pages?

- ✅ **Completely free** unlimited bandwidth
- ✅ **Simple setup** for static sites
- ✅ **Custom domains** supported
- ✅ **HTTPS** automatically enabled

### ⚠️ Important Note

GitHub Pages only supports **static sites**. Since Info Sphere uses server-side rendering (SSR), you'll need to build it as a static site or use GitHub Actions with a different hosting provider.

### Step-by-Step Deployment (Static Build)

1. **Create GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
          WEATHER_API_KEY: ${{ secrets.WEATHER_API_KEY }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./.output/public
```

2. **Set Repository Secrets**
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add `NEWS_API_KEY` and `WEATHER_API_KEY`

3. **Enable GitHub Pages**
   - Go to **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **root**
   - Click **Save**

4. **Push to GitHub**

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

5. **Access Your App**
   - Your app will be live at: `https://username.github.io/Info_sphere`

---

## Post-Deployment Steps

### 1. Verify Deployment

- ✅ Visit your deployed URL
- ✅ Test all routes (home, categories, search, bookmarks)
- ✅ Check API functionality (news loading)
- ✅ Test on mobile devices
- ✅ Verify dark/light mode switching
- ✅ Test bookmarks and history features

### 2. Set Up Monitoring

#### Cloudflare Analytics (for Cloudflare Pages)

- Go to **Analytics** tab in Cloudflare dashboard
- Enable **Web Analytics**
- View real-time traffic and performance

#### Vercel Analytics

- Go to **Analytics** tab in Vercel dashboard
- View page views, unique visitors, and performance

#### Google Analytics (All Platforms)

1. Create Google Analytics account
2. Get tracking ID
3. Add to your app (in `__root.tsx` or `index.html`)

### 3. Configure Custom Domain

See [Custom Domain Setup](#custom-domain-setup) section below.

### 4. Set Up SSL/HTTPS

Most platforms automatically provide SSL certificates. Verify:

- ✅ URL starts with `https://`
- ✅ Padlock icon in browser
- ✅ No mixed content warnings

### 5. Performance Testing

Test your deployment:

```bash
# Using Lighthouse
npx lighthouse https://your-app-url.com --view

# Using WebPageTest
# Visit https://www.webpagetest.org
```

### 6. Set Up Error Monitoring

Consider integrating error tracking:

- **Sentry**: [sentry.io](https://sentry.io)
- **LogRocket**: [logrocket.com](https://logrocket.com)
- **Rollbar**: [rollbar.com](https://rollbar.com)

---

## Troubleshooting

### Build Failures

**Problem**: Build fails with "Module not found"

**Solution**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Problem**: Build fails with "Out of memory"

**Solution**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Environment Variables Not Working

**Problem**: API calls failing with 401/403 errors

**Solution**:

1. Verify environment variables are set correctly
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Check if variables need `VITE_` prefix for client-side access

### Routing Issues

**Problem**: 404 errors on page refresh

**Solution**:
Add redirect rules (platform-specific):

**Netlify** (`netlify.toml`):

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (`vercel.json`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Performance Issues

**Problem**: Slow page loads

**Solution**:

1. Enable caching headers
2. Optimize images
3. Use CDN for static assets
4. Enable compression (gzip/brotli)

### API Rate Limiting

**Problem**: NewsAPI rate limit exceeded

**Solution**:

1. Implement caching (already built-in)
2. Reduce API calls
3. Upgrade NewsAPI plan
4. Use multiple API keys (rotate)

---

## Custom Domain Setup

### Cloudflare Pages

1. **Add Custom Domain**
   - Go to **Custom domains** in Cloudflare Pages
   - Click **Set up a custom domain**
   - Enter your domain (e.g., `infosphere.com`)

2. **Configure DNS**
   - Add CNAME record:
     - Name: `@` (or subdomain)
     - Target: `your-project.pages.dev`
   - Wait for DNS propagation (5-30 minutes)

### Vercel

1. **Add Domain**
   - Go to **Settings** → **Domains**
   - Enter your domain
   - Click **Add**

2. **Configure DNS**
   - Add A record or CNAME as instructed
   - Vercel will automatically provision SSL

### Netlify

1. **Add Custom Domain**
   - Go to **Domain settings**
   - Click **Add custom domain**
   - Enter your domain

2. **Configure DNS**
   - Update nameservers to Netlify's (recommended)
   - Or add CNAME/A records manually

---

## Performance Optimization

### 1. Enable Caching

Add cache headers to your deployment:

**Cloudflare** (automatic)
**Vercel** (`vercel.json`):

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Image Optimization

- Use WebP format
- Implement lazy loading
- Use responsive images
- Consider image CDN (Cloudinary, ImageKit)

### 3. Code Splitting

Already implemented via Vite:

- Route-based code splitting
- Dynamic imports
- Tree shaking

### 4. Compression

Enable gzip/brotli compression (usually automatic on platforms).

### 5. CDN Configuration

- Use platform's global CDN
- Configure edge caching
- Set appropriate cache TTLs

---

## Continuous Deployment

### Automatic Deployments

All platforms support automatic deployments:

1. **Push to Git**

   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Automatic Build & Deploy**
   - Platform detects push
   - Runs build command
   - Deploys automatically

### Preview Deployments

Test changes before production:

- **Vercel**: Every PR gets a preview URL
- **Netlify**: Deploy previews for PRs
- **Cloudflare**: Preview deployments enabled

---

## Cost Comparison

| Platform             | Free Tier           | Paid Plans Start At    |
| -------------------- | ------------------- | ---------------------- |
| **Cloudflare Pages** | Unlimited bandwidth | $20/month (Workers)    |
| **Vercel**           | 100GB bandwidth     | $20/month              |
| **Netlify**          | 100GB bandwidth     | $19/month              |
| **Railway**          | $5 credit/month     | $5/month (usage-based) |
| **Render**           | 750 hours/month     | $7/month               |
| **GitHub Pages**     | Unlimited (static)  | Free                   |

---

## Recommended Platform

For **Info Sphere**, we recommend:

🥇 **Cloudflare Pages** - Best overall performance, unlimited bandwidth, global CDN

🥈 **Vercel** - Excellent DX, great for React apps, generous free tier

🥉 **Netlify** - Good balance of features and ease of use

---

## Support & Resources

- **Cloudflare Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Render Docs**: [render.com/docs](https://render.com/docs)

---

## Conclusion

You now have everything you need to deploy Info Sphere to production! Choose the platform that best fits your needs and follow the step-by-step guide.

**Quick Start Recommendation:**

1. Start with **Cloudflare Pages** for best performance
2. Use **Wrangler CLI** for easiest deployment
3. Set up **custom domain** for professional look
4. Enable **monitoring** to track performance
5. Set up **automatic deployments** for continuous delivery

Happy deploying! 🚀

---

**Last Updated**: June 20, 2026  
**Version**: 1.0.0
