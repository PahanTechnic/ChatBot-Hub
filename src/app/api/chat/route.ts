/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

// Extract spreadsheet ID from URL
function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

// Fetch Google Sheet data directly (NOT saving to DB)
async function fetchGoogleSheetData(sheetUrl: string) {
  try {
    const spreadsheetId = extractSpreadsheetId(sheetUrl)
    if (!spreadsheetId) throw new Error('Invalid Google Sheets URL')

    const exportUrls = [
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`,
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1`,
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`
    ]

    let response: Response | null = null
    let lastError = ''

    for (const csvUrl of exportUrls) {
      try {
        response = await fetch(csvUrl, { 
          cache: 'no-store',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        
        if (response.ok) break
        lastError = `Status ${response.status}`
        response = null
      } catch (err: any) {
        lastError = err.message
        response = null
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Failed to fetch sheet: ${lastError}`)
    }

    const csvText = await response.text()
    if (!csvText || csvText.trim().length === 0) return null

    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return null

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows: string[][] = []

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

      if (values.some(val => val && val.trim())) {
        rows.push(values)
      }
    }

    return { headers, rows }
  } catch (error) {
    console.error('Error fetching Google Sheet:', error)
    return null
  }
}

// Fetch knowledge base from database (CSV uploaded data)
async function fetchKnowledgeBase(botId: string) {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('question, answer, category')
      .eq('bot_id', botId)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching knowledge base:', error)
      return null
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchKnowledgeBase:', error)
    return null
  }
}

// Format knowledge base data for AI context
function formatKnowledgeBaseForAI(knowledgeData: any[]): string {
  if (!knowledgeData || knowledgeData.length === 0) return ''

  let formatted = '=== KNOWLEDGE BASE (CSV DATA) ===\n\n'
  
  knowledgeData.forEach((item, idx) => {
    formatted += `Entry ${idx + 1}:\n`
    formatted += `  Question: ${item.question}\n`
    formatted += `  Answer: ${item.answer}\n`
    if (item.category) {
      formatted += `  Category: ${item.category}\n`
    }
    formatted += '\n'
  })
  
  formatted += '=== END OF KNOWLEDGE BASE ===\n\n'
  return formatted
}

// Format Google Sheet data for AI context
function formatSheetDataForAI(headers: string[], rows: string[][]): string {
  let formattedData = '=== GOOGLE SHEETS DATA ===\n\n'
  
  rows.forEach((row, idx) => {
    formattedData += `Row ${idx + 1}:\n`
    headers.forEach((header, colIdx) => {
      if (row[colIdx] && row[colIdx].trim()) {
        formattedData += `  ${header}: ${row[colIdx]}\n`
      }
    })
    formattedData += '\n'
  })
  
  formattedData += '=== END OF SHEETS DATA ===\n\n'
  return formattedData
}

// Generate AI response
async function generateAIResponse(
  userMessage: string,
  knowledgeData: any[] | null,
  sheetData: { headers: string[], rows: string[][] } | null,
  botName: string,
  customSystemPrompt: string | null,
  conversationHistory: any[]
): Promise<string> {
  try {
    const isSinhala = /[\u0D80-\u0DFF]/.test(userMessage)
    
    let systemPrompt = ''
    
    // Use custom system prompt if available
    if (customSystemPrompt && customSystemPrompt.trim()) {
      systemPrompt = customSystemPrompt.trim() + '\n\n'
    } else {
      const defaultPrompt = isSinhala
        ? `ඔබ ${botName} නමින් හැඳින්වෙන උපකාරී AI assistant කෙනෙක්. ඔබ හැමවිටම ආචාරශීලී සහ උදව්කාරී විය යුතුය.`
        : `You are ${botName}, a helpful and friendly AI assistant. Always be polite and provide accurate information based on the available data.`
      
      systemPrompt = defaultPrompt + '\n\n'
    }

    let hasData = false

    // Priority 1: Google Sheets data (direct read)
    if (sheetData && sheetData.rows.length > 0) {
      console.log('✅ Using Google Sheets Data (Direct Read):', sheetData.rows.length, 'rows')
      systemPrompt += formatSheetDataForAI(sheetData.headers, sheetData.rows)
      hasData = true
    }
    // Priority 2: Knowledge base data (from CSV upload)
    else if (knowledgeData && knowledgeData.length > 0) {
      console.log('✅ Using Knowledge Base Data (CSV Upload):', knowledgeData.length, 'entries')
      systemPrompt += formatKnowledgeBaseForAI(knowledgeData)
      hasData = true
    }

    // Add instruction to use the data
    if (hasData) {
      const dataInstruction = isSinhala
        ? '\nවැදගත්: ඉහත දත්ත භාවිතා කර පරිශීලකයාගේ ප්‍රශ්නයට නිවැරදිව පිළිතුරු දෙන්න. දත්තවල නැති දෙයක් ගැන අසන්නේ නම්, ඔබට නොදන්නා බව කියන්න.\n'
        : '\nIMPORTANT: Use the data provided above to answer user questions accurately. If asked about something not in the data, politely say you don\'t have that information. Match the language the user uses.\n'
      
      systemPrompt += dataInstruction
    } else {
      console.log('⚠️ No data source available - using general AI knowledge')
    }

    // Build messages array with conversation history
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history (last 6 messages)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6)
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage })

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 0.8,
    })

    const aiResponse = completion.choices[0]?.message?.content || (isSinhala 
      ? 'සමාවෙන්න, මට දැන් පිළිතුරු දිය නොහැක.'
      : 'Sorry, I cannot answer right now.')

    return aiResponse
  } catch (error) {
    console.error('Groq API Error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, botId, sessionId } = await request.json()

    if (!message || !botId) {
      return NextResponse.json(
        { error: 'Message and botId are required' },
        { status: 400 }
      )
    }

    const isSinhala = /[\u0D80-\u0DFF]/.test(message)

    // Get bot details
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .eq('is_active', true)
      .single()

    if (botError || !bot) {
      return NextResponse.json(
        { error: 'Bot not found or inactive' },
        { status: 404 }
      )
    }

    const currentSessionId = sessionId || uuidv4()

    // Get conversation history
    const { data: historyMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('bot_id', botId)
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(10)

    const conversationHistory = historyMessages || []

    // Save user message
    await supabase.from('messages').insert({
      bot_id: botId,
      session_id: currentSessionId,
      role: 'user',
      content: message,
    })

    let sheetData: { headers: string[], rows: string[][] } | null = null
    let knowledgeData: any[] | null = null
    let dataSource = 'none'

    // Priority 1: If Google Sheet URL exists, fetch directly (don't save to DB)
    if (bot.sheet_url) {
      console.log('📊 Fetching Google Sheets data directly...')
      sheetData = await fetchGoogleSheetData(bot.sheet_url)
      if (sheetData && sheetData.rows.length > 0) {
        dataSource = 'google_sheets'
        console.log('✅ Google Sheets data loaded:', sheetData.rows.length, 'rows')
      }
    }
    
    // Priority 2: If no sheet URL or sheet fetch failed, use knowledge_base (CSV data)
    if (!sheetData || sheetData.rows.length === 0) {
      console.log('📚 Fetching Knowledge Base data (CSV)...')
      knowledgeData = await fetchKnowledgeBase(botId)
      if (knowledgeData && knowledgeData.length > 0) {
        dataSource = 'knowledge_base'
        console.log('✅ Knowledge Base data loaded:', knowledgeData.length, 'entries')
      }
    }

    let response = ''

    // Generate AI response
    try {
      response = await generateAIResponse(
        message,
        knowledgeData,
        sheetData,
        bot.name,
        bot.system_prompt || null,
        conversationHistory
      )
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      
      response = isSinhala
        ? 'සමාවෙන්න, මට දැන් ඔබේ ප්‍රශ්නයට පිළිතුරු දිය නොහැක. කරුණාකර නැවත උත්සාහ කරන්න.'
        : 'Sorry, I cannot answer your question right now. Please try again.'
    }

    // Ensure valid response
    if (!response || response.trim() === '') {
      response = isSinhala
        ? 'සමාවෙන්න, මට දැන් පිළිතුරු දිය නොහැක.'
        : 'Sorry, I cannot answer right now.'
    }

    // Save bot response
    await supabase.from('messages').insert({
      bot_id: botId,
      session_id: currentSessionId,
      role: 'assistant',
      content: response,
      sources: {
        data_source: dataSource,
        count: dataSource === 'google_sheets' 
          ? sheetData?.rows?.length || 0 
          : knowledgeData?.length || 0
      },
    })

    return NextResponse.json({
      response,
      dataSource,
      sessionId: currentSessionId
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}