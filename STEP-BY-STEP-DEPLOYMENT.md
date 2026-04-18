# 🚀 Step-by-Step Cloud Deployment Guide

Follow these exact steps to deploy NotebookLM Free without using your device as a server.

---

## 📋 **STEP 1: Get Your Free API Keys (10 minutes)**

### 🔑 Groq API Key (Required)
1. Go to [https://groq.com](https://groq.com)
2. Click "Sign Up" → Use email/GitHub
3. Check your email and verify account
4. Go to Dashboard → API Keys
5. Click "Create API Key"
6. Copy the key (starts with `gsk_`)

### 🔑 OpenRouter API Key (Required)
1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Click "Sign Up" → Use email/GitHub
3. Check email and verify
4. Go to Dashboard → API Keys
5. Click "Create New Key"
6. Copy the key (starts with `sk-or-v1-`)

### 🔑 HuggingFace API Key (Required)
1. Go to [https://huggingface.co](https://huggingface.co)
2. Click "Sign Up" → Use email/GitHub
3. Check email and verify
4. Go to Settings → Access Tokens
5. Click "New token"
6. Name it "notebooklm-free"
7. Copy the token (starts with `hf_`)

### 🔑 YouTube API Key (Optional - for better transcripts)
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Go to "APIs & Services" → "Library"
4. Search "YouTube Data API v3"
5. Click "Enable"
6. Go to "Credentials" → "Create Credentials" → "API Key"
7. Copy the API key

---

## 📤 **STEP 2: Push Code to GitHub (5 minutes)**

### If you haven't already:
```bash
# Navigate to your project folder
cd "c:\Users\EzraZ\OneDrive\Extra Or Personal\Desktop\notebooklm-free"

# Initialize Git if needed
git init
git add .
git commit -m "Initial commit - NotebookLM Free"
git branch -M main

# Create GitHub repository first at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/notebooklm-free.git
git push -u origin main
```

### If you already have Git:
```bash
# Add all changes
git add .
git commit -m "Ready for cloud deployment"
git push origin main
```

---

## 🌐 **STEP 3: Deploy to Vercel (5 minutes)**

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Choose free plan (default)

### 3.2 Import Your Repository
1. Click "New Project"
2. Find "notebooklm-free" in your GitHub repos
3. Click "Import"
4. Vercel will automatically detect the project structure

### 3.3 Configure Project Settings
Vercel will show:
- **Framework Preset**: Vite (auto-detected)
- **Root Directory**: `./client` (auto-detected)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

Click "Deploy" at the bottom.

### 3.4 Wait for Deployment
- Vercel will build and deploy (2-3 minutes)
- You'll see a URL like: `https://notebooklm-free-xxx.vercel.app`
- Keep this tab open - we'll need it for Step 4

---

## ⚙️ **STEP 4: Add Environment Variables in Vercel (5 minutes)**

### 4.1 Go to Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your "notebooklm-free" project
3. Go to "Settings" tab
4. Click "Environment Variables" in the left sidebar

### 4.2 Add Each API Key
Click "Add New" for each of these:

#### Variable 1: Groq
- **Name**: `GROQ_API_KEY`
- **Value**: `gsk_...` (paste your Groq key)
- **Environments**: Production, Preview, Development
- Click "Save"

#### Variable 2: OpenRouter
- **Name**: `OPENROUTER_API_KEY`
- **Value**: `sk-or-v1-...` (paste your OpenRouter key)
- **Environments**: Production, Preview, Development
- Click "Save"

#### Variable 3: HuggingFace
- **Name**: `HUGGINGFACE_API_KEY`
- **Value**: `hf_...` (paste your HuggingFace token)
- **Environments**: Production, Preview, Development
- Click "Save"

#### Variable 4: YouTube (Optional)
- **Name**: `YOUTUBE_API_KEY`
- **Value**: `AIza...` (paste your YouTube key)
- **Environments**: Production, Preview, Development
- Click "Save"

#### Variable 5: Node Environment
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environments**: Production, Preview, Development
- Click "Save"

### 4.3 Redeploy
After adding variables, Vercel will automatically redeploy (1-2 minutes).

---

## ✅ **STEP 5: Test Your Deployed App (5 minutes)**

### 5.1 Access Your App
Go to your Vercel URL: `https://notebooklm-free-xxx.vercel.app`

### 5.2 Test Core Features

#### Test Document Upload:
1. Click "Documents" in sidebar
2. Click "Add Source" button
3. Upload a small PDF file
4. Should show "Processing" then "Processed"

#### Test YouTube Integration:
1. In Documents, click "Add Source"
2. Paste YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Should fetch and process transcript

#### Test AI Chat:
1. Click "Chat" in sidebar
2. Type: "What is this document about?"
3. Should get AI response with citations

#### Test Settings:
1. Click "Settings" in sidebar
2. Should show API key configuration page
3. All fields should be populated (masked)

### 5.3 Check API Health
Go to: `https://notebooklm-free-xxx.vercel.app/api/health`
Should return:
```json
{
  "status": "ok",
  "message": "NotebookLM Free API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🎯 **STEP 6: Optional Enhancements (10 minutes)**

### 6.1 Custom Domain (Optional)
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Get free SSL certificate

### 6.2 Analytics (Optional)
1. Vercel provides built-in analytics
2. Go to "Analytics" tab in dashboard
3. Monitor usage, performance, errors

### 6.3 Preview Deployments (Optional)
1. Create a new branch: `git checkout -b feature-test`
2. Make changes and push
3. Vercel creates preview URL automatically
4. Test before merging to main

---

## 🚨 **STEP 7: Troubleshooting Common Issues**

### Issue: "API Key Not Working"
**Solution**: 
1. Check Vercel Environment Variables
2. Ensure no extra spaces in keys
3. Verify keys are copied correctly
4. Redeploy after changes

### Issue: "Function Timeout"
**Solution**:
1. Go to Vercel → Settings → Functions
2. Increase "Max Duration" to 60 seconds
3. Redeploy

### Issue: "CORS Errors"
**Solution**:
1. Already configured in code
2. Ensure you're using HTTPS URL
3. Check Vercel deployment logs

### Issue: "Build Failed"
**Solution**:
1. Check Vercel build logs
2. Ensure all dependencies installed
3. Verify package.json is correct

---

## 📊 **STEP 8: Monitor Usage**

### Check Free Tier Limits:
- **Vercel**: 100GB bandwidth/month
- **Groq**: 14 requests/second
- **OpenRouter**: 100 requests/minute
- **HuggingFace**: 30 requests/minute

### Monitor in Vercel:
1. Go to "Usage" tab
2. Monitor function executions
3. Check bandwidth usage
4. Set up alerts if needed

---

## 🎉 **You're Done!**

Your NotebookLM Free alternative is now:
- ✅ Running entirely on cloud
- ✅ No local server required
- ✅ Accessible globally via CDN
- ✅ Automatically scaled
- ✅ Completely free
- ✅ HTTPS secured

### Your Live App URL:
`https://notebooklm-free-xxx.vercel.app`

### What You Can Do:
1. Upload PDFs and process them
2. Add YouTube videos and get transcripts
3. Chat with AI about your documents
4. Get intelligent responses with citations
5. Manage all your knowledge in one place

### Total Time Investment:
- **API Keys**: 10 minutes
- **Git Setup**: 5 minutes
- **Vercel Deploy**: 5 minutes
- **Environment Variables**: 5 minutes
- **Testing**: 5 minutes
- **Total**: 30 minutes

That's it! Your free NotebookLM alternative is live on the cloud!
