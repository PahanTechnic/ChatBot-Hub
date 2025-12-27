/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import ChatWidget from './ChatWidget'

interface FloatingChatButtonProps {
  botId: string
}

export function FloatingChatButton({ botId }: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [bot, setBot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    const loadBot = async () => {
      try {
        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('id', botId)
          .eq('is_active', true)
          .single()

        if (!error && data) {
          setBot(data)
        }
      } catch (error) {
        console.error('Error loading bot:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBot()

    const channel = supabase
      .channel('bot-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bots',
          filter: `id=eq.${botId}`
        },
        (payload) => {
          if (payload.new) {
            setBot(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [botId])

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 640) return

    const showTooltipBriefly = () => {
      if (isOpen || isHovered) return
      setShowTooltip(true)
      setTimeout(() => {
        setShowTooltip(false)
      }, 5000)
    }

    const initialTimer = setTimeout(() => {
      showTooltipBriefly()
    }, 2000)

    const intervalTimer = setInterval(() => {
      showTooltipBriefly()
    }, 30000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalTimer)
    }
  }, [isOpen, isHovered])

  useEffect(() => {
    if (isOpen || isHovered) {
      setShowTooltip(false)
    }
  }, [isOpen, isHovered])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { id, x, y }])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)

    setIsOpen(!isOpen)
    setShowTooltip(false)
  }, [isOpen])

  if (isLoading || !bot) {
    return null
  }

  // ===== SIMPLE: Only Bootstrap Icon =====
  const widgetIcon = bot.widget_icon || 'bi-chat-left-text'
  
  const widgetColor = bot.widget_color || '#10b981'

  const extractBaseColor = (color: string) => {
    if (color.includes('linear-gradient')) {
      const match = color.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/)
      return match ? match[0] : '#10b981'
    }
    return color
  }

  const baseColor = extractBaseColor(widgetColor)
  const darkerColor = `${baseColor}ee`

  const isGradient = widgetColor.startsWith('linear-gradient')
  const buttonStyle = isGradient
    ? { background: widgetColor }
    : { background: `linear-gradient(145deg, ${baseColor}, ${darkerColor})` }

  const position = bot.widget_position || 'bottom-right'
  const positionClasses = position === 'bottom-right'
    ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8'
    : 'bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8'

  return (
    <>
      {/* Bootstrap Icons CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
      />

      {/* Ambient Background Glow */}
      <div
        className="hidden lg:block fixed pointer-events-none transition-all duration-1000"
        style={{
          bottom: '2rem',
          right: position === 'bottom-right' ? '2rem' : undefined,
          left: position === 'bottom-left' ? '2rem' : undefined,
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${baseColor}15 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 40,
          opacity: isHovered ? 1 : 0.5,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      {/* Floating Orbs */}
      <div className="hidden lg:block">
        <div
          className="fixed pointer-events-none animate-orb-float-1"
          style={{
            bottom: '140px',
            right: position === 'bottom-right' ? '80px' : undefined,
            left: position === 'bottom-left' ? '80px' : undefined,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${baseColor}60, ${baseColor}20)`,
            boxShadow: `0 0 20px ${baseColor}40`,
            zIndex: 40,
          }}
        />
        <div
          className="fixed pointer-events-none animate-orb-float-2"
          style={{
            bottom: '180px',
            right: position === 'bottom-right' ? '40px' : undefined,
            left: position === 'bottom-left' ? '40px' : undefined,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${baseColor}50, ${baseColor}15)`,
            boxShadow: `0 0 15px ${baseColor}30`,
            zIndex: 40,
          }}
        />
        <div
          className="fixed pointer-events-none animate-orb-float-3"
          style={{
            bottom: '100px',
            right: position === 'bottom-right' ? '100px' : undefined,
            left: position === 'bottom-left' ? '100px' : undefined,
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${baseColor}70, ${baseColor}25)`,
            boxShadow: `0 0 12px ${baseColor}35`,
            zIndex: 40,
          }}
        />
      </div>

      {/* Main Container */}
      <div className={`fixed ${positionClasses} z-50`}>
        {/* Chat Widget */}
        {isOpen && (
          <ChatWidget
            botId={botId}
            botName={bot.name}
            welcomeMessage={bot.welcome_message}
            color={bot.widget_color}
            logo={bot.widget_logo}
            icon={bot.widget_icon}
            sheetUrl={bot.sheet_url}
            position={position}
            homeUrl={bot.home_url || 'https://yoursite.com'}
            onClose={() => setIsOpen(false)}
            embedded={false}
            name={bot.name}
          />
        )}

        {/* Button Container */}
        <div className="relative">
          {/* "Let's chat!" Tooltip */}
          {!isOpen && (
            <div
              className={`hidden sm:block absolute bottom-full mb-4 transition-all duration-500 ease-out ${position === 'bottom-right' ? 'right-0' : 'left-0'
                } ${showTooltip
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
                }`}
              onClick={() => {
                setIsOpen(true)
                setShowTooltip(false)
              }}
            >
              <div
                className="relative cursor-pointer group"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))' }}
              >
                <div
                  className="relative overflow-hidden transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${baseColor} 0%, ${darkerColor} 100%)`,
                    borderRadius: '20px',
                    padding: '14px 22px',
                    boxShadow: `
                      0 15px 40px -10px ${baseColor}50,
                      0 8px 20px -8px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.3)
                    `,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-[20px]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                    }}
                  />
                  <div
                    className="absolute top-0 left-4 right-4 h-px"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    }}
                  />
                  <div className="relative flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span
                        className="absolute inline-flex h-3 w-3 rounded-full animate-ping opacity-60"
                        style={{ backgroundColor: '#4ade80' }}
                      />
                      <span
                        className="relative inline-flex rounded-full shadow-lg"
                        style={{
                          backgroundColor: '#22c55e',
                          width: '10px',
                          height: '10px',
                          boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                        }}
                      />
                    </div>
                    <span className="text-white font-bold text-base tracking-wide whitespace-nowrap">
                      Let&apos;s chat!
                    </span>
                    <span className="text-xl animate-wave">👋</span>
                  </div>
                  <div
                    className="absolute inset-0 animate-shimmer rounded-[20px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transform: 'skewX(-20deg)',
                    }}
                  />
                  <div
                    className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full animate-sparkle-1"
                    style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                  />
                  <div
                    className="absolute bottom-3 right-6 w-1 h-1 rounded-full animate-sparkle-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                  />
                  <div
                    className="absolute top-3 left-6 w-1 h-1 rounded-full animate-sparkle-3"
                    style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                  />
                </div>
                <div
                  className={`absolute -bottom-2 ${position === 'bottom-right' ? 'right-6' : 'left-6'}`}
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: `10px solid ${darkerColor}`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Button */}
          <button
            onClick={handleClick}
            onMouseEnter={() => {
              setIsHovered(true)
              setShowTooltip(false)
            }}
            onMouseLeave={() => setIsHovered(false)}
            className="chat-fab-button relative overflow-hidden rounded-full transition-all duration-500 ease-out focus:outline-none focus-visible:ring-4"
            style={{
              ...buttonStyle,
              width: '64px',
              height: '64px',
              boxShadow: isHovered
                ? `0 20px 50px -10px ${baseColor}80, 0 10px 30px -5px ${baseColor}60`
                : `0 10px 40px -10px ${baseColor}60, 0 4px 20px -5px ${baseColor}40`,
              transform: isHovered && !isOpen ? 'scale(1.1)' : 'scale(1)',
            }}
            title={isOpen ? 'Close chat' : `Chat with ${bot.name}`}
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
            aria-expanded={isOpen}
          >
            {/* Ripple Effects */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute rounded-full bg-white/40 animate-ripple"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Glass overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/10" />

            {/* Top highlight */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1/2 h-3 bg-white/50 rounded-full blur-sm" />

            {/* ===== ICON CONTAINER - ONLY BOOTSTRAP ICON ===== */}
            <div className={`relative z-10 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
              {isOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white drop-shadow-md"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Bootstrap Icon Only */
                <i className={`bi ${widgetIcon} text-white text-3xl drop-shadow-md`}></i>
              )}
            </div>

            {/* Pulse rings */}
            {!isOpen && (
              <>
                <span
                  className="absolute inset-0 rounded-full animate-ping-slow opacity-30"
                  style={{ backgroundColor: baseColor }}
                />
                <span
                  className="absolute -inset-1 rounded-full animate-ping-slower opacity-20"
                  style={{ backgroundColor: baseColor }}
                />
              </>
            )}

            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-full transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at center, white 0%, transparent 70%)`,
                opacity: isHovered ? 0.2 : 0,
              }}
            />
          </button>

          {/* Online indicator */}
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center z-20"
            style={{ width: '18px', height: '18px' }}
          >
            <span
              className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
              style={{ backgroundColor: '#22c55e' }}
            />
            <span
              className="relative inline-flex rounded-full border-2 border-white shadow-lg"
              style={{
                backgroundColor: '#22c55e',
                width: '14px',
                height: '14px',
              }}
            />
          </span>
        </div>
      </div>

      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          25% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 0.8; }
          50% { transform: translateY(-35px) translateX(-5px) scale(0.9); opacity: 0.5; }
          75% { transform: translateY(-15px) translateX(-15px) scale(1.05); opacity: 0.7; }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.5; }
          33% { transform: translateY(-25px) translateX(-12px) scale(1.15); opacity: 0.7; }
          66% { transform: translateY(-40px) translateX(8px) scale(0.85); opacity: 0.4; }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-30px) translateX(15px) scale(1.2); opacity: 0.9; }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes ripple {
          0% { width: 0; height: 0; opacity: 0.5; }
          100% { width: 200px; height: 200px; opacity: 0; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.2; }
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes sparkle-1 {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.5); }
        }
        @keyframes sparkle-2 {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.3); }
        }
        @keyframes sparkle-3 {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(0.4); }
        }
        .animate-orb-float-1 { animation: orb-float-1 6s ease-in-out infinite; }
        .animate-orb-float-2 { animation: orb-float-2 8s ease-in-out infinite; animation-delay: 1s; }
        .animate-orb-float-3 { animation: orb-float-3 5s ease-in-out infinite; animation-delay: 2s; }
        .animate-wave { animation: wave 2.5s ease-in-out infinite; transform-origin: 70% 70%; display: inline-block; }
        .animate-shimmer { animation: shimmer 4s infinite; }
        .animate-ripple { animation: ripple 0.6s ease-out forwards; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping-slower { animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; animation-delay: 0.5s; }
        .animate-sparkle-1 { animation: sparkle-1 2s ease-in-out infinite; }
        .animate-sparkle-2 { animation: sparkle-2 2.5s ease-in-out infinite; animation-delay: 0.5s; }
        .animate-sparkle-3 { animation: sparkle-3 3s ease-in-out infinite; animation-delay: 1s; }
        .chat-fab-button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .chat-fab-button:active { transform: scale(0.95) !important; }
        .chat-fab-button:focus-visible { outline: none; }
        @media (max-width: 640px) { .chat-fab-button { width: 56px !important; height: 56px !important; } }
        @media (min-width: 1024px) { .chat-fab-button { width: 68px !important; height: 68px !important; } }
        @media (prefers-reduced-motion: reduce) {
          .animate-orb-float-1, .animate-orb-float-2, .animate-orb-float-3,
          .animate-wave, .animate-shimmer, .animate-ping-slow, .animate-ping-slower,
          .animate-sparkle-1, .animate-sparkle-2, .animate-sparkle-3 { animation: none; }
          .chat-fab-button { transition: none; }
        }
      `}</style>
    </>
  )
}