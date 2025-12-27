/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/signup/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, RefreshCw, UserPlus, CheckCircle, User, Phone, Building2, Check, X, Eye, EyeOff, Bot } from 'lucide-react'

export default function SignUp() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otp, setOtp] = useState('')
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const router = useRouter()

    const passwordChecks = useMemo(() => {
        const password = formData.password
        return {
            minLength: password.length >= 6,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
        }
    }, [formData.password])

    const passwordStrength = useMemo(() => {
        const checks = Object.values(passwordChecks).filter(Boolean).length
        if (checks === 0) return { level: 0, text: 'Too Weak', color: 'bg-gray-500' }
        if (checks === 1) return { level: 1, text: 'Weak', color: 'bg-red-500' }
        if (checks === 2) return { level: 2, text: 'Fair', color: 'bg-orange-500' }
        if (checks === 3) return { level: 3, text: 'Good', color: 'bg-yellow-500' }
        return { level: 4, text: 'Strong', color: 'bg-green-500' }
    }, [passwordChecks])

    const isPasswordValid = passwordChecks.minLength && passwordChecks.hasUppercase && passwordChecks.hasLowercase && passwordChecks.hasNumber

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (!formData.fullName.trim()) {
            setMessage('Please enter your full name')
            setLoading(false)
            return
        }
        if (!isPasswordValid) {
            setMessage('Please meet all password requirements')
            setLoading(false)
            return
        }
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match')
            setLoading(false)
            return
        }
        if (!agreeTerms) {
            setMessage('Please agree to Terms & Conditions')
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        company: formData.company,
                    }
                }
            })
            if (error) throw error
            setShowOtpInput(true)
            setMessage('OTP code එක ඔයාගේ email එකට යවා ඇත. කරුණාකර verify කරන්න.')
        } catch (error: any) {
            setMessage(error.message || 'Error creating account')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'email'
            })
            if (error) throw error

            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        full_name: formData.fullName,
                        email: formData.email,
                        phone: formData.phone || null,
                        company: formData.company || null,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' })

                if (profileError) {
                    console.error('Profile save error:', profileError)
                }
            }

            setMessage('Account verified successfully! Redirecting...')
            setTimeout(() => router.push('/dashboard'), 1500)
        } catch (error: any) {
            setMessage(error.message || 'Invalid OTP code')
        } finally {
            setLoading(false)
        }
    }

    const resendOTP = async () => {
        setLoading(true)
        setMessage('')
        try {
            const { error } = await supabase.auth.resend({ type: 'signup', email: formData.email })
            if (error) throw error
            setMessage('OTP code එක නැවත යවා ඇත. Check your email.')
        } catch (error: any) {
            setMessage(error.message || 'Error resending OTP')
        } finally {
            setLoading(false)
        }
    }

    const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
        <div className={`flex items-center gap-2 text-xs transition-all ${met ? 'text-green-400' : 'text-white/40'}`}>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${met ? 'bg-green-500/20' : 'bg-white/10'}`}>
                {met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            </div>
            <span>{text}</span>
        </div>
    )

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
            <div className="w-full flex flex-col items-center justify-center relative z-10 px-4 py-8">
                <div className="w-full max-w-md relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-3xl blur-2xl opacity-40"></div>

                    {!showOtpInput ? (
                        <form onSubmit={handleSignUp} className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            {/* Logo */}
                            <div className="flex justify-center mb-5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-500/30 rounded-2xl blur-xl"></div>
                                    <div className="relative w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <UserPlus className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl text-center font-semibold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Create Account</h2>
                            <p className="text-sm text-white/40 mt-1 text-center">Sign up to get started</p>

                            {message && (
                                <div className={`w-full mt-4 p-3 rounded-xl text-sm backdrop-blur-sm ${message.includes('Error') || message.includes('do not match') || message.includes('Please') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                                    {message}
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-11 rounded-xl overflow-hidden pl-4 gap-3 mt-5 focus-within:border-green-500/50 transition-colors">
                                <User className="w-4 h-4 text-white/30" />
                                <input type="text" name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleChange} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4" required />
                            </div>

                            {/* Email */}
                            <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-11 rounded-xl overflow-hidden pl-4 gap-3 mt-3 focus-within:border-green-500/50 transition-colors">
                                <Mail className="w-4 h-4 text-white/30" />
                                <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4" required />
                            </div>

                            {/* Phone & Company Row */}
                            <div className="flex gap-3 mt-3">
                                <div className="flex items-center flex-1 bg-white/[0.03] border border-white/[0.08] h-11 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                                    <Phone className="w-4 h-4 text-white/30" />
                                    <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4" />
                                </div>
                                <div className="flex items-center flex-1 bg-white/[0.03] border border-white/[0.08] h-11 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                                    <Building2 className="w-4 h-4 text-white/30" />
                                    <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleChange} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="relative w-full mt-3">
                                <div className={`flex items-center w-full bg-white/[0.03] border h-11 rounded-xl overflow-hidden pl-4 gap-3 transition-colors ${isPasswordFocused ? 'border-green-500/50' : 'border-white/[0.08]'}`}>
                                    <Lock className="w-4 h-4 text-white/30" />
                                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password *" value={formData.password} onChange={handleChange} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setTimeout(() => setIsPasswordFocused(false), 200)} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 text-white/30 hover:text-white/50 transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password Requirements Popup - 4 Segments */}
                                {isPasswordFocused && formData.password && (
                                    <div className="absolute left-0 right-0 top-12 z-50">
                                        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3">
                                            <div className="absolute -top-2 left-6 w-3 h-3 bg-gray-900/95 border-l border-t border-white/10 transform rotate-45"></div>
                                            <div className="mb-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-white/50">Strength</span>
                                                    <span className={`text-xs font-medium ${passwordStrength.level <= 1 ? 'text-red-400' : passwordStrength.level === 2 ? 'text-orange-400' : passwordStrength.level === 3 ? 'text-yellow-400' : 'text-green-400'}`}>{passwordStrength.text}</span>
                                                </div>
                                                {/* 4 Segment Strength Bar */}
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map((level) => (
                                                        <div 
                                                            key={level}
                                                            className={`h-1.5 flex-1 rounded-full transition-all ${
                                                                level <= passwordStrength.level 
                                                                    ? passwordStrength.level === 1 ? 'bg-red-500'
                                                                    : passwordStrength.level === 2 ? 'bg-orange-500'
                                                                    : passwordStrength.level === 3 ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                                    : 'bg-white/10'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                <RequirementItem met={passwordChecks.minLength} text="6+ characters" />
                                                <RequirementItem met={passwordChecks.hasUppercase} text="Uppercase" />
                                                <RequirementItem met={passwordChecks.hasLowercase} text="Lowercase" />
                                                <RequirementItem met={passwordChecks.hasNumber} text="Number" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="relative w-full mt-3">
                                <div className={`flex items-center w-full bg-white/[0.03] border h-11 rounded-xl overflow-hidden pl-4 gap-3 transition-colors ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500/50' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500/50' : 'border-white/[0.08]'}`}>
                                    <Lock className="w-4 h-4 text-white/30" />
                                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password *" value={formData.confirmPassword} onChange={handleChange} className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full" required />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="pr-4 text-white/30 hover:text-white/50 transition-colors">
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <div className={`flex items-center gap-1 mt-1 ml-1 text-xs ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                                        {formData.password === formData.confirmPassword ? <><Check className="w-3 h-3" /><span>Match</span></> : <><X className="w-3 h-3" /><span>Not match</span></>}
                                    </div>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2 mt-4 w-full">
                                <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 mt-0.5 accent-green-500 cursor-pointer" />
                                <label htmlFor="terms" className="text-xs text-white/40 cursor-pointer">
                                    I agree to the <Link href="/terms" className="text-green-400 hover:text-green-300">Terms</Link> and <Link href="/privacy" className="text-green-400 hover:text-green-300">Privacy Policy</Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" disabled={loading || !isPasswordValid} className="mt-5 w-full h-11 rounded-xl font-medium flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative text-white flex items-center gap-2">
                                    {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Creating...</> : 'Create Account'}
                                </span>
                            </button>

                            <p className="text-white/40 text-sm mt-5 text-center">
                                Already have an account? <Link className="text-green-400 hover:text-green-300 font-medium transition-colors" href="/signin">Sign in</Link>
                            </p>
                        </form>
                    ) : (
                        /* OTP Verification */
                        <form onSubmit={handleVerifyOTP} className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-500/30 rounded-2xl blur-xl"></div>
                                    <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl text-center font-semibold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Verify Email</h2>
                            <p className="text-sm text-white/40 mt-2 text-center">Enter the 6-digit code sent to<br /><span className="text-green-400">{formData.email}</span></p>

                            {message && (
                                <div className={`w-full mt-5 p-3 rounded-xl text-sm backdrop-blur-sm ${message.includes('Error') || message.includes('Invalid') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                                    {message}
                                </div>
                            )}

                            <div className="flex gap-2 mt-6 justify-center">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input key={index} type="text" maxLength={1} value={otp[index] || ''} name={`otp-${index}`}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '')
                                            const newOtp = otp.split('')
                                            newOtp[index] = value
                                            setOtp(newOtp.join(''))
                                            if (value && index < 5) (document.querySelector(`input[name=otp-${index + 1}]`) as HTMLInputElement)?.focus()
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[index] && index > 0) (document.querySelector(`input[name=otp-${index - 1}]`) as HTMLInputElement)?.focus()
                                        }}
                                        className="w-11 h-13 text-center text-xl font-semibold bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button type="submit" disabled={loading || otp.length !== 6} className="mt-6 w-full h-11 rounded-xl font-medium flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative text-white flex items-center gap-2">
                                    {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Verifying...</> : 'Verify & Continue'}
                                </span>
                            </button>

                            <div className="flex items-center justify-center gap-4 mt-5">
                                <button type="button" onClick={resendOTP} disabled={loading} className="text-sm text-green-400 hover:text-green-300 disabled:opacity-50">Resend OTP</button>
                                <span className="text-white/20">|</span>
                                <button type="button" onClick={() => { setShowOtpInput(false); setOtp(''); setMessage('') }} className="text-sm text-white/40 hover:text-white/60">Change Email</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Brand */}
                <div className="flex items-center gap-2 mt-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/60 font-medium">ChatBot AI</span>
                </div>
            </div>
        </div>
    )
}