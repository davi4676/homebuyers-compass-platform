# Deployment Guide — NestQuest

This guide covers multiple deployment options for your Next.js application.

## Stripe (paid checkout)

Checkout fails with **503** until `STRIPE_SECRET_KEY` and the Stripe **Price IDs** for each paid tier and billing cycle are configured. Follow **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** (product catalog, env vars, webhooks, and end-to-end test). Add the same variables in your host’s environment (e.g. Vercel → Project → Settings → Environment Variables).

## Option 1: Vercel (Recommended - Easiest for Next.js)

Vercel is made by the Next.js team and offers the simplest deployment experience.

### Steps:

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   cd prototype
   vercel
   ```
   Follow the prompts to link your project.

3. **Or Deploy via Web Interface**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

4. **Environment Variables** (if needed):
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add any API keys or secrets

5. **Custom Domain** (optional):
   - Project Settings → Domains
   - Add your custom domain

**Pros:**
- Zero configuration needed
- Automatic HTTPS
- Global CDN
- Free tier available
- Automatic deployments on git push

---

## Option 2: Netlify

### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   cd prototype
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Or use Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `prototype/.next` folder (after build)
   - Or connect to GitHub for continuous deployment

**Configuration** (create `netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Option 3: AWS (EC2, Amplify, or ECS)

### AWS Amplify (Easiest AWS option):

1. Go to AWS Amplify Console
2. Connect your GitHub repository
3. Amplify auto-detects Next.js
4. Deploy

### AWS EC2 (More control):

1. Launch EC2 instance (Ubuntu recommended)
2. Install Node.js and npm
3. Clone your repository
4. Run `npm install` and `npm run build`
5. Use PM2 to run: `pm2 start npm --name "homebuyer-app" -- start`
6. Configure nginx as reverse proxy
7. Set up SSL with Let's Encrypt

---

## Option 4: Docker + Any Cloud Provider

### Create Dockerfile:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
ENV PORT 3001

CMD ["node", "server.js"]
```

### Update next.config.js for standalone output:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

Then deploy to:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Railway
- Render

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are documented
- [ ] Build runs successfully: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Test the production build locally: `npm run build && npm start`
- [ ] Update metadata in `app/layout.tsx` (SEO)
- [ ] Add analytics (if needed)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CORS if using external APIs
- [ ] Set up database/backend (if needed)

---

## Quick Start: Vercel (Recommended)

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Select your repository
   - Click "Deploy"

3. **Your app will be live in ~2 minutes!**

---

## Environment Variables

If you need environment variables, add them in your deployment platform:

- `NODE_ENV=production`
- Any API keys or secrets
- Database connection strings (if applicable)

---

## Post-Deployment

1. Test all pages and functionality
2. Set up custom domain (optional)
3. Configure analytics
4. Set up monitoring/error tracking
5. Enable automatic deployments from main branch

---

## Need Help?

- Vercel Docs: https://nextjs.org/docs/deployment
- Next.js Deployment: https://nextjs.org/docs/deployment

