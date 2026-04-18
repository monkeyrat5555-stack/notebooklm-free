class IntelligentRouter {
  constructor() {
    this.providers = {
      groq: {
        name: 'Groq',
        apiKey: process.env.GROQ_API_KEY,
        baseUrl: 'https://api.groq.com/openai/v1',
        models: {
          'llama3-70b-8192': {
            capabilities: ['reasoning', 'analysis', 'comparison'],
            strengths: ['accuracy', 'depth'],
            speed: 'medium',
            cost: 'free',
            contextWindow: 8192,
            reliability: 0.95,
            avgResponseTime: 2000
          },
          'llama3-8b-8192': {
            capabilities: ['reasoning', 'quick-response', 'classification'],
            strengths: ['speed', 'efficiency'],
            speed: 'fast',
            cost: 'free',
            contextWindow: 8192,
            reliability: 0.98,
            avgResponseTime: 800
          },
          'mixtral-8x7b-32768': {
            capabilities: ['writing', 'comparison', 'analysis'],
            strengths: ['creativity', 'context'],
            speed: 'medium',
            cost: 'free',
            contextWindow: 32768,
            reliability: 0.92,
            avgResponseTime: 3000
          }
        },
        rateLimit: {
          requestsPerSecond: 14,
          requestsPerMinute: 840,
          tokensPerMinute: 21000
        },
        health: {
          status: 'healthy',
          lastCheck: Date.now(),
          consecutiveFailures: 0,
          avgLatency: 0
        }
      },
      openrouter: {
        name: 'OpenRouter',
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: 'https://openrouter.ai/api/v1',
        models: {
          'meta-llama/llama-3-70b-instruct': {
            capabilities: ['writing', 'reasoning', 'analysis'],
            strengths: ['quality', 'versatility'],
            speed: 'medium',
            cost: 'free',
            contextWindow: 8192,
            reliability: 0.90,
            avgResponseTime: 3500
          },
          'microsoft/wizardlm-2-8x22b': {
            capabilities: ['outline', 'planning', 'structuring'],
            strengths: ['organization', 'logic'],
            speed: 'slow',
            cost: 'free',
            contextWindow: 8192,
            reliability: 0.88,
            avgResponseTime: 5000
          },
          'anthropic/claude-3-haiku': {
            capabilities: ['style', 'refinement', 'editing'],
            strengths: ['quality', 'nuance'],
            speed: 'fast',
            cost: 'free',
            contextWindow: 200000,
            reliability: 0.94,
            avgResponseTime: 1500
          },
          'google/gemini-pro': {
            capabilities: ['refinement', 'analysis', 'comparison'],
            strengths: ['accuracy', 'consistency'],
            speed: 'medium',
            cost: 'free',
            contextWindow: 32768,
            reliability: 0.91,
            avgResponseTime: 2500
          }
        },
        rateLimit: {
          requestsPerMinute: 100,
          tokensPerMonth: 100000
        },
        health: {
          status: 'healthy',
          lastCheck: Date.now(),
          consecutiveFailures: 0,
          avgLatency: 0
        }
      },
      huggingface: {
        name: 'HuggingFace',
        apiKey: process.env.HUGGINGFACE_API_KEY,
        baseUrl: 'https://api-inference.huggingface.co/models',
        models: {
          'sentence-transformers/all-MiniLM-L6-v2': {
            capabilities: ['embeddings'],
            strengths: ['accuracy', 'speed'],
            speed: 'fast',
            cost: 'free',
            contextWindow: 512,
            reliability: 0.96,
            avgResponseTime: 500
          },
          'facebook/bart-large-cnn': {
            capabilities: ['summarization'],
            strengths: ['coherence', 'conciseness'],
            speed: 'medium',
            cost: 'free',
            contextWindow: 1024,
            reliability: 0.93,
            avgResponseTime: 1200
          },
          'cardiffnlp/twitter-roberta-base-sentiment-latest': {
            capabilities: ['classification', 'sentiment'],
            strengths: ['accuracy', 'specialization'],
            speed: 'fast',
            cost: 'free',
            contextWindow: 512,
            reliability: 0.97,
            avgResponseTime: 300
          }
        },
        rateLimit: {
          requestsPerMinute: 30,
          inferenceRequestsPerMonth: 30000
        },
        health: {
          status: 'healthy',
          lastCheck: Date.now(),
          consecutiveFailures: 0,
          avgLatency: 0
        }
      }
    }

    this.performanceHistory = new Map()
    this.routingStrategies = {
      'performance': this.selectByPerformance.bind(this),
      'cost': this.selectByCost.bind(this),
      'speed': this.selectBySpeed.bind(this),
      'reliability': this.selectByReliability.bind(this),
      'balanced': this.selectBalanced.bind(this)
    }
  }

  // Main routing method - automatically selects best model
  async route(task, input, strategy = 'balanced') {
    console.log(`🧭 Intelligent routing for task: ${task} (strategy: ${strategy})`)

    try {
      // Get available models for this task
      const candidates = this.getCandidateModels(task)
      
      if (candidates.length === 0) {
        throw new Error(`No models available for task: ${task}`)
      }

      // Select best model using strategy
      const selector = this.routingStrategies[strategy]
      const selectedModel = selector(candidates, task, input)

      // Update performance tracking
      const startTime = Date.now()

      try {
        const result = await this.executeModel(selectedModel, task, input)
        const duration = Date.now() - startTime

        // Record success
        this.recordPerformance(selectedModel, task, true, duration)
        console.log(`✅ Route success: ${selectedModel.provider}/${selectedModel.model} (${duration}ms)`)

        return result

      } catch (error) {
        const duration = Date.now() - startTime

        // Record failure
        this.recordPerformance(selectedModel, task, false, duration, error)
        console.log(`❌ Route failure: ${selectedModel.provider}/${selectedModel.model} - ${error.message}`)

        // Try fallback models
        return this.handleFallback(selectedModel, candidates, task, input, strategy)
      }

    } catch (error) {
      console.error('❌ Routing failed completely:', error)
      throw error
    }
  }

  // Get all models capable of handling the task
  getCandidateModels(task) {
    const candidates = []

    for (const [providerName, provider] of Object.entries(this.providers)) {
      // Check provider health
      if (!this.isProviderHealthy(providerName)) {
        continue
      }

      // Check rate limits
      if (!this.checkRateLimit(providerName)) {
        continue
      }

      // Find models with required capability
      for (const [modelName, modelInfo] of Object.entries(provider.models)) {
        if (modelInfo.capabilities.includes(task)) {
          candidates.push({
            provider: providerName,
            model: modelName,
            ...modelInfo,
            providerInfo: provider
          })
        }
      }
    }

    return candidates
  }

  // Selection strategies
  selectByPerformance(candidates, task, input) {
    return candidates.reduce((best, current) => {
      const bestScore = this.calculatePerformanceScore(best)
      const currentScore = this.calculatePerformanceScore(current)
      return currentScore > bestScore ? current : best
    })
  }

  selectByCost(candidates, task, input) {
    // All models are free, so prioritize by other factors
    return this.selectBalanced(candidates, task, input)
  }

  selectBySpeed(candidates, task, input) {
    const speedOrder = { 'fast': 3, 'medium': 2, 'slow': 1 }
    
    return candidates.reduce((fastest, current) => {
      const fastestScore = speedOrder[fastest.speed] || 0
      const currentScore = speedOrder[current.speed] || 0
      return currentScore > fastestScore ? current : fastest
    })
  }

  selectByReliability(candidates, task, input) {
    return candidates.reduce((mostReliable, current) => {
      return current.reliability > mostReliable.reliability ? current : mostReliable
    })
  }

  selectBalanced(candidates, task, input) {
    return candidates.reduce((best, current) => {
      const bestScore = this.calculateBalancedScore(best, task)
      const currentScore = this.calculateBalancedScore(current, task)
      return currentScore > bestScore ? current : best
    })
  }

  // Scoring algorithms
  calculatePerformanceScore(model) {
    const history = this.performanceHistory.get(`${model.provider}/${model.model}`)
    if (!history) return model.reliability

    const recentPerformance = history.slice(-10) // Last 10 requests
    const successRate = recentPerformance.filter(p => p.success).length / recentPerformance.length
    const avgLatency = recentPerformance.reduce((sum, p) => sum + p.latency, 0) / recentPerformance.length

    return (successRate * 0.7) + ((1 - Math.min(avgLatency / 5000, 1)) * 0.3)
  }

  calculateBalancedScore(model, task) {
    const performanceScore = this.calculatePerformanceScore(model)
    const reliabilityScore = model.reliability
    const speedScore = this.getSpeedScore(model.speed)
    const capabilityScore = this.getCapabilityScore(model, task)

    return (
      performanceScore * 0.3 +
      reliabilityScore * 0.25 +
      speedScore * 0.2 +
      capabilityScore * 0.25
    )
  }

  getSpeedScore(speed) {
    const scores = { 'fast': 1.0, 'medium': 0.7, 'slow': 0.4 }
    return scores[speed] || 0.5
  }

  getCapabilityScore(model, task) {
    // Check if this is a primary capability for the model
    const primaryCapabilities = {
      'reasoning': ['reasoning', 'analysis'],
      'writing': ['writing'],
      'embeddings': ['embeddings'],
      'summarization': ['summarization'],
      'comparison': ['comparison', 'analysis'],
      'outline': ['outline', 'planning'],
      'style': ['style', 'refinement', 'editing'],
      'classification': ['classification', 'sentiment']
    }

    const primary = primaryCapabilities[task] || []
    const isPrimary = primary.some(cap => model.capabilities.includes(cap))
    
    return isPrimary ? 1.0 : 0.7
  }

  // Health monitoring
  isProviderHealthy(providerName) {
    const provider = this.providers[providerName]
    const health = provider.health

    // Check if provider is marked as unhealthy
    if (health.status === 'unhealthy') {
      return false
    }

    // Check consecutive failures
    if (health.consecutiveFailures > 3) {
      return false
    }

    // Check if health check is recent
    const timeSinceLastCheck = Date.now() - health.lastCheck
    if (timeSinceLastCheck > 60000) { // 1 minute
      this.performHealthCheck(providerName)
    }

    return true
  }

  async performHealthCheck(providerName) {
    const provider = this.providers[providerName]
    
    try {
      const startTime = Date.now()
      
      // Simple health check request
      const testModel = Object.keys(provider.models)[0]
      await this.executeModel({
        provider: providerName,
        model: testModel,
        ...provider.models[testModel],
        providerInfo: provider
      }, 'reasoning', {
        messages: [{ role: 'user', content: 'Health check' }],
        temperature: 0.1,
        maxTokens: 10
      })

      const latency = Date.now() - startTime

      // Update health status
      provider.health.status = 'healthy'
      provider.health.lastCheck = Date.now()
      provider.health.consecutiveFailures = 0
      provider.health.avgLatency = latency

      console.log(`✅ Health check passed: ${providerName} (${latency}ms)`)

    } catch (error) {
      provider.health.consecutiveFailures++
      provider.health.lastCheck = Date.now()

      if (provider.health.consecutiveFailures > 3) {
        provider.health.status = 'unhealthy'
        console.log(`❌ Provider marked unhealthy: ${providerName}`)
      }

      console.log(`⚠️ Health check failed: ${providerName} - ${error.message}`)
    }
  }

  checkRateLimit(providerName) {
    const provider = this.providers[providerName]
    const now = Date.now()

    // Reset counters if needed
    if (now - (provider.lastReset || 0) > 60000) {
      provider.requestCount = 0
      provider.lastReset = now
    }

    // Check rate limits
    if (provider.rateLimit.requestsPerSecond) {
      const recentRequests = provider.recentRequests?.filter(r => now - r < 1000) || []
      if (recentRequests.length >= provider.rateLimit.requestsPerSecond) {
        return false
      }
    }

    if (provider.rateLimit.requestsPerMinute) {
      if ((provider.requestCount || 0) >= provider.rateLimit.requestsPerMinute) {
        return false
      }
    }

    return true
  }

  // Model execution
  async executeModel(model, task, input) {
    const provider = this.providers[model.provider]
    
    // Record request
    provider.requestCount = (provider.requestCount || 0) + 1
    provider.recentRequests = provider.recentRequests || []
    provider.recentRequests.push(Date.now())
    
    // Clean old requests
    provider.recentRequests = provider.recentRequests.filter(r => Date.now() - r < 60000)

    // Execute based on provider
    switch (model.provider) {
      case 'groq':
        return this.executeGroq(model, task, input)
      case 'openrouter':
        return this.executeOpenRouter(model, task, input)
      case 'huggingface':
        return this.executeHuggingFace(model, task, input)
      default:
        throw new Error(`Unknown provider: ${model.provider}`)
    }
  }

  async executeGroq(model, task, input) {
    const response = await fetch(`${model.providerInfo.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.providerInfo.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.model,
        messages: input.messages || [{ role: 'user', content: input.prompt }],
        temperature: input.temperature || 0.7,
        max_tokens: input.maxTokens || 4000
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async executeOpenRouter(model, task, input) {
    const response = await fetch(`${model.providerInfo.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.providerInfo.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://notebooklm-free.com',
        'X-Title': 'NotebookLM Free'
      },
      body: JSON.stringify({
        model: model.model,
        messages: input.messages || [{ role: 'user', content: input.prompt }],
        temperature: input.temperature || 0.7,
        max_tokens: input.maxTokens || 4000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async executeHuggingFace(model, task, input) {
    const response = await fetch(`${model.providerInfo.baseUrl}/${model.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.providerInfo.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: input.prompt || input.text,
        parameters: {
          max_length: input.maxTokens || 500,
          temperature: input.temperature || 0.7
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (task === 'embeddings') {
      return data[0].embedding
    }
    
    return data[0]?.generated_text || data[0]?.summary_text || data
  }

  // Fallback handling
  async handleFallback(failedModel, candidates, task, input, strategy) {
    console.log(`🔄 Initiating fallback from ${failedModel.provider}/${failedModel.model}`)

    // Remove failed model from candidates
    const remainingCandidates = candidates.filter(c => 
      !(c.provider === failedModel.provider && c.model === failedModel.model)
    )

    if (remainingCandidates.length === 0) {
      throw new Error('No fallback models available')
    }

    // Mark provider as having issues
    this.providers[failedModel.provider].health.consecutiveFailures++

    // Try next best model
    const selector = this.routingStrategies[strategy]
    const nextModel = selector(remainingCandidates, task, input)

    console.log(`🔄 Falling back to: ${nextModel.provider}/${nextModel.model}`)

    try {
      const result = await this.executeModel(nextModel, task, input)
      this.recordPerformance(nextModel, task, true, Date.now())
      return result
    } catch (error) {
      // Recursive fallback
      return this.handleFallback(nextModel, remainingCandidates, task, input, strategy)
    }
  }

  // Performance tracking
  recordPerformance(model, task, success, latency, error = null) {
    const key = `${model.provider}/${model.model}`
    
    if (!this.performanceHistory.has(key)) {
      this.performanceHistory.set(key, [])
    }

    const history = this.performanceHistory.get(key)
    history.push({
      task: task,
      success: success,
      latency: latency,
      error: error?.message,
      timestamp: Date.now()
    })

    // Keep only last 100 records
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }

    // Update model reliability based on recent performance
    const recentHistory = history.slice(-20)
    const recentSuccessRate = recentHistory.filter(h => h.success).length / recentHistory.length
    
    // Update reliability (gradual adjustment)
    const newReliability = model.reliability * 0.9 + recentSuccessRate * 0.1
    model.reliability = Math.max(0.1, Math.min(1.0, newReliability))
  }

  // Get routing statistics
  getRoutingStats() {
    const stats = {
      totalRequests: 0,
      providerStats: {},
      modelStats: {},
      taskStats: {},
      healthStatus: {}
    }

    // Count requests from performance history
    for (const [modelKey, history] of this.performanceHistory.entries()) {
      const [provider, model] = modelKey.split('/')
      
      if (!stats.providerStats[provider]) {
        stats.providerStats[provider] = { requests: 0, successRate: 0, avgLatency: 0 }
      }
      
      if (!stats.modelStats[modelKey]) {
        stats.modelStats[modelKey] = { requests: 0, successRate: 0, avgLatency: 0 }
      }

      const successCount = history.filter(h => h.success).length
      const avgLatency = history.reduce((sum, h) => sum + h.latency, 0) / history.length

      stats.providerStats[provider].requests += history.length
      stats.providerStats[provider].successRate = successCount / history.length
      stats.providerStats[provider].avgLatency = avgLatency

      stats.modelStats[modelKey].requests = history.length
      stats.modelStats[modelKey].successRate = successCount / history.length
      stats.modelStats[modelKey].avgLatency = avgLatency

      stats.totalRequests += history.length
    }

    // Health status
    for (const [providerName, provider] of Object.entries(this.providers)) {
      stats.healthStatus[providerName] = {
        status: provider.health.status,
        consecutiveFailures: provider.health.consecutiveFailures,
        avgLatency: provider.health.avgLatency,
        lastCheck: provider.health.lastCheck
      }
    }

    return stats
  }

  // Optimize routing based on historical performance
  optimizeRouting() {
    console.log('🔧 Optimizing routing based on performance data...')

    const stats = this.getRoutingStats()
    
    // Identify underperforming models
    const underperforming = []
    for (const [modelKey, modelStats] of Object.entries(stats.modelStats)) {
      if (modelStats.successRate < 0.8 || modelStats.avgLatency > 5000) {
        underperforming.push(modelKey)
      }
    }

    // Adjust model reliability scores
    for (const modelKey of underperforming) {
      const [provider, model] = modelKey.split('/')
      const modelInfo = this.providers[provider]?.models[model]
      
      if (modelInfo) {
        modelInfo.reliability *= 0.9 // Reduce reliability
        console.log(`📉 Reduced reliability for underperforming model: ${modelKey}`)
      }
    }

    return {
      optimized: true,
      underperformingModels: underperforming,
      totalModelsOptimized: underperforming.length
    }
  }
}

module.exports = IntelligentRouter
