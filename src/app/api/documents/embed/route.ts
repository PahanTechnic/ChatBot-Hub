import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { storeDocumentWithEmbedding } from '@/lib/embeddings'

export async function POST(request: NextRequest) {
  try {
    const { botId, content, metadata = {} } = await request.json()

    if (!botId || !content) {
      return NextResponse.json({ error: 'BotId and content are required' }, { status: 400 })
    }

    // Verify bot exists
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .single()

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    // Store document and create embedding
    const document = await storeDocumentWithEmbedding(botId, content, metadata)

    return NextResponse.json({
      success: true,
      documentId: document.id,
    })
  } catch (error) {
    console.error('Error in documents embed API:', error)
    return NextResponse.json({ error: 'Failed to create embedding' }, { status: 500 })
  }
}