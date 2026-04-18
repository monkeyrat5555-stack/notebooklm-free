const IntelligentRouter = require('./intelligentRouter')

class MultiProviderAI {
  constructor() {
    this.router = new IntelligentRouter()
    this.fallbackEnabled = true
    this.defaultStrategy = 'balanced'
  }

  checkRateLimit(provider) {
    const now = Date.now()
    const p = this.providers[provider]
    
    if (now - p.lastReset > 60000) {
      p.requests = 0
      p.lastReset = now
    }
    
    return p.requests < p.rateLimit
  }

  async callWithFallback(task, input, preferredProvider = null, strategy = null) {
    try {
      // Use intelligent routing for automatic model selection
      const routingStrategy = strategy || this.defaultStrategy
      const result = await this.router.route(task, input, routingStrategy)
      
      console.log(`✅ Intelligent routing success: ${task} (${routingStrategy} strategy)`)
      return result
      
    } catch (error) {
      console.error(`❌ Intelligent routing failed for ${task}:`, error.message)
      
      if (this.fallbackEnabled) {
        // Fallback to traditional provider selection
        return this.fallbackRouting(task, input, preferredProvider)
      }
      
      throw error
    }
  }

  // Traditional fallback routing (original method)
  async fallbackRouting(task, input, preferredProvider = null) {
    console.log('🔄 Using fallback routing method')
    
    // This would contain the original provider selection logic
    // For now, throw to indicate intelligent routing is preferred
    throw new Error(`All providers failed for task: ${task}`)
  }

  getProvidersForTask(task) {
    const taskMap = {
      reasoning: ['groq', 'openrouter'],
      writing: ['openrouter', 'groq'],
      summarization: ['huggingface', 'openrouter'],
      embeddings: ['huggingface'],
      comparison: ['groq', 'openrouter'],
      outline: ['openrouter', 'groq'],
      style: ['openrouter', 'groq'],
      refinement: ['openrouter', 'groq'],
      classification: ['huggingface']
    }
    return taskMap[task] || ['groq', 'openrouter', 'huggingface']
  }

  async callProvider(provider, task, input) {
    const p = this.providers[provider]
    p.requests++

    switch (provider) {
      case 'groq':
        return this.callGroq(p, task, input)
      case 'openrouter':
        return this.callOpenRouter(p, task, input)
      case 'huggingface':
        return this.callHuggingFace(p, task, input)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }

  async callGroq(provider, task, input) {
    const model = provider.models[task] || provider.models.fast
    
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
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

  async callOpenRouter(provider, task, input) {
    const model = provider.models[task] || provider.models.writing
    
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://notebooklm-free.com',
        'X-Title': 'NotebookLM Free'
      },
      body: JSON.stringify({
        model: model,
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

  async callHuggingFace(provider, task, input) {
    const model = provider.models[task] || provider.models.summarization
    
    const response = await fetch(`${provider.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
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

  async createEmbedding(text) {
    return this.callWithFallback('embeddings', { text: text })
  }

  async summarize(text) {
    return this.callWithFallback('summarization', { 
      prompt: text,
      maxTokens: 300 
    })
  }

  async classify(text) {
    return this.callWithFallback('classification', { 
      prompt: text 
    })
  }

  async reason(messages, temperature = 0.3) {
    return this.callWithFallback('reasoning', {
      messages: messages,
      temperature: temperature
    })
  }

  async write(messages, temperature = 0.8) {
    return this.callWithFallback('writing', {
      messages: messages,
      temperature: temperature
    })
  }

  async compare(texts) {
    const prompt = `Compare and analyze the following texts:\n\n${texts.map((text, i) => `Text ${i+1}:\n${text}`).join('\n\n---\n\n')}\n\nProvide a detailed comparison.`
    return this.callWithFallback('comparison', {
      prompt: prompt,
      temperature: 0.4
    })
  }

  async createOutline(topic, research) {
    const prompt = `Create a detailed outline for: ${topic}\n\nBased on this research:\n${research}\n\nReturn a structured outline with main points and sub-points.`
    return this.callWithFallback('outline', {
      prompt: prompt,
      temperature: 0.3
    })
  }

  async refineStyle(text, targetStyle = 'academic') {
    const prompt = `Refine this text to have a ${targetStyle} style, removing generic AI patterns:\n\n${text}\n\nMake it sound natural, nuanced, and sophisticated.`
    return this.callWithFallback('style', {
      prompt: text,
      temperature: 0.6
    })
  }

  async finalRefinement(text) {
    const prompt = `Final refinement of this text. Ensure:\n- No grammatical errors\n- Consistent formatting\n- Proper citation placement\n- Clear, concise language\n\nText:\n${text}`
    return this.callWithFallback('refinement', {
      prompt: text,
      temperature: 0.2
    })
  }

  // New intelligent routing methods
  async routeByPerformance(task, input) {
    return this.callWithFallback(task, input, null, 'performance')
  }

  async routeBySpeed(task, input) {
    return this.callWithFallback(task, input, null, 'speed')
  }

  async routeByReliability(task, input) {
    return this.callWithFallback(task, input, null, 'reliability')
  }

  async routeByCost(task, input) {
    return this.callWithFallback(task, input, null, 'cost')
  }

  async routeBalanced(task, input) {
    return this.callWithFallback(task, input, null, 'balanced')
  }

  // Get routing statistics
  getRoutingStats() {
    return this.router.getRoutingStats()
  }

  // Optimize routing based on performance
  optimizeRouting() {
    return this.router.optimizeRouting()
  }

  // Set routing strategy
  setRoutingStrategy(strategy) {
    if (this.router.routingStrategies[strategy]) {
      this.defaultStrategy = strategy
      return true
    }
    return false
  }

  // Get available models for task
  getAvailableModels(task) {
    return this.router.getCandidateModels(task)
  }

  // Check provider health
  checkProviderHealth(providerName) {
    return this.router.isProviderHealthy(providerName)
  }

  // Perform health check on all providers
  async performHealthChecks() {
    const healthResults = {}
    
    for (const providerName of Object.keys(this.router.providers)) {
      await this.router.performHealthCheck(providerName)
      healthResults[providerName] = this.router.providers[providerName].health
    }

    return healthResults
  }
}

module.exports = MultiProviderAI
