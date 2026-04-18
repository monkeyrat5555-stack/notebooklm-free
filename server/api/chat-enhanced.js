const express = require('express')
const router = express.Router()

// In-memory storage for conversations
let conversations = new Map()

// Send message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId = 'default' } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    console.log('Processing message:', message)

    // Get or create conversation
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        createdAt: new Date().toISOString()
      })
    }

    const conversation = conversations.get(conversationId)

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      conversationId
    }
    conversation.messages.push(userMessage)

    // Simple AI response logic
    let responseContent = ''
    let sources = []

    // Check if there are any documents (in production, this would check actual uploaded docs)
    const hasDocuments = false // This would be true if user uploaded documents

    if (!hasDocuments) {
      responseContent = `I understand you're asking about: "${message}"

However, I don't see any uploaded documents yet. Please upload some documents first, and then I can help you analyze them and provide detailed responses with citations.

To get started:
1. Go to the Documents page
2. Upload a PDF file or add a YouTube video
3. Come back here and ask questions about your content

Once you have documents uploaded, I'll be able to provide detailed analysis with proper citations from your sources.`
    } else {
      // In production, this would use real AI to analyze documents
      responseContent = `I understand you're asking about: "${message}"

Based on your uploaded documents, I would provide a detailed analysis with citations from your sources. This would include relevant information, quotes, and proper references to the specific documents you've uploaded.

The response would be generated using AI models that analyze your actual content and provide accurate, cited responses.`
      
      sources = [
        {
          title: 'Sample Document.pdf',
          type: 'pdf',
          page: 1
        }
      ]
    }

    // Create bot response
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: responseContent,
      sources: sources,
      timestamp: new Date().toISOString(),
      conversationId
    }

    conversation.messages.push(botMessage)

    res.json({
      success: true,
      response: botMessage
    })

  } catch (error) {
    console.error('Chat processing error:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

// Get conversation history
router.get('/conversation/:id', (req, res) => {
  const { id } = req.params
  const conversation = conversations.get(id)
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' })
  }

  res.json({
    success: true,
    conversation
  })
})

// Clear conversation
router.delete('/conversation/:id', (req, res) => {
  const { id } = req.params
  conversations.delete(id)
  
  res.json({
    success: true,
    message: 'Conversation cleared'
  })
})

module.exports = router
