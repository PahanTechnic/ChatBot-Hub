/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/bot/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Settings, Code, MessageSquare, RefreshCw, ExternalLink, Copy, Check, Bot, Calendar, Activity, Database, Eye } from 'lucide-react'

interface BotType {
  id: string
  name: string
  user_id: string
  is_active: boolean
  widget_color: string
  widget_icon?: string
  widget_position: string
  welcome_message: string
  sheet_url?: string
  created_at: string
  last_synced_at?: string
}

interface Message {
  id: string
  bot_id: string
  role: string
  content: string
  created_at: string
}

export default function BotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [, setUser] = useState<any>(null)
  const [bot, setBot] = useState<BotType | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [knowledgeCount, setKnowledgeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [copied, setCopied] = useState(false)
  const botId = params.id as string

  useEffect(() => {
    loadBotData()
  }, [botId])

  const loadBotData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signin')
        return
      }

      setUser(user)

      // Load bot
      const { data: botData, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

      if (botError) {
        console.error('Error fetching bot:', botError)
        router.push('/dashboard')
        return
      }

      setBot(botData)

      // Load messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })
        .limit(10)

      setMessages(messagesData || [])

      // Load knowledge base count
      const { count } = await supabase
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true })
        .eq('bot_id', botId)

      setKnowledgeCount(count || 0)

    } catch (error) {
      console.error('Error loading bot data:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncSheet = async () => {
    if (!bot?.sheet_url) return

    setIsSyncing(true)
    try {
      const response = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: bot.id,
          sheetUrl: bot.sheet_url,
        }),
      })

      if (response.ok) {
        // Update last_synced_at in database
        await supabase
          .from('bots')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', bot.id)

        const updatedBot = { ...bot, last_synced_at: new Date().toISOString() }
        setBot(updatedBot)
      }
    } catch (error) {
      console.error('Error syncing sheet:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed.js" data-bot-id="${botId}"></script>`

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

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

  if (!bot) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="fixed inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-white mb-4">Bot not found</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-green-500/20 blur-[150px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-green-900/10 blur-[200px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-white/60 hover:text-green-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <div className="hidden sm:flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ 
                    backgroundColor: `${bot.widget_color}15`,
                    borderColor: `${bot.widget_color}30`
                  }}
                >
                  <Bot className="w-5 h-5" style={{ color: bot.widget_color }} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{bot.name}</h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    bot.is_active 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'
                  }`}>
                    {bot.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => window.open(`/widget-embed?botId=${bot.id}`, '_blank')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white transition-all"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Preview</span>
              </button>
              <button 
                onClick={() => router.push(`/dashboard/bot/${bot.id}/settings`)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white transition-all"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Messages</p>
                <p className="text-xl font-bold text-white">{messages.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Knowledge</p>
                <p className="text-xl font-bold text-white">{knowledgeCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Status</p>
                <p className="text-xl font-bold text-white">{bot.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Created</p>
                <p className="text-sm font-bold text-white">{new Date(bot.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Embed Code */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Embed Code</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-white/50 mb-4">
                  Copy this code and paste it into your website&apos;s HTML:
                </p>
                <div className="bg-black/50 border border-white/[0.08] rounded-xl p-4 relative">
                  <code className="text-green-400 text-sm font-mono break-all">
                    {embedCode}
                  </code>
                  <button
                    onClick={copyEmbedCode}
                    className="absolute top-3 right-3 p-2 bg-white/[0.05] rounded-lg text-white/40 hover:text-green-400 hover:bg-white/[0.1] transition-all"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-400 mt-2">✓ Copied to clipboard!</p>
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    <h2 className="text-lg font-semibold text-white">Recent Messages</h2>
                  </div>
                  <span className="text-sm text-white/40 bg-white/[0.05] px-3 py-1 rounded-full border border-white/[0.08]">
                    {messages.length} messages
                  </span>
                </div>
              </div>
              <div className="p-5">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 font-medium">No messages yet</p>
                    <p className="text-sm text-white/40 mt-1">
                      Messages will appear here when users chat with your bot
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:border-green-500/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            message.role === 'user'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}>
                            {message.role === 'user' ? 'User' : 'Bot'}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/80">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bot Info */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.08]">
                <h2 className="text-lg font-semibold text-white">Bot Information</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-white/30 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white/60">Welcome Message</p>
                    <p className="text-sm text-white/80 mt-1">{bot.welcome_message}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-5 h-5 rounded mt-0.5" 
                    style={{ backgroundColor: bot.widget_color }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-white/60">Widget Color</p>
                    <p className="text-sm text-white/80 font-mono mt-1">{bot.widget_color}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-white/30 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white/60">Position</p>
                    <p className="text-sm text-white/80 mt-1 capitalize">{bot.widget_position.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Knowledge Base</h2>
                  {bot.sheet_url && (
                    <button
                      onClick={handleSyncSheet}
                      disabled={isSyncing}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5">
                {bot.sheet_url ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <ExternalLink className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Connected</span>
                    </div>
                    <p className="text-xs text-white/40 break-all bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                      {bot.sheet_url}
                    </p>
                    {bot.last_synced_at && (
                      <p className="text-xs text-white/40">
                        Last synced: {new Date(bot.last_synced_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ExternalLink className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/50 mb-4">No Google Sheet connected</p>
                    <button 
                      onClick={() => router.push(`/dashboard/bot/${bot.id}/settings`)}
                      className="px-4 py-2 rounded-xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors text-sm font-medium"
                    >
                      Connect Sheet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}