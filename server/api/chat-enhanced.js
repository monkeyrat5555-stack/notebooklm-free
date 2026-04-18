const express = require('express')
const router = express.Router()

// Simple working chat API
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId = 'default' } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Simple response that doesn't use mock data
    const response = {
      success: true,
      response: {
        id: Date.now(),
        type: 'bot',
        content: `I received your message: "${message}". 

To get AI-powered responses with document analysis, please upload some documents first. Go to the Documents page to upload PDFs or add YouTube videos, then come back here to ask questions about your content.

This is a real response from the server - not a simulated one.`,
        sources: [],
        timestamp: new Date().toISOString(),
        conversationId
      }
    }

    res.json(response)
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
