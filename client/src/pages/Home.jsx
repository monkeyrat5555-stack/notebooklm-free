import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Youtube, 
  MessageSquare, 
  Brain,
  ArrowRight,
  Zap,
  BookOpen
} from 'lucide-react'

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <Brain className="w-16 h-16 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to NotebookLM Free
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Your completely free AI research assistant. Upload documents, add YouTube videos, 
          and get intelligent answers with citations.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/documents" className="btn-primary flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/chat" className="btn-secondary flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Try Chat</span>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold">PDF Upload</h3>
          </div>
          <p className="text-gray-600">
            Upload PDF documents and automatically extract knowledge for intelligent search and analysis.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Youtube className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold">YouTube Integration</h3>
          </div>
          <p className="text-gray-600">
            Paste YouTube URLs to automatically transcribe and analyze video content alongside your documents.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold">Free AI Processing</h3>
          </div>
          <p className="text-gray-600">
            Powered by free AI APIs including OpenRouter, Groq, and HuggingFace - no costs involved.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              1
            </div>
            <h4 className="font-semibold mb-2">Add Sources</h4>
            <p className="text-sm text-gray-600">Upload PDFs or add YouTube URLs</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              2
            </div>
            <h4 className="font-semibold mb-2">AI Processing</h4>
            <p className="text-sm text-gray-600">Automatic extraction and embedding</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              3
            </div>
            <h4 className="font-semibold mb-2">Ask Questions</h4>
            <p className="text-sm text-gray-600">Chat with your knowledge base</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              4
            </div>
            <h4 className="font-semibold mb-2">Get Answers</h4>
            <p className="text-sm text-gray-600">Receive responses with citations</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
