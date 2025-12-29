/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, Loader2, User, Bot, Menu, Smile, ChevronLeft, ChevronDown, Database, Sparkles, Paperclip, Image as ImageIcon, MoreVertical, CheckCheck } from 'lucide-react'

interface ChatWidgetProps {
  botId: string
  botName: string
  welcomeMessage: string
  color?: string
  icon?: string
  logo?: string
  sheetUrl?: string
  position?: 'bottom-right' | 'bottom-left'
  onClose: () => void
  embedded?: boolean
  homeUrl?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DropdownPosition {
  top: number
  left?: number
  right?: number
}

const ICON_MAP: Record<string, string> = {
  'chat-dots': 'bi-chat-left-text',
  'robot': 'bi-robot',
  'person-circle': 'bi-person-circle',
  'headset': 'bi-headset',
  'question-circle': 'bi-question-circle',
  'info-circle': 'bi-info-circle',
  'lightbulb': 'bi-lightbulb',
  'heart': 'bi-heart',
  'star': 'bi-star',
  'bell': 'bi-bell',
  'envelope': 'bi-envelope',
  'gift': 'bi-gift',
  'rocket': 'bi-rocket-takeoff',
  'shield-check': 'bi-shield-check',
  'telephone': 'bi-telephone',
  'cart': 'bi-cart',
  'book': 'bi-book',
}

// Dropdown Menu Component with Portal
function DropdownMenu({
  isOpen,
  onClose,
  menuButtonRef,
  position,
  onCheckDataSet,
  onPopOut,
  onGoHome,
  onCloseChat,
}: {
  isOpen: boolean
  onClose: () => void
  menuButtonRef: React.RefObject<HTMLButtonElement | null> // ✅ FIX
  position: 'bottom-right' | 'bottom-left'
  onCheckDataSet: () => void
  onPopOut: () => void
  onGoHome: () => void
  onCloseChat: () => void
}) {
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && menuButtonRef.current) {
      const buttonRect = menuButtonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // Position below the button with some gap
      const newPosition: DropdownPosition = {
        top: buttonRect.bottom + 8,
      }

      // Handle horizontal positioning based on widget position
      if (viewportWidth < 640) {
        // Mobile: center the dropdown
        // Position will be handled by CSS transform
      } else if (position === 'bottom-right') {
        newPosition.right = window.innerWidth - buttonRect.right
      } else {
        newPosition.left = buttonRect.left
      }

      setDropdownPosition(newPosition)
    }
  }, [isOpen, menuButtonRef, position])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const firstButton = dropdownRef.current.querySelector('button')
      firstButton?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const menuContent = (
    <>
      {/* Backdrop */}
      <div
        className="chat-dropdown-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className="chat-dropdown-menu"
        style={{
          top: dropdownPosition.top,
          ...(window.innerWidth >= 640
            ? position === 'bottom-right'
              ? { right: dropdownPosition.right }
              : { left: dropdownPosition.left }
            : {}
          ),
        }}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
      >
        {/* Check Data Set */}
        <button
          onClick={onCheckDataSet}
          className="chat-dropdown-item"
          role="menuitem"
        >
          <div className="chat-dropdown-icon chat-dropdown-icon-blue">
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">Check Data Set</span>
            <span className="text-xs text-gray-500">Verify connection status</span>
          </div>
        </button>

        <div className="chat-dropdown-divider" role="separator" />

        {/* Pop Out */}
        <button
          onClick={onPopOut}
          className="chat-dropdown-item"
          role="menuitem"
        >
          <div className="chat-dropdown-icon chat-dropdown-icon-purple">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-600">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">Pop Out Widget</span>
            <span className="text-xs text-gray-500">Open in new window</span>
          </div>
        </button>

        {/* Go Home */}
        <button
          onClick={onGoHome}
          className="chat-dropdown-item"
          role="menuitem"
        >
          <div className="chat-dropdown-icon chat-dropdown-icon-green">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" className="text-green-600">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">Go to Home</span>
            <span className="text-xs text-gray-500">Visit main website</span>
          </div>
        </button>

        <div className="chat-dropdown-divider" role="separator" />

        {/* Close Chat */}
        <button
          onClick={onCloseChat}
          className="chat-dropdown-item"
          role="menuitem"
        >
          <div className="chat-dropdown-icon chat-dropdown-icon-red">
            <X className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">Close Chat</span>
            <span className="text-xs text-gray-500">End this session</span>
          </div>
        </button>
      </div>
    </>
  )

  // Use portal to render dropdown at document body level
  if (typeof document !== 'undefined') {
    return createPortal(menuContent, document.body)
  }

  return null
}

export default function ChatWidget({
  botId,
  botName,
  welcomeMessage,
  color = '#10b981',
  icon,
  logo,
  sheetUrl,
  position = 'bottom-right',
  onClose,
  embedded = false,
  homeUrl = 'https://example.com'
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

const appName = process.env.NEXT_PUBLIC_APP_NAME

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add body class when dropdown is open
  useEffect(() => {
    if (showMenu) {
      document.body.classList.add('chat-dropdown-open')
    } else {
      document.body.classList.remove('chat-dropdown-open')
    }

    return () => {
      document.body.classList.remove('chat-dropdown-open')
    }
  }, [showMenu])

  const closeMenu = useCallback(() => {
    setShowMenu(false)
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')
    setIsSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          botId: botId,
          sessionId: sessionId
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'මට ඒ ගැන තොරතුරු නැත.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'සමාවෙන්න, දෝෂයක් ඇති වුණා. නැවත උත්සාහ කරන්න. ⚠️',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const checkDataSet = async () => {
    closeMenu()

    if (!sheetUrl) {
      const noSheetMessage: Message = {
        id: `info-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Data sheet URL එකක් set කර නැත.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, noSheetMessage])
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(`/api/sheets?range=A1:Z100&botId=${botId}`)
      const data = await response.json()

      if (data.success) {
        const botMessage: Message = {
          id: `sheets-${Date.now()}`,
          role: 'assistant',
          content: `✅ Data set Online!\n📊 ${data.count} rows loaded successfully.\n🤖 ${botName} is ready to help!`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Data set Offline!\n⚠️ Could not connect to data source.\n${botName} is operating in limited mode.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const popOutWidget = () => {
    closeMenu()

    const width = 450
    const height = 650
    const left = window.screen.width - width - 50
    const top = window.screen.height - height - 100

    window.open(
      window.location.href,
      `${botName} Chat`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

  const goToHome = () => {
    closeMenu()
    window.location.href = homeUrl
  }

  const handleCloseChat = () => {
    closeMenu()
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const displayLogo = logo && logo.trim().length > 0
  const isCustomIcon = icon?.startsWith('http')
  const displayIcon = !displayLogo && isCustomIcon ? icon : null
  const iconClass = ICON_MAP[icon || 'chat-dots'] || ICON_MAP['chat-dots']
  const displayBootstrapIcon = !displayLogo && !displayIcon

  const extractBaseColor = (colorString: string) => {
    if (colorString.includes('linear-gradient')) {
      const match = colorString.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/)
      return match ? match[0] : '#10b981'
    }
    return colorString
  }

  const baseColor = extractBaseColor(color)

  const isGradient = color.startsWith('linear-gradient')
  const headerStyle = isGradient
    ? { background: color }
    : { background: `linear-gradient(135deg, ${baseColor}f0, ${baseColor})` }

  const buttonBgStyle = isGradient
    ? { background: color }
    : { background: `linear-gradient(135deg, ${baseColor}, ${baseColor}dd)` }

  return (
    <>
      {/* Bootstrap Icons CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
      />

      <div className={`chat-widget-container ${position === 'bottom-right' ? 'chat-widget-bottom-right' : 'chat-widget-bottom-left'} animate-slideUp`}>
        <div className="glass-morphism w-full sm:w-[350px] md:w-[380px] lg:w-[420px] xl:w-[460px] 2xl:w-[500px] h-[calc(100vh-10rem)] sm:h-[480px] md:h-[530px] lg:h-[560px] xl:h-[580px] 2xl:h-[660px] overflow-hidden flex flex-col max-w-[calc(100vw-2rem)]">
          {/* Premium Header */}
          <div
            className="chat-header-section px-2.5 sm:px-3 md:px-4 lg:px-5 py-2.5 sm:py-3 md:py-3.5 lg:py-4 flex items-center justify-between shrink-0 backdrop-blur-xl border-b border-white/20"
            style={headerStyle}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white hover:bg-white/20 p-1 sm:p-1.5 md:p-2 rounded-lg lg:rounded-xl transition-all duration-300 active:scale-95 hover:-rotate-90 shrink-0"
              >
                <ChevronLeft className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5" />
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 min-w-0 flex-1">
                <div
                  className="relative w-7 sm:w-8 md:w-9 lg:w-10 h-7 sm:h-8 md:h-9 lg:h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg ring-2 ring-white/30 shrink-0"
                >
                  {displayLogo ? (
                    <img src={logo} alt="Bot" className="w-7 sm:w-8 md:w-9 lg:w-10 h-7 sm:h-8 md:h-9 lg:h-10 object-contain rounded-full" />
                  ) : displayIcon ? (
                    <img src={displayIcon} alt="Bot" className="w-4 sm:w-6 md:w-6.5 lg:w-7 h-4 sm:h-5 md:h-5.5 lg:h-6 object-contain rounded-full" />
                  ) : displayBootstrapIcon ? (
                    <i className={`bi ${iconClass} text-white text-base sm:text-lg md:text-lg lg:text-xl`}></i>
                  ) : (
                    <Bot className="w-3.5 sm:w-4 md:w-4.5 lg:w-5 h-3.5 sm:h-4 md:h-4.5 lg:h-5 text-white" />
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 lg:w-3 h-2 sm:h-2.5 lg:h-3 bg-green-400 rounded-full border-2 border-white shadow-lg pulse-dot"></div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold text-xs sm:text-sm md:text-[15px] lg:text-base leading-tight flex items-center gap-1 sm:gap-1.5 truncate">
                    <span className="truncate">{botName}</span>
                    <Sparkles className="w-2.5 sm:w-3 md:w-3.5 lg:w-4 h-2.5 sm:h-3 md:h-3.5 lg:h-4 text-yellow-300 shrink-0" />
                  </h3>
                  <p className="text-white/80 text-[9px] sm:text-[10px] md:text-xs font-medium truncate">Always here to help</p>
                </div>
              </div>
            </div>

            <button
              ref={menuButtonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="chat-menu-button text-white/90 hover:text-white hover:bg-white/20 p-1 sm:p-1.5 md:p-2 rounded-lg lg:rounded-xl transition-all duration-300 active:scale-95 shrink-0"
              aria-expanded={showMenu}
              aria-haspopup="true"
              id="menu-button"
            >
              <MoreVertical className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5" />
            </button>
          </div>

          {/* Dropdown Menu Portal */}
          <DropdownMenu
            isOpen={showMenu}
            onClose={closeMenu}
            menuButtonRef={menuButtonRef}
            position={position}
            onCheckDataSet={checkDataSet}
            onPopOut={popOutWidget}
            onGoHome={goToHome}
            onCloseChat={handleCloseChat}
          />

          {/* Messages Area */}
          <div className="chat-message-area flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-2.5 sm:space-y-3 md:space-y-3.5 lg:space-y-4 chat-bg">
            {/* Date Separator */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 py-1 sm:py-1.5 md:py-2">
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
                <div className="w-1.5 sm:w-1.5 md:w-2 h-1.5 sm:h-1.5 md:h-2 rounded-full bg-green-500 pulse-dot"></div>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-600">Connected</span>
              </div>
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 animate-messageSlide ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="shrink-0 w-7 sm:w-8 md:w-9 lg:w-10 h-7 sm:h-8 md:h-9 lg:h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50 relative group"
                    style={headerStyle}
                  >
                    {displayLogo ? (
                      <img src={logo} alt="Bot" className="w-7 sm:w-8 md:w-9 lg:w-10 h-7 sm:h-8 md:h-9 lg:h-10 object-contain rounded-full" />
                    ) : displayIcon ? (
                      <img src={displayIcon} alt="Bot" className="w-4 sm:w-6 md:w-6.5 lg:w-7 h-4 sm:h-5 md:h-5.5 lg:h-6 object-contain rounded-full" />
                    ) : displayBootstrapIcon ? (
                      <i className={`bi ${iconClass} text-white text-base sm:text-lg md:text-lg lg:text-xl`}></i>
                    ) : (
                      <Bot className="w-3.5 sm:w-4 md:w-4.5 lg:w-5 h-3.5 sm:h-4 md:h-4.5 lg:h-5 text-white" />
                    )}
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[82%] md:max-w-[80%] lg:max-w-[85%]`}>
                  <div
                    className={`message-bubble ${msg.role === 'user'
                      ? 'user-message text-white shadow-lg'
                      : 'bot-message bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50 shadow-md'
                      }`}
                    style={msg.role === 'user' ? buttonBgStyle : {}}
                  >
                    <p className="text-[12px] sm:text-[13px] md:text-sm lg:text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-word font-medium">{msg.content}</p>
                    <div className={`flex items-center gap-0.5 sm:gap-1 md:gap-1.5 mt-1 sm:mt-1.5 md:mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-medium ${msg.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'user' && (
                        <CheckCheck className="w-2.5 sm:w-3 md:w-3.5 h-2.5 sm:h-3 md:h-3.5 text-white/70" />
                      )}
                    </div>
                  </div>

                  {msg.role === 'assistant' && (
                    <div className="hidden md:flex gap-1 sm:gap-1.5 lg:gap-2 mt-1 sm:mt-1.5 lg:mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-400 hover:text-green-500 hover:bg-green-50 transition-all p-0.5 sm:p-1 lg:p-1.5 rounded-md lg:rounded-lg" title="Good response">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-3 sm:h-3 md:w-[13px] md:h-[13px] lg:w-3.5 lg:h-3.5">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-0.5 sm:p-1 lg:p-1.5 rounded-md lg:rounded-lg" title="Bad response">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-3 sm:h-3 md:w-[13px] md:h-[13px] lg:w-3.5 lg:h-3.5">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 animate-messageSlide">
                <div
                  className="w-7 sm:w-8 md:w-9 lg:w-10 h-7 sm:h-8 md:h-9 lg:h-10 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/50"
                  style={headerStyle}
                >
                  <Bot className="w-3.5 sm:w-4 md:w-4.5 lg:w-5 h-3.5 sm:h-4 md:h-4.5 lg:h-5 text-white animate-pulse" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl rounded-tl-md px-3 sm:px-3.5 md:px-4 lg:px-5 py-2.5 sm:py-3 md:py-3.5 lg:py-4 border border-gray-200/50 shadow-md">
                  <div className="flex gap-1 sm:gap-1.5 md:gap-2">
                    <div className="typing-dot"></div>
                    <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="chat-input-section border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <div className="px-2 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 lg:py-4">
              <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 items-end">
                <div className="flex-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl sm:rounded-2xl lg:rounded-3xl border border-gray-200/50 focus-within:border-gray-300 focus-within:bg-white/80 transition-all shadow-sm hover:shadow-md">
                  <div className="flex items-center px-2.5 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent text-[12px] sm:text-[13px] md:text-sm lg:text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50 font-medium"
                      disabled={isSending}
                      autoComplete="off"
                    />

                    <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 items-center">
                      <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 sm:p-1.5 md:p-2 rounded-lg lg:rounded-xl transition-all hidden md:block" title="Attach file">
                        <Paperclip className="w-3.5 sm:w-4 md:w-[17px] lg:w-[18px] h-3.5 sm:h-4 md:h-[17px] lg:h-[18px]" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 sm:p-1.5 md:p-2 rounded-lg lg:rounded-xl transition-all hidden md:block" title="Upload image">
                        <ImageIcon className="w-3.5 sm:w-4 md:w-[17px] lg:w-[18px] h-3.5 sm:h-4 md:h-[17px] lg:h-[18px]" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 sm:p-1.5 md:p-2 rounded-lg lg:rounded-xl transition-all" title="Add emoji">
                        <Smile className="w-3.5 sm:w-4 md:w-[17px] lg:w-[18px] h-3.5 sm:h-4 md:h-[17px] lg:h-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className="send-button text-white rounded-xl lg:rounded-2xl p-2.5 sm:p-3 md:p-3.5 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 hover:shadow-xl shrink-0 flex items-center justify-center"
                  style={!inputMessage.trim() || isSending ? {} : buttonBgStyle}
                >
                  {isSending ? (
                    <Loader2 className="w-4 sm:w-[17px] md:w-[18px] lg:w-5 h-4 sm:h-[17px] md:h-[18px] lg:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 sm:w-[17px] md:w-[18px] lg:w-5 h-4 sm:h-[17px] md:h-[18px] lg:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-2 sm:px-3 md:px-4 lg:px-5 pb-2 sm:pb-2.5 md:pb-3 lg:pb-4 flex items-center justify-center">
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-medium">
                <div
                  className="w-3.5 sm:w-4 md:w-4.5 lg:w-5 h-3.5 sm:h-4 md:h-4.5 lg:h-5 rounded-md lg:rounded-lg flex items-center justify-center shadow-sm"
                  style={headerStyle}
                >
                  <Sparkles className="w-2 sm:w-2.5 md:w-3 lg:w-3 h-2 sm:h-2.5 md:h-3 lg:h-3 text-white" />
                </div>
                <span className="text-[9px] sm:text-[10px] md:text-xs">Powered by <span className="font-bold text-gray-700">{appName}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Pointer Triangle */}
        <div
          className={`hidden sm:block absolute ${position === 'bottom-right' ? 'right-7 sm:right-8' : 'left-7 sm:left-8'} -bottom-3 pointer-triangle`}
        />
      </div>

      <style>{`
        /* Glass Morphism */
        .glass-morphism {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 15px 50px -10px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        @media (min-width: 640px) {
          .glass-morphism {
            border-radius: 22px;
          }
        }

        @media (min-width: 768px) {
          .glass-morphism {
            border-radius: 24px;
          }
        }

        @media (min-width: 1024px) {
          .glass-morphism {
            border-radius: 28px;
          }
        }

        /* Animations */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-messageSlide {
          animation: messageSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Chat Background */
        .chat-bg {
          background: 
            linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          background-image: 
            radial-gradient(circle at 20px 20px, rgba(148, 163, 184, 0.03) 1px, transparent 0),
            radial-gradient(circle at 80px 80px, rgba(148, 163, 184, 0.03) 1px, transparent 0);
          background-size: 100px 100px;
        }

        /* Message Bubbles */
        .message-bubble {
          padding: 10px 14px;
          border-radius: 14px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @media (min-width: 640px) {
          .message-bubble {
            padding: 11px 15px;
            border-radius: 16px;
          }
        }

        @media (min-width: 768px) {
          .message-bubble {
            padding: 12px 16px;
            border-radius: 17px;
          }
        }

        @media (min-width: 1024px) {
          .message-bubble {
            padding: 14px 18px;
            border-radius: 18px;
          }
        }

        .user-message {
          border-radius: 14px 14px 4px 14px;
        }

        .bot-message {
          border-radius: 14px 14px 14px 4px;
        }

        @media (min-width: 1024px) {
          .user-message {
            border-radius: 18px 18px 4px 18px;
          }
          
          .bot-message {
            border-radius: 18px 18px 18px 4px;
          }
        }

        .message-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.15);
        }

        /* Typing Animation */
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${baseColor};
          animation: typing 1.4s infinite ease-in-out;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        /* Pulse Dot */
        .pulse-dot {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Send Button */
        .send-button:not(:disabled):hover {
          transform: scale(1.05) rotate(5deg);
        }

        .send-button:not(:disabled):active {
          transform: scale(0.95) rotate(-5deg);
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.5);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${baseColor};
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${baseColor}dd;
        }

        /* Pointer Triangle */
        .pointer-triangle {
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-top: 12px solid rgba(255, 255, 255, 0.98);
          filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.08));
        }

        /* Focus styles */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid ${baseColor};
          outline-offset: 2px;
        }
      `}</style>
    </>
  )
}