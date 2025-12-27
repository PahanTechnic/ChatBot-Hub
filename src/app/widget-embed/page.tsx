'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { FloatingChatButton } from '@/components/chat/FloatingChatButton'


function WidgetEmbedContent() {
  const searchParams = useSearchParams()
  const botId = searchParams.get('botId')

  if (!botId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Bot ID is required</p>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-transparent">
      <FloatingChatButton botId={botId} />
    </div>
  )
}

export default function WidgetEmbedPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-transparent" />}>
      <WidgetEmbedContent />
    </Suspense>
  )
}