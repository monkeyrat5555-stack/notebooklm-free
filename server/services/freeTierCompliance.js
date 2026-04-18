class FreeTierCompliance {
  constructor() {
    this.limits = {
      // Vercel Serverless Functions
      vercel: {
        functionDuration: 30, // seconds
        invocationsPerMonth: 100000,
        bandwidthGB: 100,
        memoryMB: 1024
      },
      
      // Groq Free Tier
      groq: {
        requestsPerSecond: 14,
        requestsPerMinute: 840,
        tokensPerMinute: 21000,
        dailyTokens: 150000
      },
      
      // OpenRouter Free Tier
      openrouter: {
        requestsPerMinute: 100,
        tokensPerMonth: 100000,
        models: ['meta-llama/llama-3-70b-instruct', 'microsoft/wizardlm-2-8x22b']
      },
      
      // HuggingFace Free Tier
      huggingface: {
        requestsPerMinute: 30,
        inferenceRequestsPerMonth: 30000,
        models: ['sentence-transformers/all-MiniLM-L6-v2', 'facebook/bart-large-cnn']
      },
      
      // Pinecone Free Tier
      pinecone: {
        vectors: 1000000,
        queriesPerMonth: 2000,
        pods: 1,
        memoryGB: 1
      }
    }

    this.usage = {
      groq: { requests: 0, tokens: 0, lastReset: Date.now() },
      openrouter: { requests: 0, tokens: 0, lastReset: Date.now() },
      huggingface: { requests: 0, lastReset: Date.now() },
      pinecone: { queries: 0, vectors: 0, lastReset: Date.now() }
    }
  }

  // Check if operation is within free tier limits
  checkLimits(provider, operation, cost = 1) {
    const now = Date.now()
    const limit = this.limits[provider]
    const usage = this.usage[provider]

    if (!limit || !usage) {
      return { allowed: true, reason: 'Provider not tracked' }
    }

    // Reset counters if needed (monthly/daily)
    this.resetCountersIfNeeded(provider, now)

    switch (operation) {
      case 'request':
        return this.checkRequestLimit(provider, limit, usage)
      case 'tokens':
        return this.checkTokenLimit(provider, limit, usage, cost)
      case 'vectors':
        return this.checkVectorLimit(provider, limit, usage, cost)
      case 'queries':
        return this.checkQueryLimit(provider, limit, usage, cost)
      case 'duration':
        return this.checkDurationLimit(provider, limit, cost)
      default:
        return { allowed: true, reason: 'Operation not tracked' }
    }
  }

  checkRequestLimit(provider, limit, usage) {
    const requestsThisMinute = usage.requestsPerMinute || 0
    const requestsThisSecond = usage.requestsPerSecond || 0

    if (provider === 'groq') {
      if (requestsThisSecond >= limit.requestsPerSecond) {
        return { 
          allowed: false, 
          reason: `Groq rate limit: ${requestsThisSecond}/${limit.requestsPerSecond} requests/sec`,
          retryAfter: 1000 // 1 second
        }
      }
    }

    if (requestsThisMinute >= limit.requestsPerMinute) {
      return { 
        allowed: false, 
        reason: `${provider} rate limit: ${requestsThisMinute}/${limit.requestsPerMinute} requests/min`,
        retryAfter: 60000 // 1 minute
      }
    }

    return { allowed: true }
  }

  checkTokenLimit(provider, limit, usage, tokens) {
    const newTotal = (usage.tokens || 0) + tokens

    if (provider === 'groq' && newTotal > limit.dailyTokens) {
      return { 
        allowed: false, 
        reason: `Groq daily token limit: ${newTotal}/${limit.dailyTokens}`,
        retryAfter: 86400000 // 24 hours
      }
    }

    if (provider === 'openrouter' && newTotal > limit.tokensPerMonth) {
      return { 
        allowed: false, 
        reason: `OpenRouter monthly token limit: ${newTotal}/${limit.tokensPerMonth}`,
        retryAfter: 2592000000 // 30 days
      }
    }

    return { allowed: true }
  }

  checkVectorLimit(provider, limit, usage, vectors) {
    const newTotal = (usage.vectors || 0) + vectors

    if (newTotal > limit.vectors) {
      return { 
        allowed: false, 
        reason: `Pinecone vector limit: ${newTotal}/${limit.vectors}`,
        retryAfter: 2592000000 // 30 days
      }
    }

    return { allowed: true }
  }

  checkQueryLimit(provider, limit, usage, queries) {
    const newTotal = (usage.queries || 0) + queries

    if (newTotal > limit.queriesPerMonth) {
      return { 
        allowed: false, 
        reason: `Pinecone query limit: ${newTotal}/${limit.queriesPerMonth}`,
        retryAfter: 2592000000 // 30 days
      }
    }

    return { allowed: true }
  }

  checkDurationLimit(provider, limit, duration) {
    if (duration > limit.functionDuration) {
      return { 
        allowed: false, 
        reason: `Function duration limit: ${duration}/${limit.functionDuration} seconds`,
        retryAfter: null
      }
    }

    return { allowed: true }
  }

  resetCountersIfNeeded(provider, now) {
    const usage = this.usage[provider]
    if (!usage) return

    // Reset monthly counters
    if (now - usage.lastReset > 30 * 24 * 60 * 60 * 1000) {
      usage.requests = 0
      usage.tokens = 0
      usage.queries = 0
      usage.vectors = 0
      usage.lastReset = now
    }

    // Reset daily counters for Groq
    if (provider === 'groq' && now - (usage.lastDailyReset || usage.lastReset) > 24 * 60 * 60 * 1000) {
      usage.dailyTokens = 0
      usage.lastDailyReset = now
    }

    // Reset per-minute counters
    if (now - (usage.lastMinuteReset || usage.lastReset) > 60 * 1000) {
      usage.requestsPerMinute = 0
      usage.lastMinuteReset = now
    }

    // Reset per-second counters for Groq
    if (provider === 'groq' && now - (usage.lastSecondReset || usage.lastReset) > 1000) {
      usage.requestsPerSecond = 0
      usage.lastSecondReset = now
    }
  }

  // Record usage
  recordUsage(provider, operation, amount = 1) {
    const usage = this.usage[provider]
    if (!usage) return

    const now = Date.now()

    switch (operation) {
      case 'request':
        usage.requests = (usage.requests || 0) + 1
        usage.requestsPerMinute = (usage.requestsPerMinute || 0) + 1
        if (provider === 'groq') {
          usage.requestsPerSecond = (usage.requestsPerSecond || 0) + 1
        }
        break
      case 'tokens':
        usage.tokens = (usage.tokens || 0) + amount
        if (provider === 'groq') {
          usage.dailyTokens = (usage.dailyTokens || 0) + amount
        }
        break
      case 'vectors':
        usage.vectors = (usage.vectors || 0) + amount
        break
      case 'queries':
        usage.queries = (usage.queries || 0) + amount
        break
    }

    console.log(`📊 Usage recorded: ${provider} ${operation} +${amount}`)
  }

  // Get current usage statistics
  getUsageStats() {
    const stats = {}
    
    for (const [provider, usage] of Object.entries(this.usage)) {
      const limit = this.limits[provider]
      if (!limit) continue

      stats[provider] = {
        requests: {
          used: usage.requests || 0,
          limit: limit.requestsPerMonth || 'N/A',
          percentage: limit.requestsPerMonth ? 
            ((usage.requests || 0) / limit.requestsPerMonth * 100).toFixed(1) : 'N/A'
        },
        tokens: {
          used: usage.tokens || 0,
          limit: limit.tokensPerMonth || limit.dailyTokens || 'N/A',
          percentage: limit.tokensPerMonth ? 
            ((usage.tokens || 0) / limit.tokensPerMonth * 100).toFixed(1) : 
            limit.dailyTokens ? 
            ((usage.dailyTokens || 0) / limit.dailyTokens * 100).toFixed(1) : 'N/A'
        }
      }

      if (usage.vectors !== undefined) {
        stats[provider].vectors = {
          used: usage.vectors || 0,
          limit: limit.vectors,
          percentage: ((usage.vectors || 0) / limit.vectors * 100).toFixed(1)
        }
      }

      if (usage.queries !== undefined) {
        stats[provider].queries = {
          used: usage.queries || 0,
          limit: limit.queriesPerMonth,
          percentage: ((usage.queries || 0) / limit.queriesPerMonth * 100).toFixed(1)
        }
      }
    }

    return stats
  }

  // Optimize operations to stay within limits
  optimizeForFreeTier(operation) {
    const optimizations = {
      // Use smaller models for free tier
      modelSelection: {
        groq: 'llama3-8b-8192', // Instead of 70b
        openrouter: 'meta-llama/llama-3-8b-instruct', // Instead of 70b
        huggingface: 'sentence-transformers/all-MiniLM-L6-v2' // Free model
      },

      // Reduce context windows
      contextWindow: {
        maxTokens: 2000, // Instead of 4000
        maxChunks: 5, // Instead of 10
        maxDocuments: 3 // Instead of 10
      },

      // Caching strategy
      caching: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxSize: 100 // items
      },

      // Rate limiting
      rateLimiting: {
        enabled: true,
        requestsPerSecond: 10, // Conservative
        requestsPerMinute: 50, // Conservative
        burstLimit: 5
      }
    }

    return optimizations[operation] || {}
  }

  // Get recommendations for staying within limits
  getRecommendations() {
    const stats = this.getUsageStats()
    const recommendations = []

    for (const [provider, stat] of Object.entries(stats)) {
      if (stat.requests && parseFloat(stat.requests.percentage) > 80) {
        recommendations.push(`${provider}: Request usage high (${stat.requests.percentage}%), consider caching`)
      }

      if (stat.tokens && parseFloat(stat.tokens.percentage) > 80) {
        recommendations.push(`${provider}: Token usage high (${stat.tokens.percentage}%), use smaller models`)
      }

      if (stat.vectors && parseFloat(stat.vectors.percentage) > 80) {
        recommendations.push(`${provider}: Vector storage high (${stat.vectors.percentage}%), clean up old data`)
      }
    }

    return recommendations
  }

  // Validate entire system for free tier compliance
  validateSystem() {
    const validation = {
      compliant: true,
      issues: [],
      warnings: [],
      recommendations: []
    }

    // Check all providers
    for (const provider of Object.keys(this.limits)) {
      const usage = this.usage[provider]
      const limit = this.limits[provider]

      if (!usage) continue

      // Check if any limits are exceeded
      if (usage.requests > limit.requestsPerMonth) {
        validation.compliant = false
        validation.issues.push(`${provider}: Monthly request limit exceeded`)
      }

      if (usage.tokens > (limit.tokensPerMonth || limit.dailyTokens)) {
        validation.compliant = false
        validation.issues.push(`${provider}: Token limit exceeded`)
      }

      // Check for high usage warnings
      if (usage.requests > limit.requestsPerMonth * 0.8) {
        validation.warnings.push(`${provider}: Request usage above 80%`)
      }
    }

    validation.recommendations = this.getRecommendations()

    return validation
  }
}

module.exports = FreeTierCompliance
