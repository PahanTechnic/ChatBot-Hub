/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/messages/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Bot as BotIcon,
  Clock,
  Filter,
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  User as UserIcon
} from 'lucide-react'



interface Message {
  id: string
  bot_id: string
  role: string
  content: string
  session_id?: string
  sources?: any
  created_at: string
}

interface Bot {
  id: string
  name: string
  widget_color: string
}

interface MessageWithBot extends Message {
  bot: Bot
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageWithBot[]>([])
  const [bots, setBots] = useState<Bot[]>([])
  const [selectedBot, setSelectedBot] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signin')
        return
      }

      setUser(user)

      // Load user's bots
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('id, name, widget_color')
        .eq('user_id', user.id)
        .order('name')

      if (botsError) throw botsError
      
      const botsList = botsData || []
      setBots(botsList)

      if (botsList.length === 0) {
        setIsLoading(false)
        return
      }

      // Load messages with bot info
      const botIds = botsList.map(bot => bot.id)
      
      let messagesQuery = supabase
        .from('messages')
        .select('*')
        .in('bot_id', botIds)
        .order('created_at', { ascending: false })
        .limit(50)

      if (selectedBot) {
        messagesQuery = messagesQuery.eq('bot_id', selectedBot)
      }

      const { data: messagesData, error: messagesError } = await messagesQuery

      if (messagesError) throw messagesError

      // Combine messages with bot data
      const messagesWithBots = (messagesData || []).map(msg => ({
        ...msg,
        bot: botsList.find(bot => bot.id === msg.bot_id) || botsList[0]
      }))

      setMessages(messagesWithBots)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData, selectedBot])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="fixed inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
          <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-green-500/20 blur-[150px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[150px]"></div>
        </div>
        <RefreshCw className="w-8 h-8 text-green-400 animate-spin relative z-10" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-green-500/20 blur-[150px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-green-900/10 blur-[200px]"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-white/60 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <BotIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 font-medium">ChatBot AI</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Messages</h1>
            <p className="text-white/40 mt-2">View all conversations across your chatbots</p>
          </div>

          {/* Filter */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-green-400" />
                <label className="text-sm font-medium text-white/60">Filter by Bot:</label>
              </div>
              <div className="relative flex-1 max-w-sm">
                <select
                  value={selectedBot}
                  onChange={(e) => setSelectedBot(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-green-500/50 transition-colors"
                >
                  <option value="" className="bg-gray-900">All Bots</option>
                  {bots.map((bot) => (
                    <option key={bot.id} value={bot.id} className="bg-gray-900">
                      {bot.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              </div>
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium">
                {messages.length} messages
              </div>
            </div>
          </div>

          {/* Messages */}
          {messages.length === 0 ? (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <MessageSquare className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No messages yet</h3>
              <p className="text-white/50 max-w-md mx-auto">
                Messages will appear here when users interact with your chatbots
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl hover:border-green-500/20 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        message.role === 'user'
                          ? 'bg-blue-500/10 border-blue-500/20'
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        {message.role === 'user' ? (
                          <UserIcon className="w-5 h-5 text-blue-400" />
                        ) : (
                          <BotIcon className="w-5 h-5 text-green-400" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        {/* Message Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                            message.role === 'user'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}>
                            {message.role === 'user' ? 'User' : 'Bot'}
                          </span>
                          
                          <div className="flex items-center space-x-2 px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: message.bot.widget_color || '#16a34a' }}
                            />
                            <span className="text-sm font-medium text-white/60">
                              {message.bot.name}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-white/40">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>

                        {/* Message Text */}
                        <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>

                        {/* Sources */}
                        {message.sources && Array.isArray(message.sources) && message.sources.length > 0 && (
                          <div className="mt-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                            <div className="text-xs font-medium text-green-400 mb-1">
                              Sources used:
                            </div>
                            <div className="text-sm text-green-300/70">
                              {message.sources.length} knowledge base entries referenced
                            </div>
                          </div>
                        )}

                        {/* Session ID */}
                        {message.session_id && (
                          <div className="mt-3 text-xs text-white/40 font-mono bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-lg inline-block">
                            Session: {message.session_id.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}