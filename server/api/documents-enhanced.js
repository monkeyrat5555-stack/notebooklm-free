const express = require('express')
const multer = require('multer')
const CloudIngestion = require('../services/cloudIngestion')
const MultiProviderAI = require('../services/multiProviderAI')
const router = express.Router()

// Initialize services
const cloudIngestion = new CloudIngestion()
const aiService = new MultiProviderAI()

// File upload configuration for serverless
const storage = multer.memoryStorage() // Use memory storage for serverless
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  }
})

// In-memory document storage (replace with remote database in production)
let documents = []

// Upload and process PDF using cloud-based ingestion
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log('📄 Processing PDF:', req.file.originalname)

    // Process PDF using cloud-based ingestion
    const document = await cloudIngestion.processPDF(
      req.file.buffer,
      req.file.originalname
    )

    // Store document metadata
    documents.push(document)

    // Create embeddings for search
    try {
      for (const chunk of document.chunks) {
        await aiService.createEmbedding(chunk.content)
      }
      console.log(`✅ Created embeddings for ${document.chunks.length} chunks`)
    } catch (error) {
      console.warn('⚠️ Embedding creation failed:', error.message)
    }

    res.json({
      success: true,
      document: {
        id: document.id,
        name: document.filename,
        type: document.type,
        status: 'processed',
        size: `${(document.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: document.pages,
        chunks: document.chunks.length,
        addedAt: document.processedAt.split('T')[0]
      }
    })

  } catch (error) {
    console.error('❌ PDF upload error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Add YouTube video using cloud-based transcript fetching
router.post('/youtube', async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' })
    }

    console.log('🎥 Processing YouTube video:', url)

    // Fetch transcript using cloud-based services
    const videoData = await cloudIngestion.fetchYouTubeTranscript(url)

    // Create document object
    const document = {
      id: cloudIngestion.generateId(),
      name: `YouTube: ${videoData.title}`,
      type: 'youtube',
      status: 'processed',
      size: `${Math.round(videoData.transcript.length / 1000)} min`,
      content: videoData.transcript,
      url: videoData.url,
      videoId: videoData.videoId,
      title: videoData.title,
      processedAt: new Date().toISOString(),
      chunks: cloudIngestion.createChunks(videoData.transcript, videoData.videoId)
    }

    // Store document
    documents.push(document)

    // Create embeddings for search
    try {
      for (const chunk of document.chunks) {
        await aiService.createEmbedding(chunk.content)
      }
      console.log(`✅ Created embeddings for ${document.chunks.length} chunks`)
    } catch (error) {
      console.warn('⚠️ Embedding creation failed:', error.message)
    }

    res.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        status: document.status,
        size: document.size,
        addedAt: document.processedAt.split('T')[0],
        videoId: document.videoId,
        title: document.title
      }
    })

  } catch (error) {
    console.error('❌ YouTube processing error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all documents with enhanced metadata
router.get('/', (req, res) => {
  res.json({
    documents: documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      status: doc.status,
      size: doc.size,
      pages: doc.pages,
      chunks: doc.chunks?.length || 0,
      addedAt: doc.processedAt?.split('T')[0] || doc.addedAt,
      videoId: doc.videoId,
      title: doc.title,
      url: doc.url
    }))
  })
})

// Get document by ID with full content
router.get('/:id', (req, res) => {
  const document = documents.find(doc => doc.id === req.params.id)
  if (!document) {
    return res.status(404).json({ error: 'Document not found' })
  }
  res.json(document)
})

// Search documents using AI embeddings
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    // Create embedding for query
    const queryEmbedding = await aiService.createEmbedding(query)

    // Search through all document chunks
    const results = []
    
    for (const doc of documents) {
      if (!doc.chunks) continue
      
      for (const chunk of doc.chunks) {
        const chunkEmbedding = await aiService.createEmbedding(chunk.content)
        const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding)
        
        if (similarity > 0.3) {
          results.push({
            documentId: doc.id,
            documentName: doc.name,
            documentType: doc.type,
            chunkId: chunk.id,
            content: chunk.content,
            similarity: similarity,
            metadata: {
              pages: doc.pages,
              videoId: doc.videoId,
              url: doc.url,
              title: doc.title
            }
          })
        }
      }
    }

    // Sort by similarity and limit results
    const sortedResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    res.json({
      query: query,
      results: sortedResults,
      total: sortedResults.length
    })

  } catch (error) {
    console.error('❌ Search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Delete document
router.delete('/:id', (req, res) => {
  const documentIndex = documents.findIndex(doc => doc.id === req.params.id)
  if (documentIndex === -1) {
    return res.status(404).json({ error: 'Document not found' })
  }

  const document = documents[documentIndex]
  documents.splice(documentIndex, 1)

  res.json({ 
    success: true, 
    message: `Deleted document: ${document.name}` 
  })
})

// Get document statistics
router.get('/stats/summary', (req, res) => {
  const stats = {
    totalDocuments: documents.length,
    pdfDocuments: documents.filter(d => d.type === 'pdf').length,
    youtubeDocuments: documents.filter(d => d.type === 'youtube').length,
    totalChunks: documents.reduce((sum, doc) => sum + (doc.chunks?.length || 0), 0),
    totalSize: documents.reduce((sum, doc) => sum + (doc.size || 0), 0),
    lastUpdated: documents.length > 0 ? 
      Math.max(...documents.map(d => new Date(d.processedAt))) : null
  }

  res.json(stats)
})

// Helper function for cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  const minLength = Math.min(vecA.length, vecB.length)
  for (let i = 0; i < minLength; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

module.exports = router
