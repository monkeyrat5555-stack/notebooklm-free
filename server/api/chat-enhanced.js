const express = require('express')
const EnhancedWritingPipeline = require('../services/enhancedWritingPipeline')
const CitationSystem = require('../services/citationSystem')
const MultiProviderAI = require('../services/multiProviderAI')
const router = express.Router()

// Initialize services
const writingPipeline = new EnhancedWritingPipeline()
const citationSystem = new CitationSystem()
const aiService = new MultiProviderAI()

// In-memory storage (replace with remote database in production)
let conversations = new Map()
let documents = [] // This would come from documents API

// Send message through 8-stage writing pipeline
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId = 'default' } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    console.log('💬 Processing message:', message)

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
      conversationId: conversationId
    }
    conversation.messages.push(userMessage)

    // Get relevant documents for context
    const relevantDocuments = await getRelevantDocuments(message)

    // Process through 8-stage pipeline
    const pipelineResult = await writingPipeline.processQuery(message, relevantDocuments)

    // Create bot response
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: pipelineResult.content,
      citations: pipelineResult.citations,
      sources: pipelineResult.sources,
      metadata: pipelineResult.metadata,
      timestamp: new Date().toISOString(),
      conversationId: conversationId
    }

    conversation.messages.push(botMessage)

    console.log('✅ Response generated:', {
      length: pipelineResult.content.length,
      citations: pipelineResult.citations.length,
      sources: pipelineResult.sources.length
    })

    res.json({
      success: true,
      response: botMessage,
      conversation: {
        id: conversationId,
        messageCount: conversation.messages.length
      }
    })

  } catch (error) {
    console.error('❌ Chat processing error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Quick answer mode (bypasses full pipeline for simple questions)
router.post('/quick', async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Use reasoning model for quick response
    const response = await aiService.reason([
      { role: 'system', content: 'You are a helpful assistant. Provide concise, accurate answers.' },
      { role: 'user', content: message }
    ])

    res.json({
      success: true,
      response: {
        id: Date.now(),
        type: 'bot',
        content: response,
        citations: [],
        sources: [],
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Quick chat error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get conversation history
router.get('/conversation/:id', (req, res) => {
  const conversationId = req.params.id
  const conversation = conversations.get(conversationId)

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' })
  }

  res.json({
    conversation: conversation,
    messageCount: conversation.messages.length
  })
})

// Get all conversations
router.get('/conversations', (req, res) => {
  const conversationList = Array.from(conversations.values()).map(conv => ({
    id: conv.id,
    messageCount: conv.messages.length,
    createdAt: conv.createdAt,
    lastMessage: conv.messages[conv.messages.length - 1]?.timestamp
  }))

  res.json({
    conversations: conversationList,
    total: conversationList.length
  })
})

// Delete conversation
router.delete('/conversation/:id', (req, res) => {
  const conversationId = req.params.id
  const deleted = conversations.delete(conversationId)

  if (!deleted) {
    return res.status(404).json({ error: 'Conversation not found' })
  }

  res.json({
    success: true,
    message: 'Conversation deleted'
  })
})

// Clear all conversations
router.delete('/conversations', (req, res) => {
  const count = conversations.size
  conversations.clear()

  res.json({
    success: true,
    message: `Cleared ${count} conversations`
  })
})

// Search within conversation
router.post('/search/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const conversation = conversations.get(id)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // Search through messages
    const results = conversation.messages
      .filter(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      )
      .map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content.substring(0, 200) + '...',
        timestamp: msg.timestamp,
        citations: msg.citations || []
      }))

    res.json({
      query: query,
      results: results,
      total: results.length
    })

  } catch (error) {
    console.error('❌ Conversation search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Get conversation statistics
router.get('/stats/:id', (req, res) => {
  const conversationId = req.params.id
  const conversation = conversations.get(conversationId)

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' })
  }

  const userMessages = conversation.messages.filter(msg => msg.type === 'user')
  const botMessages = conversation.messages.filter(msg => msg.type === 'bot')
  const totalCitations = botMessages.reduce((sum, msg) => sum + (msg.citations?.length || 0), 0)

  const stats = {
    conversationId: conversationId,
    totalMessages: conversation.messages.length,
    userMessages: userMessages.length,
    botMessages: botMessages.length,
    totalCitations: totalCitations,
    averageCitationsPerResponse: botMessages.length > 0 ? totalCitations / botMessages.length : 0,
    createdAt: conversation.createdAt,
    lastMessage: conversation.messages[conversation.messages.length - 1]?.timestamp
  }

  res.json(stats)
})

// Helper function to get relevant documents
async function getRelevantDocuments(query) {
  try {
    // In production, this would use vector search to find relevant documents
    // For now, return empty array so AI doesn't use sample content
    // The AI will respond with "Please upload documents first" message
    return []
  } catch (error) {
    console.error('Error getting relevant documents:', error)
    return []
  }
}

// Export conversations for backup
router.get('/export/:id', (req, res) => {
  const conversationId = req.params.id
  const conversation = conversations.get(conversationId)

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' })
  }

  const exportData = {
    conversation: conversation,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="conversation-${conversationId}.json"`)
  res.json(exportData)
})

// Import conversations from backup
router.post('/import', async (req, res) => {
  try {
    const { conversationData } = req.body

    if (!conversationData || !conversationData.conversation) {
      return res.status(400).json({ error: 'Invalid conversation data' })
    }

    const conversation = conversationData.conversation
    conversations.set(conversation.id, conversation)

    res.json({
      success: true,
      message: 'Conversation imported successfully',
      conversationId: conversation.id
    })

  } catch (error) {
    console.error('❌ Import error:', error)
    res.status(500).json({ error: 'Import failed' })
  }
})

module.exports = router
