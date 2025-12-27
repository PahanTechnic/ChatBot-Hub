// app/api/sheets/upload-csv/route.ts
// This API saves CSV data to knowledge_base table
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Parse CSV text
function parseCSV(csvText: string): { question: string; answer: string; category?: string }[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  
  if (lines.length < 2) {
    throw new Error('CSV needs at least a header row and one data row')
  }

  // Parse header row
  const headerLine = lines[0]
  const headers: string[] = []
  let currentHeader = ''
  let insideQuotes = false

  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i]
    if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === ',' && !insideQuotes) {
      headers.push(currentHeader.trim().replace(/^"|"$/g, '').toLowerCase())
      currentHeader = ''
    } else {
      currentHeader += char
    }
  }
  headers.push(currentHeader.trim().replace(/^"|"$/g, '').toLowerCase())

  // Find column indices
  const questionIdx = headers.findIndex(h => 
    h === 'question' || h === 'q' || h.includes('question')
  )
  const answerIdx = headers.findIndex(h => 
    h === 'answer' || h === 'a' || h.includes('answer')
  )
  const categoryIdx = headers.findIndex(h => 
    h === 'category' || h === 'cat' || h.includes('category')
  )

  if (questionIdx === -1 || answerIdx === -1) {
    throw new Error('CSV must have "Question" and "Answer" columns. Found columns: ' + headers.join(', '))
  }

  const rows: { question: string; answer: string; category?: string }[] = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const values: string[] = []
    let currentValue = ''
    let insideQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''))
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''))

    const question = values[questionIdx]?.trim()
    const answer = values[answerIdx]?.trim()
    const category = categoryIdx !== -1 ? values[categoryIdx]?.trim() : undefined

    if (question && answer) {
      rows.push({ question, answer, category })
    }
  }

  if (rows.length === 0) {
    throw new Error('No valid data rows found in CSV')
  }

  return rows
}

export async function POST(request: NextRequest) {
  try {
    const { botId, csvData } = await request.json()

    if (!botId || !csvData) {
      return NextResponse.json(
        { error: 'Bot ID and CSV data are required' },
        { status: 400 }
      )
    }

    // Verify bot exists
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id, sheet_url')
      .eq('id', botId)
      .single()

    if (botError || !bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      )
    }

    // Parse CSV data
    let parsedData: { question: string; answer: string; category?: string }[]
    try {
      parsedData = parseCSV(csvData)
    } catch (parseError) {
      return NextResponse.json(
        { error: parseError instanceof Error ? parseError.message : 'Failed to parse CSV' },
        { status: 400 }
      )
    }

    // Delete existing knowledge base entries for this bot
    const { error: deleteError } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('bot_id', botId)

    if (deleteError) {
      console.error('Error deleting old entries:', deleteError)
    }

    // Insert new knowledge base entries
    const entries = parsedData.map((row, index) => ({
      bot_id: botId,
      question: row.question,
      answer: row.answer,
      category: row.category || null,
      priority: parsedData.length - index,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabase
      .from('knowledge_base')
      .insert(entries)

    if (insertError) {
      console.error('Error inserting entries:', insertError)
      return NextResponse.json(
        { error: 'Failed to save data: ' + insertError.message },
        { status: 500 }
      )
    }

    // Clear Google Sheet URL if exists (CSV takes priority when uploaded)
    // Actually, let's NOT clear it - user might want to switch back
    // Just update last_synced_at
    await supabase
      .from('bots')
      .update({ 
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', botId)

    // Build response message
    let message = `Successfully imported ${entries.length} entries from CSV.`
    if (bot.sheet_url) {
      message += ' Note: Google Sheet URL is still configured. Remove it in settings if you want to use only CSV data.'
    }

    return NextResponse.json({
      success: true,
      count: entries.length,
      message
    })
  } catch (error) {
    console.error('Error in upload-csv API:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process CSV'
    }, { status: 500 })
  }
}

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