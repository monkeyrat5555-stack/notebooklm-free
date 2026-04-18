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

  const handleFileUpload = (e) => {
    const files = e.target.files
    // Handle file upload
  }

  const handleYouTubeUrl = () => {
    const url = prompt('Enter YouTube URL:')
    if (url) {
      // Handle YouTube URL
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">My Documents</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
              
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Source</span>
              </button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Upload Area */}
          <div 
            className={`mb-8 border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Add Your Documents
              </h2>
              
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Upload PDF files or add YouTube videos to start analyzing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <label className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Choose Files</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={handleYouTubeUrl}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2"
                >
                  <FileVideo className="w-5 h-5" />
                  <span>YouTube URL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Documents List */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileVideo className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No documents yet</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Upload your first PDF or add a YouTube video to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        doc.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {doc.type === 'pdf' ? (
                          <Upload className="w-5 h-5 text-red-600" />
                        ) : (
                          <FileVideo className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{doc.name}</h3>
                        <p className="text-sm text-slate-500">{doc.type}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-slate-600">
                    {doc.type === 'pdf' ? (
                      <p>PDF Document • {doc.pages} pages • {doc.size}</p>
                    ) : (
                      <p>YouTube Video • {doc.duration}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'processed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                    <span className="text-xs text-slate-500">{doc.addedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
        </div>
      )}
    </div>
  )
}

export default Documents
