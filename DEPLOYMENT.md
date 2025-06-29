# Vercel Deployment Guide for NS-FE

This guide will help you deploy the NS-FE frontend application to Vercel.

## Prerequisites

1. A GitHub account with the NS-FE repository
2. A Vercel account (free tier available)
3. Your backend API deployed and accessible

## Step 1: Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `varna8104/NS-FE`
4. Vercel will automatically detect it as a Next.js project

## Step 2: Configure Environment Variables

In the Vercel project settings, add the following environment variable:

- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: Your backend API URL (e.g., `https://your-backend.vercel.app`)

### How to add environment variables:

1. Go to your project dashboard on Vercel
2. Click on "Settings" tab
3. Go to "Environment Variables" section
4. Add the variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend URL
   - **Environment**: Production, Preview, Development (select all)

## Step 3: Deploy

1. Vercel will automatically build and deploy your project
2. The build process will:
   - Install dependencies (`npm install`)
   - Build the application (`npm run build`)
   - Deploy to Vercel's global CDN

## Step 4: Custom Domain (Optional)

1. In your Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel

## Build Configuration

The project is already configured with `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "NEXT_PUBLIC_API_URL": "@nyayasathi-api-url"
  }
}
```

## Automatic Deployments

- **Production**: Deploys from the `main` branch
- **Preview**: Deploys from pull requests
- **Development**: Deploys from other branches

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check the build logs in Vercel dashboard
2. **API Connection Issues**: Verify `NEXT_PUBLIC_API_URL` is set correctly
3. **Environment Variables**: Ensure they're set for all environments

### Build Logs

If deployment fails:
1. Go to your project on Vercel dashboard
2. Click on the failed deployment
3. Check the build logs for errors
4. Fix issues and redeploy

## Performance Optimization

Vercel automatically optimizes your Next.js application:
- Automatic code splitting
- Image optimization
- Edge caching
- Global CDN distribution

## Monitoring

- **Analytics**: Available in Vercel dashboard
- **Performance**: Core Web Vitals monitoring
- **Error Tracking**: Automatic error reporting

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support) 