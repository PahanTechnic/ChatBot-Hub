/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/chat/page.tsx
'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bot as BotIcon, AlertCircle, Send, Loader2 } from 'lucide-react'

// Icon mapping
const ICON_MAP: Record<string, string> = {
  'chat-dots': '💬',
  'robot': '🤖',
  'person-circle': '👤',
  'headset': '🎧',
  'question-circle': '❓',
  'info-circle': 'ℹ️',
  'lightbulb': '💡',
  'heart': '❤️',
  'star': '⭐',
  'bell': '🔔',
  'gift': '🎁',
  'rocket': '🚀',
  'shield-check': '🛡️',
  'telephone': '📞',
  'cart': '🛒',
  'book': '📚',
}

interface BotType {
  id: string
  name: string
  welcome_message: string
  widget_color: string
  widget_icon?: string
  widget_position: string
  sheet_url?: string
  is_active: boolean
  updated_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function ChatPageContent() {
  const searchParams = useSearchParams()
  const botId = searchParams.get('botId')
  const embedded = searchParams.get('embedded') === 'true'

  const [bot, setBot] = useState<BotType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadBot = async () => {
      if (!botId) {
        setError('Bot ID is required')
        setIsLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('bots')
          .select('*')
          .eq('id', botId)
          .eq('is_active', true)
          .single()

        if (fetchError || !data) {
          setError('Bot not found or inactive')
          setIsLoading(false)
          return
        }

        setBot(data)
        
        // Send bot color to parent window (for widget)
        if (embedded && window.parent) {
          window.parent.postMessage({
            type: 'BOT_COLOR_UPDATE',
            data: { color: data.widget_color || '#16a34a' }
          }, '*');
        }
        
        // Add welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: data.welcome_message,
          timestamp: new Date()
        }])
        
        setError('')
      } catch (err) {
        console.error('Error loading bot:', err)
        setError('Failed to load bot')
      } finally {
        setIsLoading(false)
      }
    }

    loadBot()
  }, [botId, embedded])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending || !botId) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsSending(true)

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          botId: botId,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Add bot response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'මට ඒ ගැන තොරතුරු නැත.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSending(false)
      // Re-focus input after sending
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600 font-medium">Loading chatbot...</p>
        </div>
      </div>
    )
  }

  if (error || !bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Bot Not Available
          </h1>
          <p className="text-gray-600 mb-6">
            The chatbot you&apos;re trying to access is not available or has been deactivated.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong><br/>
              Bot ID: {botId || 'Not provided'}<br/>
              Status: {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const iconEmoji = bot.widget_icon?.startsWith('http') 
    ? null 
    : ICON_MAP[bot.widget_icon || 'chat-dots'] || ICON_MAP['chat-dots']

  const widgetColor = bot.widget_color || '#16a34a'

  if (embedded) {
    return (
      <div className="h-screen w-full bg-white flex flex-col">
        {/* Chat Header */}
        <div 
          className="px-6 py-4 border-b flex items-center space-x-3 flex-shrink-0"
          style={{ 
            background: widgetColor.startsWith('linear-gradient') 
              ? widgetColor 
              : `linear-gradient(135deg, ${widgetColor} 0%, ${widgetColor}dd 100%)`
          }}
        >
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl">
            {bot.widget_icon?.startsWith('http') ? (
              <img src={bot.widget_icon} alt="Bot" className="w-6 h-6 object-contain" />
            ) : (
              <span>{iconEmoji}</span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white">{bot.name}</h2>
            <p className="text-xs text-white text-opacity-90">Online</p>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: widgetColor }}
                  >
                    {bot.widget_icon?.startsWith('http') ? (
                      <img src={bot.widget_icon} alt="Bot" className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="text-white">{iconEmoji}</span>
                    )}
                  </div>
                )}
                <div 
                  className={`rounded-2xl px-4 py-3 shadow-sm max-w-md ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-start space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: widgetColor }}
                >
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input - iOS Fixed */}
        <div className="border-t bg-white p-4 flex-shrink-0 safe-area-bottom">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 border-2 border-gray-200 focus-within:border-green-500 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 px-4 py-2.5 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base disabled:opacity-50"
                style={{
                  fontSize: '16px', // Prevents iOS zoom on focus
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              <button 
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isSending}
                className="w-10 h-10 rounded-full text-white font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                style={{ backgroundColor: widgetColor }}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 text-3xl shadow-lg"
              style={{ 
                background: widgetColor.startsWith('linear-gradient') 
                  ? widgetColor 
                  : widgetColor
              }}
            >
              {bot.widget_icon?.startsWith('http') ? (
                <img src={bot.widget_icon} alt="Bot" className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-white">{iconEmoji}</span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {bot.name}
            </h1>
            <p className="text-lg text-gray-600">
              Chat with our AI assistant for instant support
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
            {/* Chat Header */}
            <div 
              className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ 
                background: widgetColor.startsWith('linear-gradient') 
                  ? widgetColor 
                  : `linear-gradient(135deg, ${widgetColor} 0%, ${widgetColor}dd 100%)`
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl">
                  {bot.widget_icon?.startsWith('http') ? (
                    <img src={bot.widget_icon} alt="Bot" className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="text-white">{iconEmoji}</span>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{bot.name}</h2>
                  <p className="text-xs text-white text-opacity-90">● Online</p>
                </div>
              </div>
              <div className="text-white text-opacity-90 text-sm">
                AI Assistant
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-md"
                        style={{ backgroundColor: widgetColor }}
                      >
                        {bot.widget_icon?.startsWith('http') ? (
                          <img src={bot.widget_icon} alt="Bot" className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-white">{iconEmoji}</span>
                        )}
                      </div>
                    )}
                    <div 
                      className={`rounded-2xl px-5 py-3 shadow-sm max-w-md ${
                        msg.role === 'user'
                          ? 'bg-green-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-md"
                      style={{ backgroundColor: widgetColor }}
                    >
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input - iOS Fixed */}
            <div className="border-t bg-white p-4 flex-shrink-0 safe-area-bottom">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 border-2 border-gray-200 focus-within:border-green-500 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="flex-1 px-5 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-500 disabled:opacity-50"
                  style={{
                    fontSize: '16px', // Prevents iOS zoom on focus
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className="w-12 h-12 rounded-full text-white font-medium hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                  style={{ backgroundColor: widgetColor }}
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Powered by AI • Press Enter to send
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Last updated: {new Date(bot.updated_at).toLocaleDateString()} • 
              {bot.sheet_url ? ' Knowledge base connected' : ' No knowledge base'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}