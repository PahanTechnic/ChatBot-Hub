// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import About from "@/components/about/About";
import Footer from "@/components/footer/footer";
import Testimonials from "@/components/testimonials/testimonials";
import Link from "next/link";
import { Bot, BarChart3, Zap, Users, ChevronRight, User, LayoutDashboard, LogOut } from 'lucide-react';

interface UserData {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: UserData = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url
        }
        setUser(userData)
        // Save to localStorage
        localStorage.setItem('chatbot_user', JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem('chatbot_user')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      // First check localStorage for faster initial load
      const storedUser = localStorage.getItem('chatbot_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }

      // Then verify with Supabase
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()

      if (supabaseUser) {
        const userData: UserData = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          full_name: supabaseUser.user_metadata?.full_name,
          avatar_url: supabaseUser.user_metadata?.avatar_url
        }
        setUser(userData)
        localStorage.setItem('chatbot_user', JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem('chatbot_user')
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('chatbot_user')
    setShowProfileMenu(false)
  }

  return (
    <>
      <div className="relative min-h-screen bg-black text-white pb-28 pt-8 overflow-hidden">
        {/* Green gradient background */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-top bg-no-repeat opacity-60"
          style={{
            backgroundImage: "url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/green-gradient-bg.svg')"
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Navigation */}
          <nav className="flex items-center border mx-4 w-full max-w-4xl mx-auto justify-between border-slate-700 px-4 py-2.5 rounded-full text-white mb-24">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-green-400" />
              <span className="text-xl font-bold">ChatBot AI</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className="px-4 py-2 border border-white/10 bg-white/10 font-medium rounded-full">
                Home
              </Link>
              <Link href="/features" className="px-4 py-2 hover:bg-white/5 transition rounded-full">
                Features
              </Link>
              <Link href="/pricing" className="px-4 py-2 hover:bg-white/5 transition rounded-full">
                Pricing
              </Link>
              <Link href="/docs" className="px-4 py-2 hover:bg-white/5 transition rounded-full">
                Docs
              </Link>
            </div>

            {/* Auth Buttons - Conditional Rendering */}
            {loading ? (
              <div className="w-24 h-10 bg-white/10 rounded-full animate-pulse" />
            ) : user ? (
              /* Logged In State */
              <div className="flex items-center gap-2">
                {/* Dashboard Button */}
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 rounded-full border-2 border-green-500/50 hover:border-green-400 transition-all"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu - Glass Effect with Green Theme */}
                  {showProfileMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileMenu(false)}
                      />

                      <div className="absolute right-0 mt-2 w-64 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Glass Container - Green Theme */}
                        <div className="relative bg-black/60 backdrop-blur-2xl border border-green-500/20 rounded-2xl shadow-2xl shadow-green-900/20">
                          {/* Gradient Overlay for depth - Green tinted */}
                          <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.08] to-transparent rounded-2xl pointer-events-none" />

                          {/* Inner glow effect - Green */}
                          <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-green-400/[0.05] via-transparent to-green-500/[0.02] pointer-events-none" />

                          {/* Shine effect at top - Green */}
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />

                          {/* Content */}
                          <div className="relative z-10">
                            {/* User Info */}
                            <div className="px-4 py-4 border-b border-green-500/10">
                              <div className="flex items-center gap-3">
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-green-500/30"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center ring-2 ring-green-400/30 shadow-lg shadow-green-500/20">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-white truncate">
                                    {user.full_name || 'User'}
                                  </p>
                                  <p className="text-xs text-green-200/50 truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2 px-2">
                              <Link
                                href="/dashboard"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-green-500/10 hover:text-white transition-all group"
                              >
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors border border-green-500/20">
                                  <LayoutDashboard className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="font-medium">Dashboard</span>
                              </Link>

                              <Link
                                href="/dashboard/profile"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-green-500/10 hover:text-white transition-all group"
                              >
                                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors border border-emerald-500/20">
                                  <User className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="font-medium">Profile Settings</span>
                              </Link>

                              <Link
                                href="/dashboard/bot/new"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-green-500/10 hover:text-white transition-all group"
                              >
                                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors border border-green-600/20">
                                  <Bot className="w-4 h-4 text-green-300" />
                                </div>
                                <span className="font-medium">Create New Bot</span>
                              </Link>
                            </div>

                            {/* Sign Out */}
                            <div className="border-t border-green-500/10 p-2">
                              <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/15 transition-all w-full group"
                              >
                                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors border border-red-500/20">
                                  <LogOut className="w-4 h-4 text-red-400" />
                                </div>
                                <span className="font-medium">Sign Out</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Logged Out State */
              <Link
                href="/signin"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition"
              >
                Get Started
              </Link>
            )}
          </nav>

          {/* Community badge */}
          <div className="flex flex-wrap items-center justify-center p-1.5 mt-8 rounded-full border border-green-900 bg-green-700/15 text-xs w-fit mx-auto">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-green-400 mr-2" />
            </div>
            <p>Join 10,000+ businesses using AI chatbots</p>
          </div>

          {/* Hero heading */}
          <h1 className="text-4xl md:text-6xl text-center font-semibold max-w-4xl mt-5 mx-auto bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
            Transform Customer Support with AI-Powered Chatbots
          </h1>

          <p className="text-slate-300 md:text-base text-center max-w-2xl mt-3 mx-auto px-2">
            Deploy intelligent chatbots in minutes. Automate support, integrate with your data, and deliver exceptional customer experiences with cutting-edge AI technology.
          </p>

          {/* CTA Buttons - Also conditional */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-sm">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 transition rounded-full flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
                <Link
                  href="/dashboard/bot/new"
                  className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-6 py-2.5 hover:bg-white/15 transition"
                >
                  <span>Create New Bot</span>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 transition rounded-full"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-6 py-2.5 hover:bg-white/15 transition"
                >
                  <span>Try Live Demo</span>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </Link>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 backdrop-blur-sm border border-green-700/30 p-8 rounded-2xl hover:border-green-600/50 hover:shadow-lg hover:shadow-green-500/10 transition-all group">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart AI Assistant</h3>
              <p className="text-slate-300 text-sm">Lightning-fast responses powered by advanced AI models</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 backdrop-blur-sm border border-green-700/30 p-8 rounded-2xl hover:border-green-600/50 hover:shadow-lg hover:shadow-green-500/10 transition-all group">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-slate-300 text-sm">Track conversations, performance, and customer insights</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 backdrop-blur-sm border border-green-700/30 p-8 rounded-2xl hover:border-green-600/50 hover:shadow-lg hover:shadow-green-500/10 transition-all group">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
              <p className="text-slate-300 text-sm">Deploy anywhere with our simple embed widget</p>
            </div>
          </div>

          {/* Trusted Companies */}
          <div className="mt-20 text-center">
            <div className="text-slate-500 text-xs font-semibold tracking-wider mb-4">TRUSTED BY LEADING COMPANIES</div>
          </div>
        </div>
      </div>
      <About />
      <Testimonials />
      <Footer />
    </>
  );
}