// ===============================================
// STEP 2: app/signin/page.tsx - Fixed Version
// ===============================================

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, RefreshCw, LogIn, Eye, EyeOff, Bot } from 'lucide-react'

export default function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const router = useRouter()

    // Check existing session on mount
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user?.email_confirmed_at) {
                    // Already logged in, redirect to dashboard
                    router.replace('/dashboard')
                    return
                }
            } catch (error) {
                console.error('Session check error:', error)
            } finally {
                setIsCheckingSession(false)
            }
        }
        checkExistingSession()
    }, [router])

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            // Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            })

            if (authError) throw authError

            // Check if email is verified
            if (!authData.user?.email_confirmed_at) {
                setMessage('Please verify your email first. Check your inbox for verification code.')
                await supabase.auth.signOut()
                setLoading(false)
                return
            }

            // Wait a moment for session to be established
            await new Promise(resolve => setTimeout(resolve, 500))

            // Verify session is properly set
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                throw new Error('Session not established')
            }

            // Fetch or create user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single()

            if (profileError && profileError.code === 'PGRST116') {
                // Profile doesn't exist, create one
                const { error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        email: authData.user.email,
                        full_name: authData.user.user_metadata?.full_name || '',
                        phone: authData.user.user_metadata?.phone || null,
                        company: authData.user.user_metadata?.company || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })

                if (createError) {
                    console.error('Profile create error:', createError)
                }
            }

            // Update last login time
            await supabase
                .from('profiles')
                .update({ 
                    last_login: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', authData.user.id)

            // Store user session info if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberUser', email)
            } else {
                localStorage.removeItem('rememberUser')
            }

            // Use replace instead of push to prevent back navigation issues
            router.replace('/dashboard')
        } catch (error: any) {
            console.error('Sign in error:', error)
            setMessage(error.message || 'Invalid email or password')
            setLoading(false)
        }
    }

    // Show loading while checking session
    if (isCheckingSession) {
        return (
            <div className="flex min-h-screen w-full bg-black items-center justify-center">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full bg-black relative overflow-hidden">
            {/* Background - Same as before */}
            <div className="fixed inset-0 w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
                <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-green-500/20 blur-[150px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[150px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-green-900/10 blur-[200px]"></div>
                <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[120px]"></div>
            </div>

            {/* Left Side Image */}
            <div className="w-full hidden md:block relative z-10">
                <img className="h-full w-full object-cover opacity-60" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png" alt="leftSideImage" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black"></div>
            </div>
        
            {/* Right Side Form */}
            <div className="w-full flex flex-col items-center justify-center relative z-10 px-4">
                <div className="w-full max-w-md relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-3xl blur-2xl opacity-40"></div>
                    
                    <form onSubmit={handleSignIn} className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/30 rounded-2xl blur-xl"></div>
                                <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <LogIn className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl text-center font-semibold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Welcome Back</h2>
                        <p className="text-sm text-white/40 mt-2 text-center">Sign in to continue to your account</p>

                        {message && (
                            <div className={`w-full mt-6 p-3 rounded-xl text-sm backdrop-blur-sm ${message.includes('Error') || message.includes('Invalid') || message.includes('verify') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                                {message}
                            </div>
                        )}

                        {/* Email Input - FIXED */}
                        <div className="flex items-center w-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 mt-6 focus-within:border-green-500/50 transition-colors">
                            <Mail className="w-5 h-5 text-white/30" />
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="bg-transparent outline-none w-full h-full pr-4"
                                style={{ 
                                    color: 'rgb(255, 255, 255)',
                                    fontSize: '14px',
                                    WebkitTextFillColor: 'rgb(255, 255, 255)'
                                }}
                                autoComplete="email"
                                required 
                            />
                        </div>

                        {/* Password Input - FIXED */}
                        <div className="flex items-center mt-4 w-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                            <Lock className="w-5 h-5 text-white/30" />
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="bg-transparent outline-none w-full h-full"
                                style={{ 
                                    color: 'rgb(255, 255, 255)',
                                    fontSize: '14px',
                                    WebkitTextFillColor: 'rgb(255, 255, 255)'
                                }}
                                autoComplete="current-password"
                                required 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 text-white/30 hover:text-white/50 transition-colors">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="w-full flex items-center justify-between mt-6">
                            <div className="flex items-center gap-2">
                                <input className="w-4 h-4 accent-green-500 cursor-pointer" type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                <label className="text-sm text-white/40 cursor-pointer" htmlFor="remember">Remember me</label>
                            </div>
                            <Link className="text-sm text-green-400 hover:text-green-300 transition-colors" href="/forgot-password">Forgot password?</Link>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="mt-6 w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative text-white flex items-center gap-2">
                                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign In'}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 w-full mt-6">
                            <div className="flex-1 h-px bg-white/[0.08]"></div>
                            <span className="text-sm text-white/30">or continue with</span>
                            <div className="flex-1 h-px bg-white/[0.08]"></div>
                        </div>

                        {/* Social Login */}
                        <div className="flex gap-3 mt-6 w-full">
                            <button type="button" className="flex-1 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center gap-2 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="text-sm text-white/60">Google</span>
                            </button>
                            <button type="button" className="flex-1 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center gap-2 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all">
                                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span className="text-sm text-white/60">Facebook</span>
                            </button>
                        </div>

                        <p className="text-white/40 text-sm mt-6 text-center">
                            Don&apos;t have an account? <Link className="text-green-400 hover:text-green-300 ml-1 font-medium transition-colors" href="/signup">Sign up</Link>
                        </p>
                    </form>
                </div>

                {/* Brand */}
                <div className="flex items-center gap-2 mt-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/60 font-medium">ChatBot AI</span>
                </div>
            </div>
        </div>
    )
}