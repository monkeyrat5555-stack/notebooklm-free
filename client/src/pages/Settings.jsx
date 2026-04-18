import React, { useState } from 'react'
import { 
  Key, 
  Save, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Brain
} from 'lucide-react'

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({
    openrouter: '',
    groq: '',
    huggingface: '',
    youtube: '',
    pinecone: '',
    pineconeEnv: ''
  })

  const [saveStatus, setSaveStatus] = useState('')

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }))
  }

  const handleSave = () => {
    // TODO: Implement actual save logic
    setSaveStatus('success')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  const apiProviders = [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Free AI models for planning and writing',
      url: 'https://openrouter.ai',
      required: true,
      free: true
    },
    {
      id: 'groq',
      name: 'Groq',
      description: 'Fast inference for research tasks',
      url: 'https://groq.com',
      required: true,
      free: true
    },
    {
      id: 'huggingface',
      name: 'HuggingFace',
      description: 'Free embeddings and specialized models',
      url: 'https://huggingface.co',
      required: true,
      free: true
    },
    {
      id: 'youtube',
      name: 'YouTube API',
      description: 'Better video transcription (optional)',
      url: 'https://console.developers.google.com',
      required: false,
      free: true
    },
    {
      id: 'pinecone',
      name: 'Pinecone',
      description: 'Vector database for embeddings',
      url: 'https://pinecone.io',
      required: true,
      free: true
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your free AI provider API keys
        </p>
      </div>

      {/* Save Status */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">API Configuration</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.groq}
                    onChange={(e) => handleKeyChange('groq', e.target.value)}
                    placeholder="Enter your Groq API key"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    OpenRouter API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.openrouter}
                    onChange={(e) => handleKeyChange('openrouter', e.target.value)}
                    placeholder="Enter your OpenRouter API key"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    HuggingFace API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.huggingface}
                    onChange={(e) => handleKeyChange('huggingface', e.target.value)}
                    placeholder="Enter your HuggingFace API key"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    YouTube API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.youtube}
                    onChange={(e) => handleKeyChange('youtube', e.target.value)}
                    placeholder="Enter your YouTube API key"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Configuration
                </button>
              </div>

              {showStatus && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800">Configuration saved successfully!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-gray-900">4.</span>
            <span>Enter all API keys above and save</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-gray-900">5.</span>
            <span>Start uploading documents and chatting with your AI assistant!</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
