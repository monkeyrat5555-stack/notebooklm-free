const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }

  // Documents API
  async uploadDocument(file) {
    const formData = new FormData()
    formData.append('pdf', file)

    return this.request('/documents/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    })
  }

  async getDocuments() {
    return this.request('/documents')
  }

  async getDocument(id) {
    return this.request(`/documents/${id}`)
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    })
  }

  async addYouTubeVideo(url, title, transcript) {
    return this.request('/documents/youtube', {
      method: 'POST',
      body: JSON.stringify({ url, title, transcript }),
    })
  }

  // YouTube API
  async validateYouTubeUrl(url) {
    return this.request('/youtube/validate', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  }

  async processYouTubeVideo(url) {
    return this.request('/youtube/process', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  }

  async getYouTubeTranscript(videoId) {
    return this.request(`/youtube/transcript/${videoId}`)
  }

  // Chat API
  async sendMessage(message, conversationId = null) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    })
  }

  async getChatHistory() {
    return this.request('/chat/history')
  }

  async getConversation(conversationId) {
    return this.request(`/chat/conversation/${conversationId}`)
  }

  async clearChatHistory() {
    return this.request('/chat/history', {
      method: 'DELETE',
    })
  }

  // Embeddings API
  async createEmbeddings(documentId, content, title, type) {
    return this.request('/embeddings/create', {
      method: 'POST',
      body: JSON.stringify({ documentId, content, title, type }),
    })
  }

  async searchEmbeddings(query, topK = 5) {
    return this.request('/embeddings/search', {
      method: 'POST',
      body: JSON.stringify({ query, topK }),
    })
  }

  async deleteDocumentEmbeddings(documentId) {
    return this.request(`/embeddings/${documentId}`, {
      method: 'DELETE',
    })
  }

  async getEmbeddingStats() {
    return this.request('/embeddings/stats')
  }
}

export default new ApiService()
