# Deployment Guide

This guide explains how to deploy Dark Alpha to Vercel.

## Overview

Dark Alpha consists of two apps that need to be deployed separately:

1. **API** (`apps/api`) - Express backend
2. **Web** (`apps/web`) - Next.js frontend

Each app has its own `vercel.json` configuration.

## Prerequisites

- Vercel account
- GitHub repository with the code
- Environment variables ready (see below)

## Deploying the API

### Option 1: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and click "Add New Project"
2. Import your GitHub repository
3. Configure the project:
   - **Root Directory**: `apps/api`
   - **Framework Preset**: Other
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.`
   - **Install Command**: `pnpm install`

4. Add environment variables:
   ```
   SOLANA_RPC_URL=https://api.devnet.solana.com
   SOLANA_PRIVATE_KEY=<your-base58-private-key>
   GOOGLE_API_KEY=<optional-for-ai-features>
   NODE_ENV=production
   FRONTEND_URL=<your-frontend-vercel-url>
   ```

5. Click Deploy

### Option 2: Vercel CLI

```bash
cd apps/api
vercel --prod
```

### API Endpoints After Deployment

Your API will be available at `https://your-api.vercel.app` with endpoints:
- `GET /health` - Health check
- `GET /api/markets` - List markets
- `GET /api/dark-markets` - List Dark Markets
- `POST /api/dark-markets/prepare-bet` - Prepare bet transaction
- And more (see README.md)

## Deploying the Web App

### Option 1: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and click "Add New Project"
2. Import the same GitHub repository (or create a new import)
3. Configure the project:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install --no-frozen-lockfile --shamefully-hoist`

4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   ```

5. Click Deploy

### Option 2: Vercel CLI

```bash
cd apps/web
vercel --prod
```

## Environment Variables Summary

### API Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SOLANA_RPC_URL` | Yes | Solana RPC endpoint (use devnet) |
| `SOLANA_PRIVATE_KEY` | Yes | Base58 private key for market creation |
| `GOOGLE_API_KEY` | No | Google AI API key for AI agent |
| `NODE_ENV` | Yes | Set to `production` |
| `FRONTEND_URL` | No | Frontend URL for CORS |

### Web Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Your deployed API URL |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Yes | Set to `devnet` |

## Post-Deployment Steps

1. **Update CORS**: After deploying both apps, update the API's `FRONTEND_URL` environment variable with the web app's URL

2. **Test the connection**: Visit your web app and check the browser console for any CORS or API errors

3. **Verify Phantom works**: Connect your Phantom wallet (set to devnet) and try browsing markets

## Troubleshooting

### API returns 500 errors

- Check Vercel function logs for error details
- Ensure all environment variables are set correctly
- Verify the Solana RPC URL is accessible

### CORS errors in browser

- Make sure `FRONTEND_URL` is set in API environment variables
- The API is configured to allow all origins for the demo

### Build fails

- Check that you're using Node 20.x
- Ensure pnpm is available in the build environment
- Check Vercel build logs for specific errors

### Wallet connection issues

- Ensure Phantom is set to Devnet
- Check browser console for connection errors
- Verify `NEXT_PUBLIC_SOLANA_NETWORK` is set to `devnet`

## Local Testing Before Deployment

Test the production build locally:

```bash
# API
cd apps/api
pnpm build
pnpm start

# Web (in another terminal)
cd apps/web
pnpm build
pnpm start
```

Visit http://localhost:3000 and verify everything works.

## Notes

- Both apps use pnpm as the package manager
- The API uses esbuild for fast TypeScript compilation
- The web app uses Next.js 14 with the App Router
- All contracts are on Solana Devnet - do not use real funds
