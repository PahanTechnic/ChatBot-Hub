// app/api/bot/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase client (server-side safe)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/bot/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Next.js 15 requires awaiting params
    const { id: botId } = await context.params

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      )
    }

    // Fetch bot data
    const { data, error } = await supabase
      .from('bots')
      .select(
        'id, name, widget_color, widget_icon, widget_position, is_active, updated_at'
      )
      .eq('id', botId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Bot not found or inactive' },
        { status: 404 }
      )
    }

    // Success response
    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        widget_color: data.widget_color ?? '#16a34a',
        widget_icon: data.widget_icon ?? 'chat-dots',
        widget_position: data.widget_position ?? 'bottom-right',
        is_active: data.is_active,
        updated_at: data.updated_at
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      }
    )
  } catch (err) {
    console.error('GET /api/bot/[id] error:', err)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS (CORS support for widget)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
