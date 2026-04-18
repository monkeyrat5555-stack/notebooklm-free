# 🚀 Cloud-Only Deployment Guide

Deploy NotebookLM Free to run entirely on cloud services without using your device as a server.

## 🌐 **Deployment Options**

### Option 1: Vercel (Recommended - Free)
Complete serverless deployment with automatic scaling.

### Option 2: Netlify (Free)
Alternative serverless platform with Git integration.

### Option 3: Railway (Free Tier)
Container-based deployment with database.

---

## 📋 **Step-by-Step Vercel Deployment**

### 1. **Prepare Your Repository**
```bash
# Commit all changes to Git
git add .
git commit -m "Ready for cloud deployment"
git push origin main
```

### 2. **Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the project structure

### 3. **Configure Environment Variables**
In Vercel dashboard → Settings → Environment Variables:

```env
# AI Provider API Keys
GROQ_API_KEY=your_groq_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here

# Optional APIs
YOUTUBE_API_KEY=your_youtube_key_here
PDF_CO_API_KEY=your_pdf_co_key_here
RAPIDAPI_KEY=your_rapidapi_key_here

# Database (if using)
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_ENVIRONMENT=your_pinecone_env_here

# Server Configuration
NODE_ENV=production
```

### 4. **Deployment Settings**
Vercel automatically uses the `vercel.json` configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },
    { "src": "/(.*)", "dest": "/client/$1" }
  ],
  "functions": {
    "server/index.js": { "maxDuration": 30 }
  }
}
```

---

## 🔧 **Alternative: Netlify Deployment**

### 1. **Build Configuration**
Create `netlify.toml`:

```toml
[build]
  publish = "client/dist"
  command = "cd client && npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = "server"
```

### 2. **Netlify Functions**
Convert server to Netlify functions structure:

```
netlify/functions/
├── api/
│   ├── documents.js
│   ├── chat.js
│   └── routing.js
```

---

## 🗄️ **Railway Deployment (with Database)**

### 1. **railway.json Configuration**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### 2. **Database Setup**
Railway provides free PostgreSQL database for storing conversations and documents.

---

## 🔑 **Getting Your API Keys**

### Groq (Free)
1. Sign up at [groq.com](https://groq.com)
2. Go to Dashboard → API Keys
3. Copy your API key

### OpenRouter (Free)
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to API Keys section
3. Create new key

### HuggingFace (Free)
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token

### YouTube API (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create API key

---

## 🌍 **Access Your Deployed App**

### Vercel
- URL: `https://your-app-name.vercel.app`
- Automatic HTTPS and global CDN

### Netlify
- URL: `https://your-app-name.netlify.app`
- Automatic HTTPS and CDN

### Railway
- URL: `https://your-app-name.up.railway.app`
- Custom domain available

---

## 📊 **Monitoring and Scaling**

### Vercel Analytics
- Real-time usage metrics
- Function execution times
- Error tracking
- Free tier: 100GB bandwidth/month

### Performance Monitoring
```bash
# Check routing stats
curl https://your-app.vercel.app/api/routing/stats

# Health check
curl https://your-app.vercel.app/api/health
```

---

## 🔒 **Security Considerations**

### Environment Variables
- Never commit API keys to Git
- Use Vercel's encrypted environment variables
- Rotate keys regularly

### Rate Limiting
- Built-in rate limiting per provider
- Vercel provides DDoS protection
- Free tier limits prevent abuse

---

## 🚨 **Troubleshooting**

### Common Issues

**Function Timeout**
```json
// vercel.json
"functions": {
  "server/index.js": { "maxDuration": 60 }
}
```

**CORS Issues**
```javascript
// Already configured in server/index.js
app.use(cors({ origin: true }))
```

**API Key Errors**
- Verify environment variables in Vercel dashboard
- Check API key permissions
- Ensure keys are not expired

### Debug Mode
```env
NODE_ENV=development
```

---

## 💰 **Cost Breakdown**

### Completely Free Setup
- **Vercel**: $0/month (100GB bandwidth)
- **Groq**: $0/month (14 requests/second)
- **OpenRouter**: $0/month (100 requests/minute)
- **HuggingFace**: $0/month (30 requests/minute)

### Total Monthly Cost: $0

---

## 🔄 **Automatic Updates**

### Git-Based Deployment
```bash
# Push changes → Auto-deploy
git add .
git commit -m "Update features"
git push origin main
```

### Preview Deployments
- Vercel creates preview URLs for each PR
- Test changes before production
- Automatic rollback available

---

## 📱 **Mobile and Desktop Access**

Your deployed app works on:
- **Desktop**: Any modern browser
- **Mobile**: Responsive design
- **Tablet**: Optimized layout
- **PWA**: Installable as app

---

## 🎯 **Next Steps**

1. **Deploy to Vercel** (5 minutes)
2. **Add API keys** (2 minutes)
3. **Test all features** (10 minutes)
4. **Share your app** (instant)

That's it! Your NotebookLM Free alternative is now running entirely on cloud services with zero local server requirements.
