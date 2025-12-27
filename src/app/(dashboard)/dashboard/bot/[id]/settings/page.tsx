/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/bot/[id]/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Save, Trash2, ExternalLink, RefreshCw, CheckCircle, 
  Palette, Settings as SettingsIcon, Bot, MessageSquare, Image,
  Search, Upload, Download
} from 'lucide-react'

// Bootstrap icons
const AVAILABLE_ICONS = [
  { name: 'Chat', value: 'bi-chat-left-text' },
  { name: 'Robot', value: 'bi-robot' },
  { name: 'Person', value: 'bi-person-circle' },
  { name: 'Headset', value: 'bi-headset' },
  { name: 'Question', value: 'bi-question-circle' },
  { name: 'Info', value: 'bi-info-circle' },
  { name: 'Lightbulb', value: 'bi-lightbulb' },
  { name: 'Heart', value: 'bi-heart' },
  { name: 'Star', value: 'bi-star' },
  { name: 'Bell', value: 'bi-bell' },
  { name: 'Gift', value: 'bi-gift' },
  { name: 'Rocket', value: 'bi-rocket-takeoff' },
  { name: 'Shield', value: 'bi-shield-check' },
  { name: 'Phone', value: 'bi-telephone' },
  { name: 'Cart', value: 'bi-cart' },
  { name: 'Book', value: 'bi-book' },
]

// Gradient presets
const GRADIENT_PRESETS = [
  { name: 'Emerald', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Blues', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { name: 'Mint', value: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)' },
]

// Solid color presets
const COLOR_PRESETS = [
  '#16a34a', '#059669', '#0d9488', '#0891b2', 
  '#2563eb', '#7c3aed', '#c026d3', '#e11d48'
]

// Gradient angles
const GRADIENT_ANGLES = [
  { name: '↗', value: '45deg' },
  { name: '→', value: '90deg' },
  { name: '↘', value: '135deg' },
  { name: '↓', value: '180deg' },
  { name: '↙', value: '225deg' },
  { name: '←', value: '270deg' },
  { name: '↖', value: '315deg' },
  { name: '↑', value: '0deg' },
]

interface BotType {
  id: string
  name: string
  welcome_message: string
  system_prompt?: string
  widget_color: string
  widget_icon?: string
  widget_logo?: string
  widget_position: string
  sheet_url?: string
  is_active: boolean
  last_synced_at?: string
}

// Parse gradient string
const parseGradient = (gradientStr: string) => {
  const defaultResult = { angle: '135deg', startColor: '#10b981', endColor: '#059669' }
  if (!gradientStr?.startsWith('linear-gradient')) return defaultResult
  try {
    const match = gradientStr.match(/linear-gradient\((\d+deg),\s*(#[a-fA-F0-9]{6})\s*\d*%?,\s*(#[a-fA-F0-9]{6})\s*\d*%?\)/)
    if (match) return { angle: match[1], startColor: match[2], endColor: match[3] }
  } catch {}
  return defaultResult
}

export default function BotSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string

  const [bot, setBot] = useState<BotType | null>(null)
  const [name, setName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  
  // Color states
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>('solid')
  const [widgetColor, setWidgetColor] = useState('#16a34a')
  const [widgetGradient, setWidgetGradient] = useState(GRADIENT_PRESETS[0].value)
  const [gradientType, setGradientType] = useState<'preset' | 'custom'>('preset')
  const [customStartColor, setCustomStartColor] = useState('#10b981')
  const [customEndColor, setCustomEndColor] = useState('#059669')
  const [customAngle, setCustomAngle] = useState('135deg')
  
  // Widget states
  const [widgetIcon, setWidgetIcon] = useState('bi-chat-left-text')
  const [widgetLogo, setWidgetLogo] = useState('')
  const [widgetPosition, setWidgetPosition] = useState('bottom-right')
  const [sheetUrl, setSheetUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  
  // UI states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearch, setIconSearch] = useState('')

  const generateCustomGradient = () => {
    return `linear-gradient(${customAngle}, ${customStartColor} 0%, ${customEndColor} 100%)`
  }

  const getCurrentGradient = () => {
    return gradientType === 'custom' ? generateCustomGradient() : widgetGradient
  }

  const currentStyle = colorMode === 'gradient'
    ? { background: getCurrentGradient() }
    : { backgroundColor: widgetColor }

  useEffect(() => {
    loadBot()
  }, [botId])

  const loadBot = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/dashboard')
        return
      }

      setBot(data)
      setName(data.name)
      setWelcomeMessage(data.welcome_message)
      setSystemPrompt(data.system_prompt || '')
      setWidgetIcon(data.widget_icon || 'bi-chat-left-text')
      setWidgetLogo(data.widget_logo || '')
      setWidgetPosition(data.widget_position || 'bottom-right')
      setSheetUrl(data.sheet_url || '')
      setIsActive(data.is_active)

      if (data.widget_color?.startsWith('linear-gradient')) {
        setColorMode('gradient')
        const isPreset = GRADIENT_PRESETS.some(p => p.value === data.widget_color)
        if (isPreset) {
          setGradientType('preset')
          setWidgetGradient(data.widget_color)
        } else {
          setGradientType('custom')
          const parsed = parseGradient(data.widget_color)
          setCustomStartColor(parsed.startColor)
          setCustomEndColor(parsed.endColor)
          setCustomAngle(parsed.angle)
        }
      } else {
        setColorMode('solid')
        setWidgetColor(data.widget_color || '#16a34a')
      }
    } catch (error) {
      console.error('Error loading bot:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB')
      return
    }

    setUploadingLogo(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${botId}-logo-${Date.now()}.${fileExt}`
      const filePath = `bot-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('bot-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('bot-assets')
        .getPublicUrl(filePath)

      setWidgetLogo(publicUrl)
      setSuccess('Logo uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error uploading logo:', err)
      setError('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      let finalColor = widgetColor
      if (colorMode === 'gradient') {
        finalColor = gradientType === 'custom' ? generateCustomGradient() : widgetGradient
      }

      const { error } = await supabase
        .from('bots')
        .update({
          name,
          welcome_message: welcomeMessage,
          system_prompt: systemPrompt || null,
          widget_color: finalColor,
          widget_icon: widgetIcon,
          widget_logo: widgetLogo || null,
          widget_position: widgetPosition,
          sheet_url: sheetUrl || null,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', botId)

      if (error) throw error

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSyncSheet = async () => {
    if (!sheetUrl.trim()) {
      setError('Please enter a Google Sheet URL first')
      return
    }

    setIsSyncing(true)
    setError('')

    try {
      const response = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, sheetUrl: sheetUrl.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        await supabase
          .from('bots')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', botId)

        setSuccess(`Sheet synced successfully! ${data.count || ''} entries imported.`)
        loadBot()
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.error || 'Failed to sync sheet')
      }
    } catch (error) {
      console.error('Error syncing sheet:', error)
      setError('Failed to sync sheet')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This will delete the bot and all its data permanently.')) {
      return
    }

    try {
      await supabase.from('messages').delete().eq('bot_id', botId)
      await supabase.from('knowledge_base').delete().eq('bot_id', botId)
      const { error } = await supabase.from('bots').delete().eq('id', botId)
      if (error) throw error
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to delete bot')
    }
  }

  const downloadTemplate = () => {
    const csv = [
      ['Question', 'Answer', 'Category'],
      ['What are your opening hours?', 'We are open Mon-Fri 9am-5pm', 'General'],
      ['How do I reset my password?', 'Use the "Forgot password" link on the sign-in page', 'Account'],
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'knowledge-base-template.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const response = await fetch('/api/sheets/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, csvData: text }),
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result.error || 'Failed to upload CSV')
        return
      }

      setSuccess('CSV uploaded successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to read CSV')
    }
  }

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.name.toLowerCase().includes(iconSearch.toLowerCase())
  )

  const selectedIcon = AVAILABLE_ICONS.find(icon => icon.value === widgetIcon) || AVAILABLE_ICONS[0]

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

  if (!bot) return null

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push(`/dashboard/bot/${botId}`)}
              className="flex items-center space-x-2 text-white/60 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Bot</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 font-medium">Settings</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">Bot Settings</h1>
          <p className="text-white/40 mt-2">Configure your chatbot&apos;s appearance and behavior</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Basic Settings */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.08] bg-gradient-to-r from-green-600/10 to-emerald-600/10">
              <div className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Basic Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Bot Name */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Bot Name</label>
                <div className="flex items-center w-full bg-white/[0.03] border border-white/[0.08] h-12 rounded-xl overflow-hidden pl-4 gap-3 focus-within:border-green-500/50 transition-colors">
                  <Bot className="w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full h-full pr-4"
                    required
                  />
                </div>
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Welcome Message</label>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-green-500/50 transition-colors">
                  <div className="flex items-start pl-4 pt-3 gap-3">
                    <MessageSquare className="w-5 h-5 text-white/30 mt-0.5" />
                    <textarea
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      rows={3}
                      className="bg-transparent text-white placeholder-white/30 outline-none text-sm w-full pr-4 pb-3 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">System Prompt (AI Instructions)</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={5}
                  placeholder="Enter instructions for how the AI should behave..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white placeholder-white/30 outline-none text-sm resize-none focus:border-green-500/50 transition-colors"
                />
                <p className="text-xs text-white/30 mt-1">Define how your bot should respond to users.</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Bot Active</p>
                  <p className="text-xs text-white/40 mt-1">When inactive, bot won&apos;t respond</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-green-600' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.08] bg-gradient-to-r from-green-600/10 to-emerald-600/10">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Appearance</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Color Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Color Style</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setColorMode('solid')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      colorMode === 'solid'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm text-white font-medium">Solid Color</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('gradient')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      colorMode === 'gradient'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm text-white font-medium">Gradient</span>
                  </button>
                </div>
              </div>

              {/* Solid Color Picker */}
              {colorMode === 'solid' && (
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3">Widget Color</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setWidgetColor(color)}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          widgetColor === color 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      className="w-12 h-12 border-2 border-white/[0.08] rounded-xl cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-green-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Gradient Picker */}
              {colorMode === 'gradient' && (
                <div className="space-y-4">
                  {/* Gradient Type Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-3">Gradient Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGradientType('preset')}
                        className={`p-3 rounded-xl border-2 text-sm transition-all ${
                          gradientType === 'preset'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-white/[0.08] text-white/60 hover:border-white/20'
                        }`}
                      >
                        Use Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setGradientType('custom')}
                        className={`p-3 rounded-xl border-2 text-sm transition-all ${
                          gradientType === 'custom'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-white/[0.08] text-white/60 hover:border-white/20'
                        }`}
                      >
                        Custom Colors
                      </button>
                    </div>
                  </div>

                  {/* Gradient Presets */}
                  {gradientType === 'preset' && (
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-3">Gradient Presets</label>
                      <div className="grid grid-cols-4 gap-3">
                        {GRADIENT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setWidgetGradient(preset.value)}
                            className={`h-14 rounded-xl border-2 transition-all ${
                              widgetGradient === preset.value
                                ? 'border-green-500 ring-2 ring-green-500/30'
                                : 'border-white/[0.08] hover:border-white/20'
                            }`}
                            style={{ background: preset.value }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Gradient */}
                  {gradientType === 'custom' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Start Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={customStartColor}
                              onChange={(e) => setCustomStartColor(e.target.value)}
                              className="w-12 h-12 border-2 border-white/[0.08] rounded-xl cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={customStartColor}
                              onChange={(e) => setCustomStartColor(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-mono text-sm outline-none focus:border-green-500/50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">End Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={customEndColor}
                              onChange={(e) => setCustomEndColor(e.target.value)}
                              className="w-12 h-12 border-2 border-white/[0.08] rounded-xl cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={customEndColor}
                              onChange={(e) => setCustomEndColor(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-mono text-sm outline-none focus:border-green-500/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Angle Selector */}
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Gradient Direction</label>
                        <div className="grid grid-cols-8 gap-2">
                          {GRADIENT_ANGLES.map((angle) => (
                            <button
                              key={angle.value}
                              type="button"
                              onClick={() => setCustomAngle(angle.value)}
                              className={`p-3 rounded-xl border-2 transition-all text-lg ${
                                customAngle === angle.value
                                  ? 'border-green-500 bg-green-500/10 text-white'
                                  : 'border-white/[0.08] text-white/60 hover:border-white/20'
                              }`}
                            >
                              {angle.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preview */}
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Preview</label>
                        <div 
                          className="h-14 rounded-xl border-2 border-white/[0.08]"
                          style={{ background: generateCustomGradient() }}
                        />
                      </div>

                      {/* Swap Colors */}
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            const temp = customStartColor
                            setCustomStartColor(customEndColor)
                            setCustomEndColor(temp)
                          }}
                          className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.05] transition-colors"
                        >
                          ↔ Swap Colors
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Widget Icon</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl" style={currentStyle}>
                        <i className={widgetIcon}></i>
                      </div>
                      <span className="text-white">{selectedIcon?.name}</span>
                    </div>
                    <Search className="w-5 h-5 text-white/40" />
                  </button>

                  {showIconPicker && (
                    <div className="absolute z-20 mt-2 w-full bg-gray-900 border border-white/[0.08] rounded-xl shadow-2xl">
                      <div className="p-3 border-b border-white/[0.08]">
                        <input
                          type="text"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          placeholder="Search icons..."
                          className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-white/30 outline-none focus:border-green-500/50"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-4 gap-2">
                        {filteredIcons.map((icon) => (
                          <button
                            key={icon.value}
                            type="button"
                            onClick={() => {
                              setWidgetIcon(icon.value)
                              setShowIconPicker(false)
                              setIconSearch('')
                            }}
                            className={`p-3 rounded-lg flex flex-col items-center ${
                              widgetIcon === icon.value
                                ? 'bg-green-500/20 border-2 border-green-500'
                                : 'hover:bg-white/[0.05] border-2 border-transparent'
                            }`}
                          >
                            <i className={`${icon.value} text-2xl text-white`}></i>
                            <span className="text-xs text-white/60 mt-1">{icon.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/60">Widget Logo (Optional)</label>
                  {widgetLogo && (
                    <button
                      type="button"
                      onClick={() => setWidgetLogo('')}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                {widgetLogo ? (
                  <div className="flex items-center space-x-4 p-4 border-2 border-green-500/30 rounded-xl bg-green-500/5">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden border-2 border-white/10 bg-white/5">
                      <img src={widgetLogo} alt="Widget logo" className="w-12 h-12 object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Logo uploaded</p>
                      <p className="text-xs text-white/40 mt-1">This logo will be displayed in your chat widget</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-6 text-center hover:border-green-500/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Image className="w-8 h-8 mx-auto mb-2 text-white/40" />
                      <p className="text-sm text-white/60">
                        {uploadingLogo ? 'Uploading...' : 'Click to upload logo'}
                      </p>
                      <p className="text-xs text-white/30 mt-1">PNG, JPG, SVG (max 2MB)</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Widget Position</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWidgetPosition('bottom-right')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      widgetPosition === 'bottom-right'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm text-white">Bottom Right</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWidgetPosition('bottom-left')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      widgetPosition === 'bottom-left'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm text-white">Bottom Left</span>
                  </button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
                <p className="text-sm font-medium text-white/60 mb-4">Live Preview</p>
                <div className={`flex ${widgetPosition === 'bottom-left' ? 'justify-start' : 'justify-end'}`}>
                  <div className="relative">
                    <div className="mb-3 max-w-xs">
                      <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-4">
                        <p className="text-sm text-white/80">{welcomeMessage}</p>
                      </div>
                    </div>
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                      style={{ ...currentStyle, boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)' }}
                    >
                      {widgetLogo ? (
                        <img src={widgetLogo} alt="Logo" className="w-8 h-8 object-contain" />
                      ) : (
                        <i className={`${widgetIcon} text-white text-2xl`}></i>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.08] bg-gradient-to-r from-green-600/10 to-emerald-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Knowledge Base</h2>
                </div>
                <button
                  type="button"
                  onClick={handleSyncSheet}
                  disabled={isSyncing || !sheetUrl.trim()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Google Sheet URL</label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none text-sm focus:border-green-500/50"
                />
              </div>

              {bot.last_synced_at && (
                <div className="flex items-center space-x-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                  <span>Last synced: {new Date(bot.last_synced_at).toLocaleString()}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!sheetUrl.trim()}
                  onClick={() => window.open(sheetUrl.trim(), '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Open Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download Template</span>
                </button>
                <label className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleCsvUpload}
                  />
                </label>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-400 mb-2">Setup Instructions</h4>
                <div className="text-sm text-blue-300/70 space-y-1">
                  <p>1. Make your Google Sheet public (File → Share → Anyone with link)</p>
                  <p>2. Use columns: Question | Answer | Category (optional)</p>
                  <p>3. Paste URL above and click &quot;Sync Now&quot;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-red-500/20 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-red-500/20 bg-red-500/5">
              <div className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/50 mb-4">Once you delete a bot, there is no going back. All data will be permanently removed.</p>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete Bot
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}