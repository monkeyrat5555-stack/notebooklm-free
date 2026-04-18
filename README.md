# NotebookLM Free

A completely free alternative to Google NotebookLM built with React and serverless functions.

## Features

- 📄 **PDF Upload**: Upload and process PDF documents
- 🎥 **YouTube Integration**: Extract and transcribe YouTube videos
- 🤖 **Free AI Processing**: Uses only free AI APIs (OpenRouter, Groq, HuggingFace)
- 🔍 **Smart Search**: Ask questions across all your sources
- 📝 **A+ Writing**: Multi-model pipeline for high-quality content generation
- 📚 **Citations**: Automatic inline citations like NotebookLM

## Architecture

### Frontend (React + Vite)
- Modern React app with Tailwind CSS
- File upload interface
- Chat interface for Q&A
- Document management

### Backend (Serverless)
- PDF processing
- YouTube transcription
- Vector embeddings
- AI model orchestration

### AI Providers
- **OpenRouter**: Free models for planning and writing
- **Groq**: Fast inference for research
- **HuggingFace**: Free embeddings and specialized models

## 🚀 Quick Start (Cloud-Only)

### Option 1: Deploy to Vercel (Recommended - Free)
1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy - 5 minutes total

### Option 2: Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development
npm run dev    # Frontend (port 3000)
npm run server  # Backend (port 3001)
```

### 🌐 Cloud Deployment Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete cloud-only setup instructions.

## Free API Setup

### OpenRouter
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Get your API key
3. Add to `.env` file

### Groq
1. Sign up at [groq.com](https://groq.com)
2. Get your API key
3. Add to `.env` file

### HuggingFace
1. Sign up at [huggingface.co](https://huggingface.co)
2. Get your API token
3. Add to `.env` file

## Project Structure

```
notebooklm-free/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
├── server/                # Serverless backend
│   ├── api/              # API endpoints
│   ├── services/         # AI services
│   └── utils/            # Server utilities
├── shared/               # Shared types and utilities
└── docs/                # Documentation
```

## License

MIT License - feel free to use and modify!
"# notebooklm-free" 
