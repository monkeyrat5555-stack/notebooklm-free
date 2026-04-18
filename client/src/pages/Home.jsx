import { useState } from 'react'
import { Upload, FileVideo, MessageSquare, Zap, Shield, Brain } from 'lucide-react'

export default function Home() {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">NotebookLM Free</h1>
              <span className="text-sm text-slate-500 ml-2">AI Research Assistant</span>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Upload Area */}
          <div 
            className={`mb-12 border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                Upload Your Documents
              </h2>
              
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Drop files here or click to browse. Support PDFs and YouTube videos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                  <FileVideo className="w-5 h-5" />
                  <span>Upload Files</span>
                </button>
                
                <button className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Documents</h3>
              <p className="text-slate-600 text-sm">
                PDF files, research papers, articles, and any text content.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileVideo className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">YouTube Videos</h3>
              <p className="text-slate-600 text-sm">
                Paste any YouTube URL to get instant transcript and analysis.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">AI Chat</h3>
              <p className="text-slate-600 text-sm">
                Ask questions about your documents and get cited answers.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">How It Works</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Upload</h3>
                <p className="text-slate-600 text-sm">Add PDFs or YouTube videos</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Process</h3>
                <p className="text-slate-600 text-sm">AI analyzes your content</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Chat</h3>
                <p className="text-slate-600 text-sm">Ask questions about your documents</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Get Answers</h3>
                <p className="text-slate-600 text-sm">Receive AI responses with citations</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Why Choose NotebookLM Free?</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-green-500 mr-2" />
                  100% Free Forever
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• No API costs</li>
                  <li>• No local setup required</li>
                  <li>• Unlimited document uploads</li>
                  <li>• Advanced AI models</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Brain className="w-6 h-6 text-blue-500 mr-2" />
                  Intelligent AI
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Multi-provider routing</li>
                  <li>• 8-stage writing pipeline</li>
                  <li>• Perfect citations</li>
                  <li>• Academic quality output</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200/50 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-sm">
            Free alternative to Google NotebookLM • Powered by AI
          </p>
        </div>
      </footer>
    </div>
  )
}
