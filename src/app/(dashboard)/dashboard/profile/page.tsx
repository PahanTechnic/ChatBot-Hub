/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User as UserIcon, Save, Calendar, Bot, MessageSquare, Mail, Shield, ArrowLeft, Activity, Phone, Building2, RefreshCw, Check } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: ''
  })
  const [stats, setStats] = useState({
    totalBots: 0,
    totalMessages: 0,
    activeBots: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signin')
        return
      }

      setUser(user)

      // Load profile from database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFormData({
          fullName: profileData.full_name || '',
          email: profileData.email || user.email || '',
          phone: profileData.phone || '',
          company: profileData.company || ''
        })
      } else {
        setFormData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          company: user.user_metadata?.company || ''
        })
      }

      // Load stats
      const { data: botsData } = await supabase
        .from('bots')
        .select('id, is_active')
        .eq('user_id', user.id)

      if (botsData) {
        const botIds = botsData.map(bot => bot.id)
        
        setStats(prev => ({
          ...prev,
          totalBots: botsData.length,
          activeBots: botsData.filter(bot => bot.is_active).length
        }))

        if (botIds.length > 0) {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('id')
            .in('bot_id', botIds)

          setStats(prev => ({
            ...prev,
            totalMessages: messagesData?.length || 0
          }))
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.fullName,
          phone: formData.phone,
          company: formData.company
        }
      })

      if (authError) throw authError

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      if (profileError) throw profileError

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile' })
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
      <nav className="relative z-10 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Profile Settings</h1>
            <p className="text-white/40 mt-2">Manage your account information and preferences</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-white/40">Total Bots</p>
                    <p className="text-2xl font-bold text-white">{stats.totalBots}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-white/40">Active Bots</p>
                    <p className="text-2xl font-bold text-white">{stats.activeBots}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-white/40">Messages</p>
                    <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden">
              {/* Form Header */}
              <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-green-600/10 to-emerald-600/10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                    <p className="text-sm text-white/40">Update your account details</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                {message.text && (
                  <div className={`p-4 rounded-xl text-sm backdrop-blur-sm ${
                    message.type === 'error' 
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                      : 'bg-green-500/10 border border-green-500/20 text-green-400'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                  <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                    <UserIcon className="w-5 h-5 text-white/30" />
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                      placeholder="Enter your full name"
                      className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4" 
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
                  <div className="flex items-center w-full bg-white/[0.02] border border-white/[0.05] h-12 rounded-xl overflow-hidden pl-4 gap-3">
                    <Mail className="w-5 h-5 text-white/20" />
                    <input 
                      type="email" 
                      value={formData.email} 
                      disabled
                      className="bg-transparent text-white/40 outline-none text-sm w-full h-full pr-4 cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-2">Email cannot be changed. Contact support if needed.</p>
                </div>

                {/* Phone & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Phone Number</label>
                    <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                      <Phone className="w-5 h-5 text-white/30" />
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                        placeholder="Phone number"
                        className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Company</label>
                    <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                      <Building2 className="w-5 h-5 text-white/30" />
                      <input 
                        type="text" 
                        value={formData.company} 
                        onChange={(e) => setFormData({...formData, company: e.target.value})} 
                        placeholder="Company name"
                        className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4" 
                      />
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center space-x-2 text-sm text-white/40 bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                  <Calendar className="w-5 h-5 text-white/30" />
                  <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center space-x-2 h-11 px-6 rounded-xl font-medium relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative text-white flex items-center gap-2">
                      {isSaving ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" />Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" />Save Changes</>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Information */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">Account Information</h2>
                </div>
              </div>
              <div className="p-6 space-y-1">
                <div className="flex justify-between items-center py-4 border-b border-white/[0.05]">
                  <span className="text-sm font-medium text-white/60">User ID</span>
                  <span className="text-sm text-white/40 font-mono bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                    {user?.id?.substring(0, 8)}...
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-4 border-b border-white/[0.05]">
                  <span className="text-sm font-medium text-white/60">Email Verified</span>
                  <span className="flex items-center text-sm bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                    <Check className="w-4 h-4 text-green-400 mr-1.5" />
                    <span className="text-green-400 font-medium">Verified</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-4 border-b border-white/[0.05]">
                  <span className="text-sm font-medium text-white/60">Account Created</span>
                  <span className="text-sm text-white/40">
                    {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-4">
                  <span className="text-sm font-medium text-white/60">Last Sign In</span>
                  <span className="text-sm text-white/40">
                    {user?.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}