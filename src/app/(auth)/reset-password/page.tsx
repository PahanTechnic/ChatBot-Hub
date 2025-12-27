/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, RefreshCw, CheckCircle, Eye, EyeOff, Bot, ShieldCheck } from 'lucide-react'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)
    const router = useRouter()

    // Check if user has valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsValidSession(true)
            } else {
                setMessage('Invalid or expired reset link. Please request a new one.')
            }
            setCheckingSession(false)
        }
        checkSession()
    }, [])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (password !== confirmPassword) {
            setMessage('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password })
            if (error) throw error

            // Update password change timestamp in profiles
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('profiles').update({
                    updated_at: new Date().toISOString()
                }).eq('id', user.id)
            }

            setIsSuccess(true)
            setMessage('Password updated successfully!')
            setTimeout(() => router.push('/dashboard'), 2000)
        } catch (error: any) {
            setMessage(error.message || 'Error updating password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-black relative overflow-hidden">
            {/* Background Gradient */}
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

                    {/* Loading Session Check */}
                    {checkingSession && (
                        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center">
                            <RefreshCw className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
                            <p className="text-white/60">Verifying reset link...</p>
                        </div>
                    )}

                    {/* Invalid Session */}
                    {!checkingSession && !isValidSession && !isSuccess && (
                        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center">
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500/30 rounded-2xl blur-xl"></div>
                                    <div className="relative w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                                        <ShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl font-semibold text-white">Link Expired</h2>
                            <p className="text-sm text-white/40 mt-2">{message}</p>

                            <button onClick={() => router.push('/forgot-password')} className="mt-6 w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative text-white">Request New Link</span>
                            </button>
                        </div>
                    )}

                    {/* Reset Password Form */}
                    {!checkingSession && isValidSession && !isSuccess && (
                        <form onSubmit={handleUpdatePassword} className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-500/30 rounded-2xl blur-xl"></div>
                                    <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Lock className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl text-center font-semibold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Reset Password</h2>
                            <p className="text-sm text-white/40 mt-2 text-center">Enter your new password</p>

                            {message && (
                                <div className={`w-full mt-5 p-3 rounded-xl text-sm backdrop-blur-sm ${message.includes('Error') || message.includes('do not match') || message.includes('must be') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                                    {message}
                                </div>
                            )}

                            <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 mt-6 focus-within:border-green-500/50 transition-colors">
                                <Lock className="w-5 h-5 text-white/30" />
                                <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 text-white/30 hover:text-white/50 transition-colors">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 mt-4 focus-within:border-green-500/50 transition-colors">
                                <Lock className="w-5 h-5 text-white/30" />
                                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full" required />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="pr-4 text-white/30 hover:text-white/50 transition-colors">
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <button type="submit" disabled={loading} className="mt-6 w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative text-white flex items-center gap-2">
                                    {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Updating...</> : 'Update Password'}
                                </span>
                            </button>
                        </form>
                    )}

                    {/* Success State */}
                    {isSuccess && (
                        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center">
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-500/30 rounded-2xl blur-xl"></div>
                                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl font-semibold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Success!</h2>
                            <p className="text-sm text-white/40 mt-2">Password updated successfully.<br />Redirecting to dashboard...</p>

                            <div className="mt-6 flex justify-center">
                                <RefreshCw className="w-6 h-6 text-green-400 animate-spin" />
                            </div>
                        </div>
                    )}
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