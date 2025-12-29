/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/bot/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Bot, Palette, RefreshCw, MessageSquare, Sparkles } from 'lucide-react'

export default function NewBotPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you today?')
  const [widgetColor, setWidgetColor] = useState('#16a34a')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const colorPresets = [
    '#16a34a', '#059669', '#0d9488', '#0891b2',
    '#2563eb', '#7c3aed', '#c026d3', '#e11d48'
  ]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/signin')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/signin')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [checkUser])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      console.log('User ID:', user.id)

      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      console.log('Existing profile:', existingProfile, 'Check error:', checkError)

      // If profile doesn't exist, create it first
      if (!existingProfile) {
        console.log('Creating new profile...')

        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || null,
            company: user.user_metadata?.company || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        console.log('New profile result:', newProfile, 'Profile error:', profileError)

        if (profileError) {
          // If insert fails, try upsert
          console.log('Insert failed, trying upsert...')
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              phone: user.user_metadata?.phone || null,
              company: user.user_metadata?.company || null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

          if (upsertError) {
            console.error('Upsert error:', upsertError)
            throw new Error(`Profile creation failed: ${upsertError.message}`)
          }
        }
      }

      // Wait a moment for the profile to be available
      await new Promise(resolve => setTimeout(resolve, 500))

      // Now create the bot
      console.log('Creating bot...')
      const { data, error } = await supabase
        .from('bots')
        .insert({
          user_id: user.id,
          name,
          welcome_message: welcomeMessage,
          widget_color: widgetColor,
          widget_icon: 'chat-dots',
          widget_position: 'bottom-right',
          is_active: true,
        })
        .select()
        .single()

      console.log('Bot result:', data, 'Bot error:', error)

      if (error) throw error

      router.push(`/dashboard/bot/${data.id}`)
    } catch (err: any) {
      console.error('Full error:', err)
      setError(err.message || 'Failed to create bot')
    } finally {
      setIsSaving(false)
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
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 font-medium">ChatBot AI</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Create New Chatbot</h1>
          <p className="text-white/40 mt-2">Set up your AI-powered customer support bot</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-green-600/10 to-emerald-600/10">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Bot Configuration</h2>
                <p className="text-sm text-white/40">Configure your chatbot&apos;s basic settings</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Bot Name */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Bot Name
              </label>
              <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                <Bot className="w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder="e.g., Customer Support Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4"
                  required
                />
              </div>
            </div>

            {/* Welcome Message */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Welcome Message
              </label>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-green-500/50 transition-colors">
                <div className="flex items-start pl-4 pt-3 gap-3">
                  <MessageSquare className="w-5 h-5 text-white/30 mt-0.5" />
                  <textarea
                    placeholder="Enter the message users will see when they first interact with your bot"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={3}
                    className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full pr-4 pb-3 resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Widget Color */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Widget Color
              </label>
              <div className="flex flex-col gap-4">
                {/* Color Presets */}
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setWidgetColor(color)}
                      className={`w-10 h-10 rounded-xl transition-all ${widgetColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                          : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Custom Color */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      className="w-14 h-14 border-2 border-white/[0.08] rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                      <Palette className="w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        value={widgetColor}
                        onChange={(e) => setWidgetColor(e.target.value)}
                        placeholder="#16a34a"
                        className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4 font-mono"
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-1.5 ml-1">
                      This color will be used for your chat widget
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-medium text-white">Live Preview</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                  style={{ backgroundColor: widgetColor, boxShadow: `0 10px 40px ${widgetColor}40` }}
                >
                  <Bot className="w-7 h-7" />
                </div>
                <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 max-w-xs">
                  <p className="text-sm text-white/80">
                    {welcomeMessage || 'Your welcome message'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 rounded-xl border border-white/[0.08] text-white/60 hover:bg-white/[0.05] hover:text-white transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Bot'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* User Info Footer */}
        {profile && (
          <div className="mt-6 text-center text-sm text-white/30">
            Creating as <span className="text-white/50">{profile.full_name || user?.email}</span>
          </div>
        )}
      </div>
    </div>
  )
}