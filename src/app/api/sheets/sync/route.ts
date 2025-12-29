// app/api/sheets/sync/route.ts
// This API saves Google Sheet URL to bot and verifies connection
// It does NOT save data to knowledge_base (Google Sheets are read directly)
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

// Verify Google Sheet is accessible and count rows
async function verifyGoogleSheet(sheetUrl: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const spreadsheetId = extractSpreadsheetId(sheetUrl)
    if (!spreadsheetId) {
      return { success: false, count: 0, error: 'Invalid Google Sheets URL' }
    }

    const exportUrls = [
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`,
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1`,
    ]

    let response: Response | null = null

    for (const csvUrl of exportUrls) {
      try {
        response = await fetch(csvUrl, { 
          cache: 'no-store',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        if (response.ok) break
        response = null
      } catch {
        response = null
      }
    }

    if (!response || !response.ok) {
      return { 
        success: false, 
        count: 0, 
        error: 'Cannot access Google Sheet. Make sure it is set to "Anyone with the link can view".' 
      }
    }

    const csvText = await response.text()
    if (!csvText || csvText.trim().length === 0) {
      return { success: false, count: 0, error: 'Google Sheet is empty' }
    }

    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return { success: false, count: 0, error: 'Sheet needs at least a header row and one data row' }
    }

    // Check if required columns exist
    const headers = lines[0].toLowerCase()
    if (!headers.includes('question') || !headers.includes('answer')) {
      return { 
        success: false, 
        count: 0, 
        error: 'Sheet must have "Question" and "Answer" columns' 
      }
    }

    const dataRowCount = lines.length - 1 // Exclude header row

    return { success: true, count: dataRowCount }
  } catch (error) {
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Failed to verify sheet' 
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { botId, sheetUrl } = await request.json()

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      )
    }

    // Verify bot exists
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id, user_id')
      .eq('id', botId)
      .single()

    if (botError || !bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      )
    }

    // If sheetUrl is empty, clear the sheet URL
    if (!sheetUrl || sheetUrl.trim() === '') {
      await supabase
        .from('bots')
        .update({ 
          sheet_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', botId)

      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Google Sheet URL removed. Bot will use Knowledge Base data if available.'
      })
    }

    // Verify Google Sheet is accessible
    const verifyResult = await verifyGoogleSheet(sheetUrl)

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error },
        { status: 400 }
      )
    }

    // Update bot's sheet_url and last_synced_at
    const { error: updateError } = await supabase
      .from('bots')
      .update({ 
        sheet_url: sheetUrl.trim(),
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', botId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save sheet URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: verifyResult.count,
      message: `Google Sheet connected! Found ${verifyResult.count} data rows. Sheet will be read directly when users chat.`
    })
  } catch (error) {
    console.error('Error in sync API:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to sync sheet'
    }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}