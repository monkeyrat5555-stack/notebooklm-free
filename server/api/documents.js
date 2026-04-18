const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

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

// In-memory document storage (replace with database in production)
let documents = []

// Upload and process PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(req.file.path)
    const pdfData = await pdfParse(pdfBuffer)

    // Create document object
    const document = {
      id: Date.now(),
      name: req.file.originalname,
      type: 'pdf',
      status: 'processed',
      size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      content: pdfData.text,
      pages: pdfData.numpages,
      addedAt: new Date().toISOString().split('T')[0],
      filePath: req.file.path
    }

    documents.push(document)

    // TODO: Create embeddings and store in vector database
    console.log(`Document processed: ${document.name} (${pdfData.numpages} pages)`)

    res.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        status: document.status,
        size: document.size,
        pages: document.pages,
        addedAt: document.addedAt
      }
    })

  } catch (error) {
    console.error('Error processing PDF:', error)
    res.status(500).json({ error: 'Failed to process PDF' })
  }
})

// Get all documents
router.get('/', (req, res) => {
  res.json({
    documents: documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      status: doc.status,
      size: doc.size,
      pages: doc.pages,
      addedAt: doc.addedAt
    }))
  })
})

// Get document by ID
router.get('/:id', (req, res) => {
  const document = documents.find(doc => doc.id == req.params.id)
  if (!document) {
    return res.status(404).json({ error: 'Document not found' })
  }
  res.json(document)
})

// Delete document
router.delete('/:id', (req, res) => {
  const documentIndex = documents.findIndex(doc => doc.id == req.params.id)
  if (documentIndex === -1) {
    return res.status(404).json({ error: 'Document not found' })
  }

  const document = documents[documentIndex]
  
  // Delete file from filesystem
  if (document.filePath && fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath)
  }

  // Remove from documents array
  documents.splice(documentIndex, 1)

  res.json({ success: true, message: 'Document deleted' })
})

// Add YouTube video as document
router.post('/youtube', async (req, res) => {
  try {
    const { url, title, transcript } = req.body

    if (!url || !title || !transcript) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const document = {
      id: Date.now(),
      name: `YouTube: ${title}`,
      type: 'youtube',
      status: 'processed',
      size: `${Math.round(transcript.length / 1000)} min`,
      content: transcript,
      url: url,
      addedAt: new Date().toISOString().split('T')[0]
    }

    documents.push(document)

    // TODO: Create embeddings and store in vector database
    console.log(`YouTube video processed: ${document.name}`)

    res.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        status: document.status,
        size: document.size,
        addedAt: document.addedAt
      }
    })

  } catch (error) {
    console.error('Error processing YouTube video:', error)
    res.status(500).json({ error: 'Failed to process YouTube video' })
  }
})

module.exports = router
