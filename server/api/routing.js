const express = require('express')
const MultiProviderAI = require('../services/multiProviderAI')
const IntelligentRouter = require('../services/intelligentRouter')
const router = express.Router()

// Initialize services
const aiService = new MultiProviderAI()
const intelligentRouter = new IntelligentRouter()

// Get routing statistics
router.get('/stats', (req, res) => {
  try {
    const stats = aiService.getRoutingStats()
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Routing stats error:', error)
    res.status(500).json({ error: 'Failed to get routing stats' })
  }
})

// Get available models for task
router.get('/models/:task', (req, res) => {
  try {
    const { task } = req.params
    const models = aiService.getAvailableModels(task)
    
    res.json({
      success: true,
      task: task,
      models: models.map(model => ({
        provider: model.provider,
        model: model.model,
        capabilities: model.capabilities,
        strengths: model.strengths,
        speed: model.speed,
        reliability: model.reliability,
        contextWindow: model.contextWindow
      })),
      count: models.length
    })
  } catch (error) {
    console.error('❌ Models error:', error)
    res.status(500).json({ error: 'Failed to get available models' })
  }
})

// Set routing strategy
router.post('/strategy', (req, res) => {
  try {
    const { strategy } = req.body
    
    if (!strategy) {
      return res.status(400).json({ error: 'Strategy is required' })
    }

    const validStrategies = ['performance', 'speed', 'reliability', 'cost', 'balanced']
    
    if (!validStrategies.includes(strategy)) {
      return res.status(400).json({ 
        error: 'Invalid strategy',
        validStrategies: validStrategies
      })
    }

    const success = aiService.setRoutingStrategy(strategy)
    
    if (success) {
      res.json({
        success: true,
        strategy: strategy,
        message: `Routing strategy set to ${strategy}`
      })
    } else {
      res.status(400).json({ error: 'Failed to set strategy' })
    }

  } catch (error) {
    console.error('❌ Strategy setting error:', error)
    res.status(500).json({ error: 'Failed to set strategy' })
  }
})

// Get current routing strategy
router.get('/strategy', (req, res) => {
  try {
    res.json({
      success: true,
      strategy: aiService.defaultStrategy,
      availableStrategies: ['performance', 'speed', 'reliability', 'cost', 'balanced']
    })
  } catch (error) {
    console.error('❌ Strategy get error:', error)
    res.status(500).json({ error: 'Failed to get strategy' })
  }
})

// Perform health checks on all providers
router.post('/health-check', async (req, res) => {
  try {
    const healthResults = await aiService.performHealthChecks()
    
    res.json({
      success: true,
      health: healthResults,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Health check error:', error)
    res.status(500).json({ error: 'Failed to perform health checks' })
  }
})

// Get provider health status
router.get('/health/:provider', (req, res) => {
  try {
    const { provider } = req.params
    
    if (!provider) {
      return res.status(400).json({ error: 'Provider name is required' })
    }

    const isHealthy = aiService.checkProviderHealth(provider)
    
    res.json({
      success: true,
      provider: provider,
      healthy: isHealthy,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Provider health error:', error)
    res.status(500).json({ error: 'Failed to check provider health' })
  }
})

// Optimize routing based on performance
router.post('/optimize', (req, res) => {
  try {
    const optimization = aiService.optimizeRouting()
    
    res.json({
      success: true,
      optimization: optimization,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Optimization error:', error)
    res.status(500).json({ error: 'Failed to optimize routing' })
  }
})

// Test routing with specific task and strategy
router.post('/test', async (req, res) => {
  try {
    const { task, input, strategy } = req.body
    
    if (!task || !input) {
      return res.status(400).json({ error: 'Task and input are required' })
    }

    const startTime = Date.now()
    
    try {
      const result = await aiService.callWithFallback(task, input, null, strategy)
      const duration = Date.now() - startTime
      
      res.json({
        success: true,
        task: task,
        strategy: strategy || aiService.defaultStrategy,
        result: result,
        duration: duration,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      res.json({
        success: false,
        task: task,
        strategy: strategy || aiService.defaultStrategy,
        error: error.message,
        duration: duration,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Routing test error:', error)
    res.status(500).json({ error: 'Failed to test routing' })
  }
})

// Get routing recommendations
router.get('/recommendations', (req, res) => {
  try {
    const stats = aiService.getRoutingStats()
    const recommendations = []

    // Analyze performance and provide recommendations
    for (const [provider, providerStats] of Object.entries(stats.providerStats)) {
      if (providerStats.successRate < 0.8) {
        recommendations.push({
          type: 'performance',
          provider: provider,
          message: `Low success rate (${(providerStats.successRate * 100).toFixed(1)}%), consider using alternative providers`,
          priority: 'high'
        })
      }

      if (providerStats.avgLatency > 3000) {
        recommendations.push({
          type: 'speed',
          provider: provider,
          message: `High latency (${providerStats.avgLatency}ms), consider faster models`,
          priority: 'medium'
        })
      }
    }

    // Strategy recommendations
    const totalRequests = stats.totalRequests
    if (totalRequests > 100) {
      recommendations.push({
        type: 'strategy',
        message: 'High request volume detected, consider using "speed" strategy for better performance',
        priority: 'low'
      })
    }

    res.json({
      success: true,
      recommendations: recommendations,
      stats: {
        totalRequests: totalRequests,
        providerCount: Object.keys(stats.providerStats).length,
        modelCount: Object.keys(stats.modelStats).length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Recommendations error:', error)
    res.status(500).json({ error: 'Failed to get recommendations' })
  }
})

// Reset routing statistics
router.post('/reset', (req, res) => {
  try {
    // Clear performance history
    aiService.router.performanceHistory.clear()
    
    // Reset health status
    for (const [providerName, provider] of Object.entries(aiService.router.providers)) {
      provider.health = {
        status: 'healthy',
        lastCheck: Date.now(),
        consecutiveFailures: 0,
        avgLatency: 0
      }
    }

    res.json({
      success: true,
      message: 'Routing statistics and health status reset',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Reset error:', error)
    res.status(500).json({ error: 'Failed to reset routing' })
  }
})

// Get detailed model information
router.get('/model-info/:provider/:model', (req, res) => {
  try {
    const { provider, model } = req.params
    
    const providerInfo = aiService.router.providers[provider]
    if (!providerInfo) {
      return res.status(404).json({ error: 'Provider not found' })
    }

    const modelInfo = providerInfo.models[model]
    if (!modelInfo) {
      return res.status(404).json({ error: 'Model not found' })
    }

    res.json({
      success: true,
      provider: provider,
      model: model,
      info: {
        capabilities: modelInfo.capabilities,
        strengths: modelInfo.strengths,
        speed: modelInfo.speed,
        cost: modelInfo.cost,
        contextWindow: modelInfo.contextWindow,
        reliability: modelInfo.reliability,
        avgResponseTime: modelInfo.avgResponseTime
      },
      health: providerInfo.health,
      rateLimits: providerInfo.rateLimit
    })

  } catch (error) {
    console.error('❌ Model info error:', error)
    res.status(500).json({ error: 'Failed to get model info' })
  }
})

module.exports = router
