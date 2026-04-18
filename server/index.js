const express = require('express')
const cors = require('cors')
const multer = require('multer')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

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

// API Routes - Enhanced versions with multi-provider AI and cloud processing
app.use('/api/documents', require('./api/documents-enhanced'))
app.use('/api/chat', require('./api/chat-enhanced'))
app.use('/api/youtube', require('./api/youtube'))
app.use('/api/embeddings', require('./api/embeddings'))
app.use('/api/routing', require('./api/routing'))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NotebookLM Free API is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error)
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NotebookLM Free API server running on port ${PORT}`)
  console.log(`📖 API documentation: http://localhost:${PORT}/api/health`)
})
