// app/api/sheets/route.ts
// This API is used for "Check Data Set" button in ChatWidget
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Extract spreadsheet ID from URL
function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

// Test Google Sheet connection
async function testGoogleSheetConnection(sheetUrl: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const spreadsheetId = extractSpreadsheetId(sheetUrl)
    if (!spreadsheetId) return { success: false, count: 0, error: 'Invalid URL' }

    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`
    
    const response = await fetch(csvUrl, { 
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    
    if (!response.ok) {
      return { success: false, count: 0, error: 'Cannot access sheet' }
    }

    const csvText = await response.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    const dataRows = lines.length > 1 ? lines.length - 1 : 0

    return { success: true, count: dataRows }
  } catch (error) {
    return { success: false, count: 0, error: 'Connection failed' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const botId = searchParams.get('botId')

    if (!botId) {
      return NextResponse.json(
        { success: false, error: 'Bot ID is required' },
        { status: 400 }
      )
    }

    // Get bot details
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('sheet_url, name')
      .eq('id', botId)
      .single()

    if (botError || !bot) {
      return NextResponse.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      )
    }

    // Check knowledge base count (CSV uploaded data)
    const { count: kbCount } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true })
      .eq('bot_id', botId)
      .eq('is_active', true)

    // If Google Sheet URL exists, test connection
    if (bot.sheet_url) {
      const sheetResult = await testGoogleSheetConnection(bot.sheet_url)
      
      return NextResponse.json({
        success: true,
        dataSource: 'google_sheets',
        sheetsOnline: sheetResult.success,
        sheetsCount: sheetResult.count,
        knowledgeBaseCount: kbCount || 0,
        message: sheetResult.success 
          ? `Google Sheets: ${sheetResult.count} rows (Online)`
          : `Google Sheets: Offline - Using Knowledge Base: ${kbCount || 0} entries`
      })
    }

    // No sheet URL - return knowledge base info only
    return NextResponse.json({
      success: true,
      dataSource: 'knowledge_base',
      sheetsOnline: false,
      sheetsCount: 0,
      knowledgeBaseCount: kbCount || 0,
      count: kbCount || 0,
      message: kbCount && kbCount > 0 
        ? `Knowledge Base: ${kbCount} entries (from CSV)`
        : 'No data configured. Upload a CSV or connect Google Sheets.'
    })
  } catch (error) {
    console.error('Error in sheets API:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}