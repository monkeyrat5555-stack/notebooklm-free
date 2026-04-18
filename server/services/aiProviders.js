class AIProviders {
  constructor() {
    this.providers = {
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: 'https://openrouter.ai/api/v1',
        models: {
          planner: 'microsoft/wizardlm-2-8x22b',
          writer: 'meta-llama/llama-3-70b-instruct',
          editor: 'anthropic/claude-3-haiku'
        }
      },
      groq: {
        apiKey: process.env.GROQ_API_KEY,
        baseUrl: 'https://api.groq.com/openai/v1',
        models: {
          researcher: 'llama3-70b-8192',
          fast: 'mixtral-8x7b-32768'
        }
      },
      huggingface: {
        apiKey: process.env.HUGGINGFACE_API_KEY,
        baseUrl: 'https://api-inference.huggingface.co/models',
        models: {
          embeddings: 'sentence-transformers/all-MiniLM-L6-v2',
          citation: 'microsoft/DialoGPT-medium'
        }
      }
    }
  }

  async callOpenRouter(model, messages, temperature = 0.7) {
    try {
      const response = await fetch(`${this.providers.openrouter.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.openrouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://notebooklm-free.com',
          'X-Title': 'NotebookLM Free'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: 4000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw error
    }
  }

  async callGroq(model, messages, temperature = 0.5) {
    try {
      const response = await fetch(`${this.providers.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: 4000
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Groq API error:', error)
      throw error
    }
  }

  async callHuggingFace(model, inputs) {
    try {
      const response = await fetch(`${this.providers.huggingface.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.huggingface.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: inputs
        })
      })

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('HuggingFace API error:', error)
      throw error
    }
  }

  async createEmbedding(text) {
    try {
      const response = await fetch(`${this.providers.huggingface.baseUrl}/${this.providers.huggingface.models.embeddings}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.huggingface.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text
        })
      })

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`)
      }

      const data = await response.json()
      return data[0].embedding
    } catch (error) {
      console.error('Embedding API error:', error)
      throw error
    }
  }
}

module.exports = AIProviders
