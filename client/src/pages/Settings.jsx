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
      {saveStatus && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          saveStatus === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>
            {saveStatus === 'success' 
              ? 'Settings saved successfully!' 
              : 'Error saving settings'}
          </span>
        </div>
      )}

      {/* API Keys Configuration */}
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">AI Provider API Keys</h2>
          </div>

          <div className="space-y-6">
            {apiProviders.map((provider) => (
              <div key={provider.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      {provider.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Required
                        </span>
                      )}
                      {provider.free && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Free Tier
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{provider.description}</p>
                  </div>
                  <a
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 text-sm"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={apiKeys[provider.id]}
                    onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                    placeholder={`Enter your ${provider.name} API key`}
                    className="flex-1 input-field"
                  />
                </div>

                {provider.id === 'pinecone' && (
                  <div className="mt-3 flex items-center space-x-3">
                    <input
                      type="text"
                      value={apiKeys.pineconeEnv}
                      onChange={(e) => handleApiKeyChange('pineconeEnv', e.target.value)}
                      placeholder="Pinecone environment (e.g., us-west1-gcp)"
                      className="flex-1 input-field"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 card">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Setup Guide</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="font-medium text-gray-900">1.</span>
            <span>Sign up for free accounts at OpenRouter, Groq, and HuggingFace</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-gray-900">2.</span>
            <span>Get your API keys from each provider's dashboard</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-gray-900">3.</span>
            <span>Create a free Pinecone account for vector storage</span>
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
