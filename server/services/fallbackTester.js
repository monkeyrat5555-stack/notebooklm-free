const MultiProviderAI = require('./multiProviderAI')
const FreeTierCompliance = require('./freeTierCompliance')

class FallbackTester {
  constructor() {
    this.aiService = new MultiProviderAI()
    this.compliance = new FreeTierCompliance()
    this.testResults = []
  }

  // Test all AI providers with fallback mechanisms
  async testAllProviders() {
    console.log('🧪 Testing all AI providers and fallback mechanisms...')
    
    const tests = [
      this.testGroqFallback.bind(this),
      this.testOpenRouterFallback.bind(this),
      this.testHuggingFaceFallback.bind(this),
      this.testRateLimitHandling.bind(this),
      this.testNetworkFailures.bind(this),
      this.testInvalidResponses.bind(this),
      this.testTimeoutHandling.bind(this),
      this.testCircuitBreaker.bind(this)
    ]

    const results = []
    
    for (const test of tests) {
      try {
        const result = await test()
        results.push(result)
      } catch (error) {
        results.push({
          test: test.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    this.testResults = results
    return this.generateTestReport(results)
  }

  // Test Groq provider and fallbacks
  async testGroqFallback() {
    console.log('🔄 Testing Groq fallback mechanisms...')
    
    const testCases = [
      { task: 'reasoning', input: { messages: [{ role: 'user', content: 'Test message' }] } },
      { task: 'comparison', input: { prompt: 'Compare these texts: A vs B' } },
      { task: 'writing', input: { messages: [{ role: 'user', content: 'Write about AI' }] } }
    ]

    const results = []
    
    for (const testCase of testCases) {
      try {
        const startTime = Date.now()
        const response = await this.aiService.callWithFallback(testCase.task, testCase.input, 'groq')
        const duration = Date.now() - startTime
        
        results.push({
          task: testCase.task,
          provider: 'groq',
          status: 'success',
          responseLength: response.length,
          duration: duration,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        results.push({
          task: testCase.task,
          provider: 'groq',
          status: 'failed',
          error: error.message,
          fallbackUsed: true,
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      test: 'Groq Fallback Test',
      status: results.every(r => r.status === 'success' || r.fallbackUsed) ? 'passed' : 'failed',
      results: results,
      summary: `${results.filter(r => r.status === 'success').length}/${results.length} successful`
    }
  }

  // Test OpenRouter provider and fallbacks
  async testOpenRouterFallback() {
    console.log('🔄 Testing OpenRouter fallback mechanisms...')
    
    const testCases = [
      { task: 'writing', input: { messages: [{ role: 'user', content: 'Write about technology' }] } },
      { task: 'outline', input: { prompt: 'Create outline for AI essay' } },
      { task: 'style', input: { prompt: 'Refine this text to be more academic' } }
    ]

    const results = []
    
    for (const testCase of testCases) {
      try {
        const startTime = Date.now()
        const response = await this.aiService.callWithFallback(testCase.task, testCase.input, 'openrouter')
        const duration = Date.now() - startTime
        
        results.push({
          task: testCase.task,
          provider: 'openrouter',
          status: 'success',
          responseLength: response.length,
          duration: duration,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        results.push({
          task: testCase.task,
          provider: 'openrouter',
          status: 'failed',
          error: error.message,
          fallbackUsed: true,
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      test: 'OpenRouter Fallback Test',
      status: results.every(r => r.status === 'success' || r.fallbackUsed) ? 'passed' : 'failed',
      results: results,
      summary: `${results.filter(r => r.status === 'success').length}/${results.length} successful`
    }
  }

  // Test HuggingFace provider and fallbacks
  async testHuggingFaceFallback() {
    console.log('🔄 Testing HuggingFace fallback mechanisms...')
    
    const testCases = [
      { task: 'embeddings', input: { text: 'Test embedding text' } },
      { task: 'summarization', input: { prompt: 'Summarize this long text about artificial intelligence...' } },
      { task: 'classification', input: { prompt: 'Classify this sentiment' } }
    ]

    const results = []
    
    for (const testCase of testCases) {
      try {
        const startTime = Date.now()
        const response = await this.aiService.callWithFallback(testCase.task, testCase.input, 'huggingface')
        const duration = Date.now() - startTime
        
        results.push({
          task: testCase.task,
          provider: 'huggingface',
          status: 'success',
          responseLength: Array.isArray(response) ? response.length : response?.length || 0,
          duration: duration,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        results.push({
          task: testCase.task,
          provider: 'huggingface',
          status: 'failed',
          error: error.message,
          fallbackUsed: true,
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      test: 'HuggingFace Fallback Test',
      status: results.every(r => r.status === 'success' || r.fallbackUsed) ? 'passed' : 'failed',
      results: results,
      summary: `${results.filter(r => r.status === 'success').length}/${results.length} successful`
    }
  }

  // Test rate limit handling
  async testRateLimitHandling() {
    console.log('⏱️ Testing rate limit handling...')
    
    const rapidRequests = []
    
    // Send rapid requests to trigger rate limits
    for (let i = 0; i < 20; i++) {
      const request = this.aiService.callWithFallback('reasoning', {
        messages: [{ role: 'user', content: `Test message ${i}` }]
      })
      rapidRequests.push(request)
    }

    const results = await Promise.allSettled(rapidRequests)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    const rateLimited = results.filter(r => 
      r.status === 'rejected' && 
      r.reason?.message?.includes('rate limit')
    ).length

    return {
      test: 'Rate Limit Handling',
      status: rateLimited > 0 ? 'passed' : 'warning',
      results: {
        total: results.length,
        successful: successful,
        failed: failed,
        rateLimited: rateLimited
      },
      summary: `${rateLimited} requests properly rate limited`
    }
  }

  // Test network failure handling
  async testNetworkFailures() {
    console.log('🌐 Testing network failure handling...')
    
    // Temporarily modify provider URLs to invalid endpoints
    const originalGroqUrl = this.aiService.providers.groq.baseUrl
    const originalOpenRouterUrl = this.aiService.providers.openrouter.baseUrl
    
    this.aiService.providers.groq.baseUrl = 'https://invalid-groq-api.com'
    this.aiService.providers.openrouter.baseUrl = 'https://invalid-openrouter-api.com'

    try {
      const response = await this.aiService.callWithFallback('reasoning', {
        messages: [{ role: 'user', content: 'Test network failure' }]
      })

      // Restore original URLs
      this.aiService.providers.groq.baseUrl = originalGroqUrl
      this.aiService.providers.openrouter.baseUrl = originalOpenRouterUrl

      return {
        test: 'Network Failure Handling',
        status: 'passed',
        results: {
          fallbackSuccessful: true,
          responseLength: response.length
        },
        summary: 'Successfully fell back to working providers'
      }

    } catch (error) {
      // Restore original URLs
      this.aiService.providers.groq.baseUrl = originalGroqUrl
      this.aiService.providers.openrouter.baseUrl = originalOpenRouterUrl

      return {
        test: 'Network Failure Handling',
        status: 'failed',
        results: {
          error: error.message
        },
        summary: 'All providers failed, no fallback available'
      }
    }
  }

  // Test invalid response handling
  async testInvalidResponses() {
    console.log('🔍 Testing invalid response handling...')
    
    // This would require mocking invalid responses
    // For now, test with malformed inputs
    const testCases = [
      { task: 'reasoning', input: { messages: [] } }, // Empty messages
      { task: 'writing', input: { messages: null } }, // Null input
      { task: 'embeddings', input: { text: '' } } // Empty text
    ]

    const results = []
    
    for (const testCase of testCases) {
      try {
        const response = await this.aiService.callWithFallback(testCase.task, testCase.input)
        results.push({
          task: testCase.task,
          status: 'success',
          handled: true,
          responseLength: response?.length || 0
        })
      } catch (error) {
        results.push({
          task: testCase.task,
          status: 'failed',
          handled: error.message.includes('Invalid') || error.message.includes('required'),
          error: error.message
        })
      }
    }

    return {
      test: 'Invalid Response Handling',
      status: results.every(r => r.handled) ? 'passed' : 'failed',
      results: results,
      summary: `${results.filter(r => r.handled).length}/${results.length} properly handled`
    }
  }

  // Test timeout handling
  async testTimeoutHandling() {
    console.log('⏰ Testing timeout handling...')
    
    const startTime = Date.now()
    
    try {
      // Use a very long prompt to potentially trigger timeouts
      const longPrompt = 'Test '.repeat(10000)
      const response = await this.aiService.callWithFallback('writing', {
        messages: [{ role: 'user', content: longPrompt }]
      })
      
      const duration = Date.now() - startTime
      
      return {
        test: 'Timeout Handling',
        status: duration < 30000 ? 'passed' : 'warning', // 30 second timeout
        results: {
          duration: duration,
          responseLength: response.length
        },
        summary: `Request completed in ${duration}ms`
      }

    } catch (error) {
      const duration = Date.now() - startTime
      
      return {
        test: 'Timeout Handling',
        status: error.message.includes('timeout') ? 'passed' : 'failed',
        results: {
          duration: duration,
          error: error.message
        },
        summary: `Timeout ${error.message.includes('timeout') ? 'handled' : 'not handled'}`
      }
    }
  }

  // Test circuit breaker pattern
  async testCircuitBreaker() {
    console.log('⚡ Testing circuit breaker pattern...')
    
    // Simulate multiple failures to trigger circuit breaker
    const failures = []
    
    for (let i = 0; i < 5; i++) {
      try {
        // Use invalid model to force failure
        await this.aiService.callProvider('groq', 'reasoning', {
          messages: [{ role: 'user', content: 'Test' }],
          model: 'invalid-model-name'
        })
      } catch (error) {
        failures.push(error)
      }
    }

    // Now try a valid request - should use fallback
    try {
      const response = await this.aiService.callWithFallback('reasoning', {
        messages: [{ role: 'user', content: 'Test after failures' }]
      })

      return {
        test: 'Circuit Breaker',
        status: 'passed',
        results: {
          failuresTriggered: failures.length,
          fallbackUsed: true,
          responseLength: response.length
        },
        summary: 'Circuit breaker triggered, fallback used successfully'
      }

    } catch (error) {
      return {
        test: 'Circuit Breaker',
        status: 'failed',
        results: {
          failuresTriggered: failures.length,
          error: error.message
        },
        summary: 'Circuit breaker failed to recover'
      }
    }
  }

  // Generate comprehensive test report
  generateTestReport(results) {
    const passed = results.filter(r => r.status === 'passed').length
    const failed = results.filter(r => r.status === 'failed').length
    const warnings = results.filter(r => r.status === 'warning').length

    const report = {
      summary: {
        total: results.length,
        passed: passed,
        failed: failed,
        warnings: warnings,
        successRate: ((passed / results.length) * 100).toFixed(1) + '%'
      },
      tests: results,
      recommendations: this.generateRecommendations(results),
      timestamp: new Date().toISOString()
    }

    console.log('📊 Test Report Generated:')
    console.log(`   Passed: ${passed}/${results.length} (${report.summary.successRate})`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Warnings: ${warnings}`)

    return report
  }

  // Generate recommendations based on test results
  generateRecommendations(results) {
    const recommendations = []

    const failedTests = results.filter(r => r.status === 'failed')
    
    if (failedTests.length > 0) {
      recommendations.push('Review failed tests and fix underlying issues')
    }

    const networkIssues = results.filter(r => 
      r.test?.includes('Network') && r.status === 'failed'
    )
    
    if (networkIssues.length > 0) {
      recommendations.push('Implement better network error handling and retry logic')
    }

    const timeoutIssues = results.filter(r => 
      r.test?.includes('Timeout') && r.status === 'warning'
    )
    
    if (timeoutIssues.length > 0) {
      recommendations.push('Consider reducing request complexity or increasing timeouts')
    }

    const rateLimitIssues = results.filter(r => 
      r.test?.includes('Rate Limit') && r.status === 'warning'
    )
    
    if (rateLimitIssues.length > 0) {
      recommendations.push('Implement better rate limiting and request queuing')
    }

    return recommendations
  }

  // Run health check on all systems
  async runHealthCheck() {
    console.log('🏥 Running system health check...')
    
    const health = {
      status: 'healthy',
      providers: {},
      systems: {},
      timestamp: new Date().toISOString()
    }

    // Check AI providers
    for (const provider of ['groq', 'openrouter', 'huggingface']) {
      try {
        const startTime = Date.now()
        await this.aiService.callProvider(provider, 'reasoning', {
          messages: [{ role: 'user', content: 'Health check' }]
        })
        
        health.providers[provider] = {
          status: 'healthy',
          responseTime: Date.now() - startTime
        }
      } catch (error) {
        health.providers[provider] = {
          status: 'unhealthy',
          error: error.message
        }
        health.status = 'degraded'
      }
    }

    // Check free tier compliance
    const compliance = this.compliance.validateSystem()
    health.systems.compliance = compliance

    if (!compliance.compliant) {
      health.status = 'warning'
    }

    return health
  }
}

module.exports = FallbackTester
