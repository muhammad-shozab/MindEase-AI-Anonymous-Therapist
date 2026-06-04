# 🚀 Deploy MindEase to Vercel - Complete Guide

## Prerequisites

Before deploying, make sure you have:

1. ✅ Project pushed to GitHub (Already done! ✓)
2. ✅ Vercel account (free at https://vercel.com)
3. ✅ Environment variables configured

---

## Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Sign up with GitHub**
4. Authorize Vercel to access your GitHub account
5. Complete the setup

---

## Step 2: Connect Your GitHub Repository

### Option A: Deploy from Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Click **Import Git Repository**
4. Search for: `MindEase---AI-Anonymous-Therapist`
5. Click **Import**
6. You'll see the project configuration page

### Option B: Deploy from GitHub

1. Go to your GitHub repo: https://github.com/muhammad-shozab/MindEase---AI-Anonymous-Therapist
2. Look for **Deployments** or **About** section
3. Click on the deployment environment
4. Select Vercel from the deployment service options

---

## Step 3: Configure Environment Variables

⚠️ **IMPORTANT:** Your app uses API keys. You MUST set these in Vercel:

1. In Vercel's project settings, click **Environment Variables**
2. Add the following variables:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
VITE_ENCRYPTION_KEY=your_encryption_key_here
```

For each variable:
- Enter the **name** (e.g., `VITE_GOOGLE_CLIENT_ID`)
- Enter the **value** (your actual API key)
- Select which environments: Development, Preview, Production (select all 3)
- Click **Save**

---

## Step 4: Configure Build Settings

On the import page, you should see these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

If these aren't auto-detected, set them manually:

1. Click **Environment Variables** (if not already set)
2. Click **Build & Development Settings**
3. Set:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

---

## Step 5: Deploy!

1. Click **Deploy** button
2. Wait for the build to complete (usually 2-5 minutes)
3. Once done, you'll see a success message with your deployment URL

---

## 🎉 Your Vercel URL

After deployment, you'll get a URL like:
```
https://mindease-ai-anonymous-therapist.vercel.app
```

---

## Troubleshooting

### Error: "Build Failed"

**Check the logs:**
1. Go to your Vercel dashboard
2. Click on your project
3. Click **Deployments**
4. Click the failed deployment
5. Click **Build Logs** to see what went wrong

**Common issues:**

| Issue | Solution |
|-------|----------|
| Missing environment variables | Add all API keys in Vercel settings |
| Missing dependencies | Run `npm install` locally, commit `package-lock.json` |
| Node version mismatch | Vercel uses Node 18+ by default (should work) |
| Port issues | Vite projects work fine on Vercel |

### Error: "Cannot find module"

```bash
# Run locally first
npm install
npm run build

# Commit any changes
git add package-lock.json
git commit -m "Update dependencies"
git push
```

Then redeploy on Vercel.

### API Keys Not Working

1. Verify keys are correct in `.env` (local testing)
2. Make sure they're added to Vercel environment variables
3. Check that variable names match exactly (case-sensitive!)
4. Redeploy after adding variables

---

## Post-Deployment

### 1. Test Your Deployment

- Visit your Vercel URL
- Test all features:
  - Chat with therapist
  - Mood tracking
  - Diagnostics
  - Crisis button
  - Google OAuth login

### 2. Custom Domain (Optional)

1. Go to Vercel project settings
2. Click **Domains**
3. Add your custom domain
4. Follow DNS setup instructions

### 3. Enable Preview Deployments

Vercel automatically creates preview deployments for pull requests:
- Each PR gets a unique URL
- Great for testing before merging
- Automatic cleanup after PR is closed

### 4. Monitor Deployments

- View all deployments in Vercel dashboard
- See build logs and performance metrics
- Rollback to previous versions if needed

---

## Automatic Deployments

Vercel automatically deploys when you:

```bash
# Push to main branch
git push origin main
```

Then:
- Vercel detects the change
- Automatically builds your project
- Deploys to production
- You get a new production URL

---

## Environment Variables Reference

### Google OAuth
- Get from: https://console.cloud.google.com
- Need: Client ID for your app

### Google Gemini API
- Get from: https://ai.google.dev
- Need: API Key

### Open Router API
- Get from: https://openrouter.ai
- Need: API Key (optional)

### HuggingFace API
- Get from: https://huggingface.co/settings/tokens
- Need: API Token (optional)

### Encryption Key
- Generate a random string or UUID
- Example: `your-secret-encryption-key-12345`

---

## Commands for Reference

```bash
# Build locally to test
npm run build

# Preview build locally
npm run preview

# Check for build errors
npm run build 2>&1

# Push to trigger deployment
git push origin main
```

---

## Useful Vercel Links

- **Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/dashboard/settings
- **Documentation:** https://vercel.com/docs

---

## Success Checklist ✅

- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Added all environment variables
- [ ] Configured build settings
- [ ] Clicked Deploy
- [ ] Received deployment URL
- [ ] Tested all features on live site
- [ ] API calls working correctly
- [ ] Shared deployment URL with team

---

## Your Deployment URL

Once deployed, share this with your team:

```
https://mindease-ai-anonymous-therapist.vercel.app
```

(Your actual URL will be provided by Vercel after deployment)

---

**Last Updated:** June 2026  
**Project:** MindEase - AI Anonymous Therapist  
**Status:** Ready for Vercel Deployment 🚀
