import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Bot, 
  User, 
  FileText,
  Quote,
  Loader2
} from 'lucide-react'

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI research assistant. I can help you analyze your documents and answer questions. What would you like to know?',
      citations: []
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      citations: []
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // TODO: Implement actual API call to backend
      // Simulate API response
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: `Based on your documents, here's what I found about "${input}":\n\nThis is a simulated response. In the actual implementation, this would connect to our AI backend that processes your documents using free AI providers like OpenRouter, Groq, and HuggingFace.\n\nThe response would include:\n- Detailed analysis of your question\n- Relevant information from your uploaded documents\n- Proper citations like [1], [2] etc.\n- Links to the specific sources`,
          citations: [
            { id: 1, title: 'Research Paper.pdf', page: 3, text: 'Relevant excerpt from the document...' },
            { id: 2, title: 'YouTube: Introduction to AI', timestamp: '5:23', text: 'Relevant transcript segment...' }
          ]
        }
        setMessages(prev => [...prev, botResponse])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 rounded-t-xl">
        <h1 className="text-2xl font-bold text-gray-900">AI Research Assistant</h1>
        <p className="text-gray-600 mt-1">
          Ask questions about your uploaded documents and YouTube videos
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className="flex items-start space-x-3">
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Citations */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Quote className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Sources</span>
                      </div>
                      <div className="space-y-2">
                        {message.citations.map((citation) => (
                          <div key={citation.id} className="flex items-start space-x-2 text-sm">
                            <span className="text-primary-600 font-medium">[{citation.id}]</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-3 h-3 text-gray-400" />
                                <span className="font-medium text-gray-700">{citation.title}</span>
                                {citation.page && (
                                  <span className="text-gray-500">• Page {citation.page}</span>
                                )}
                                {citation.timestamp && (
                                  <span className="text-gray-500">• {citation.timestamp}</span>
                                )}
                              </div>
                              <p className="text-gray-600 mt-1 italic">"{citation.text}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 order-1">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                <p className="text-gray-600">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-b-xl">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
