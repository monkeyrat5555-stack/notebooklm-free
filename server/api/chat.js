const express = require('express')
const router = express.Router()

// In-memory chat history (replace with database in production)
let chatHistory = []

// Get chat history
router.get('/history', (req, res) => {
  res.json({ messages: chatHistory })
})

// Send message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Add user message to history
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      conversationId: conversationId || 'default'
    }
    chatHistory.push(userMessage)

    // Real AI processing
    try {
      // Import AI services
      const MultiProviderAI = require('../services/multiProviderAI')
      const aiService = new MultiProviderAI()
      
      // Get documents from storage (in production, this would come from your database)
      const documents = [] // This would be populated with user's uploaded documents
      
      // Generate AI response using real AI providers
      const aiResponse = await aiService.generateResponse(message, documents)
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse.content,
        sources: aiResponse.sources || [],
        timestamp: new Date().toISOString(),
        conversationId: conversationId || 'default'
      }
      
      chatHistory.push(botMessage)
      res.json({ success: true, response: botMessage })
      
    } catch (error) {
      console.error('AI Processing Error:', error)
      
      // Fallback response
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I apologize, but I encountered an error processing your request. Please try again or upload some documents first.',
        sources: [],
        timestamp: new Date().toISOString(),
        conversationId: conversationId || 'default'
      }
      
      chatHistory.push(fallbackResponse)
      res.json({ success: true, response: fallbackResponse })
    }

  } catch (error) {
    console.error('Error processing chat message:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

// Clear chat history
router.delete('/history', (req, res) => {
  chatHistory = []
  res.json({ success: true, message: 'Chat history cleared' })
})

// Get conversation by ID
router.get('/conversation/:id', (req, res) => {
  const { id } = req.params
  const conversation = chatHistory.filter(msg => msg.conversationId === id)
  res.json({ success: true, conversation })
})

// Delete conversation
router.delete('/conversation/:id', (req, res) => {
  const { id } = req.params
  chatHistory = chatHistory.filter(msg => msg.conversationId !== id)
  res.json({ success: true, message: 'Conversation deleted' })
})

module.exports = router
