/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bot, Plus, Settings, ExternalLink, Calendar, Activity, LogOut, User, MessageSquare, Menu, X, RefreshCw } from 'lucide-react'

interface BotType {
  id: string
  name: string
  user_id: string
  is_active: boolean
  widget_color: string
  sheet_url?: string
  created_at: string
  last_synced_at?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bots, setBots] = useState<BotType[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const router = useRouter()

  

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signin')
        return
      }

      setUser(user)
      await loadBots(user.id)
      await loadMessageCount(user.id)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/signin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const loadBots = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBots(data || [])
    } catch (error) {
      console.error('Error loading bots:', error)
    }
  }

  const loadMessageCount = async (userId: string) => {
    try {
      const { data: botsData } = await supabase
        .from('bots')
        .select('id')
        .eq('user_id', userId)

      if (botsData && botsData.length > 0) {
        const botIds = botsData.map(bot => bot.id)
        const { data: messagesData } = await supabase
          .from('messages')
          .select('id')
          .in('bot_id', botIds)

        setMessageCount(messagesData?.length || 0)
      }
    } catch (error) {
      console.error('Error loading message count:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  if (loading) {
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
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">ChatBot Hub</h1>
                <p className="text-xs text-white/40">AI-Powered Support</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium transition-all"
              >
                <Bot className="w-5 h-5" />
                <span>Chatbots</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard/messages')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/60 hover:bg-white/[0.05] transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full font-medium border border-green-500/30">
                  {messageCount}
                </span>
              </button>

              <button
                onClick={() => router.push('/dashboard/profile')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/60 hover:bg-white/[0.05] transition-all"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </div>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center space-x-3">
              {/* User Info - Desktop */}
              <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white/80">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-white/40">{user?.email}</p>
                </div>
              </div>

              {/* Sign Out - Desktop */}
              <button 
                onClick={handleSignOut}
                className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06]"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white/60" />
                ) : (
                  <Menu className="w-6 h-6 text-white/60" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/[0.08]">
              <div className="space-y-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/dashboard') }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium"
                >
                  <Bot className="w-5 h-5" />
                  <span>Chatbots</span>
                </button>
                
                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/dashboard/messages') }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/60 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full font-medium border border-green-500/30">
                    {messageCount}
                  </span>
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/dashboard/profile') }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/[0.05] transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>

                <div className="pt-2 mt-2 border-t border-white/[0.08]">
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-medium text-white/60">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">My Chatbots</h2>
              <p className="text-white/40 mt-2">Create and manage your AI-powered customer support chatbots</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/bot/new')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Create Bot</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-green-500/30 transition-all">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/20">
                  <Bot className="w-7 h-7 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/50 font-medium">Total Bots</p>
                  <p className="text-3xl font-bold text-white mt-1">{bots.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-green-500/30 transition-all">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Activity className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/50 font-medium">Active Bots</p>
                  <p className="text-3xl font-bold text-white mt-1">{bots.filter(bot => bot.is_active).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-green-500/30 transition-all">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/20">
                  <Calendar className="w-7 h-7 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/50 font-medium">This Month</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {bots.filter(bot => {
                      const created = new Date(bot.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bots List */}
          {bots.length === 0 ? (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <Bot className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No chatbots yet</h3>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Create your first chatbot to get started with AI-powered customer support
              </p>
              <button 
                  onClick={() => router.push('/dashboard/bot/new')}
                  className="px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 text-white"
                >
                  Create Your First Bot
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <div key={bot.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden hover:border-green-500/30 transition-all">
                    <div className="p-6 border-b border-white/[0.08]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center border"
                            style={{ 
                              backgroundColor: `${bot.widget_color || '#16a34a'}15`,
                              borderColor: `${bot.widget_color || '#16a34a'}30`
                            }}
                          >
                            <Bot className="w-6 h-6" style={{ color: bot.widget_color || '#16a34a' }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{bot.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${
                              bot.is_active
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'
                            }`}>
                              {bot.is_active ? '● Active' : '○ Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-3 mb-6">
                        {bot.sheet_url ? (
                          <div className="flex items-center text-sm text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">
                            <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">Connected to Google Sheet</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                            <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>No sheet connected</span>
                          </div>
                        )}
                        
                        <div className="text-sm text-white/50 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-white/30" />
                          Created {new Date(bot.created_at).toLocaleDateString()}
                        </div>
                        
                        {bot.last_synced_at && (
                          <div className="text-sm text-white/50 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-white/30" />
                            Synced {new Date(bot.last_synced_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => router.push(`/dashboard/bot/${bot.id}`)}
                          className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all text-white"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => router.push(`/dashboard/bot/${bot.id}/settings`)}
                          className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white transition-all"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
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