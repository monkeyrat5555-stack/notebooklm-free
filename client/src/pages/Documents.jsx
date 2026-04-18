import React, { useState } from 'react'
import { 
  Upload, 
  FileText, 
  Youtube, 
  Trash2, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

const Documents = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Research Paper.pdf',
      type: 'pdf',
      status: 'processed',
      size: '2.4 MB',
      addedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'YouTube: Introduction to AI',
      type: 'youtube',
      status: 'processing',
      size: '15 min',
      addedAt: '2024-01-14'
    }
  ])

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // TODO: Implement file upload logic
      console.log('Uploading file:', file.name)
    }
  }

  const handleYoutubeSubmit = () => {
    if (youtubeUrl) {
      // TODO: Implement YouTube URL processing
      console.log('Processing YouTube URL:', youtubeUrl)
      setYoutubeUrl('')
      setShowUploadModal(false)
    }
  }

  const deleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">
            Manage your PDFs and YouTube videos
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Source</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {doc.type === 'pdf' ? (
                    <FileText className="w-6 h-6 text-gray-600" />
                  ) : (
                    <Youtube className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>Added {doc.addedAt}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(doc.status)}
                      <span className="capitalize">{doc.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add Source</h2>
            
            <div className="space-y-4">
              {/* PDF Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload PDF</p>
                  <p className="text-sm text-gray-400 mt-1">Maximum 10MB</p>
                </label>
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="input-field"
                  />
                  <button
                    onClick={handleYoutubeSubmit}
                    disabled={!youtubeUrl}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents
