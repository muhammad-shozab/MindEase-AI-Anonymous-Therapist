# ⚡ Quick Vercel Deployment - 5 Steps

## Step 1️⃣: Create Vercel Account (2 minutes)
```
1. Go to: https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize & complete setup
```

---

## Step 2️⃣: Import Your Repository (1 minute)
```
1. Go to: https://vercel.com/dashboard
2. Click "Add New Project"
3. Click "Import Git Repository"
4. Search: "MindEase---AI-Anonymous-Therapist"
5. Click "Import"
```

---

## Step 3️⃣: Add Environment Variables (5 minutes)
```
In Vercel project, go to Settings → Environment Variables

Add these 5 variables:
┌─────────────────────────────────────────────────────┐
│ Name: VITE_GOOGLE_CLIENT_ID                         │
│ Value: your_google_client_id_here                   │
│ Environments: Select all 3 ✓                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Name: VITE_GEMINI_API_KEY                           │
│ Value: your_gemini_api_key_here                     │
│ Environments: Select all 3 ✓                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Name: VITE_OPENROUTER_API_KEY                       │
│ Value: your_openrouter_api_key_here                 │
│ Environments: Select all 3 ✓                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Name: VITE_HUGGINGFACE_API_KEY                      │
│ Value: your_huggingface_api_key_here                │
│ Environments: Select all 3 ✓                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Name: VITE_ENCRYPTION_KEY                           │
│ Value: your_encryption_key_here                     │
│ Environments: Select all 3 ✓                        │
└─────────────────────────────────────────────────────┘
```

---

## Step 4️⃣: Verify Build Settings (1 minute)
```
Vercel auto-detects Vite. Verify:

Framework: Vite ✓
Build Command: npm run build ✓
Output Directory: dist ✓
Install Command: npm install ✓
```

---

## Step 5️⃣: Deploy! (2-5 minutes)
```
Click the big "Deploy" button and wait...

✓ Building...
✓ Installing dependencies...
✓ Building your app...
✓ Optimizing...
✓ Deployment complete!

You get a URL like:
https://mindease-ai-anonymous-therapist.vercel.app
```

---

## ✅ Test Your Deployment

After deployment, visit your URL and test:
- [ ] Home page loads
- [ ] Chat with AI works
- [ ] Mood tracker functions
- [ ] Diagnostics page loads
- [ ] Crisis button accessible
- [ ] Google OAuth works

---

## 🚀 Auto-Deploy Future Changes

Push to GitHub = Auto-deploy to Vercel:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel automatically:
1. Detects changes
2. Builds your project
3. Deploys to production
4. Updates your live URL

---

## 📋 Before You Start

Have these ready:
- ✅ GitHub account (already logged in)
- ✅ Vercel account (or email)
- ✅ Google OAuth credentials
- ✅ Gemini API key
- ✅ Other API keys (if needed)

---

## 🎯 Deployment Time
**Total: ~15-20 minutes** ⏱️

---

**Your GitHub Repo:**
https://github.com/muhammad-shozab/MindEase---AI-Anonymous-Therapist

**Deployed URL will be:**
https://mindease-[yourname].vercel.app
