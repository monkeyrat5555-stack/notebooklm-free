import { useState } from 'react'
import { Send, MessageSquare, User, Bot, Trash2 } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('https://notebooklm-free-2026-test69.vercel.app/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId: 'default'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response.content,
          timestamp: new Date().toISOString(),
          sources: data.sources || []
        }

        setMessages(prev => [...prev, botMessage])
      } else {
        const errorMessage = data.error || 'Failed to process your message'
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
          timestamp: new Date().toISOString(),
          sources: []
        }

        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Network Error:', error)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered a network error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
        sources: []
      }

      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">AI Chat</h1>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50">
            <div className="h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-700">Start a conversation</p>
                    <p className="text-sm text-slate-500">
                      Upload your documents and ask questions about them. The AI will analyze your content and provide detailed responses with citations.
                    </p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      } mb-4`}
                    >
                      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-100 text-slate-800'
                      } rounded-2xl px-4 py-3`}
                      >
                        {message.type === 'user' ? (
                          <User className="w-6 h-6 text-blue-100" />
                        ) : (
                          <Bot className="w-6 h-6 text-slate-300" />
                        )}
                        <div>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {messages.some(m => m.type === 'bot' && m.sources && m.sources.length > 0) && (
                <div className="border-t border-slate-200/50 p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Sources</h3>
                  <div className="space-y-2">
                    {messages
                      .filter(m => m.type === 'bot')
                      .slice(-1)[0]?.sources?.map((source, index) => (
                        <div key={index} className="text-xs text-slate-600 bg-slate-50 rounded p-2">
                          <p className="font-medium">[{index + 1}] {source.title}</p>
                          <p className="text-slate-500">
                            {source.type === 'pdf' 
                              ? `Page ${source.page}` 
                              : `${source.timestamp}`
                            }
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200/50 p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your documents..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
