/* eslint-disable @typescript-eslint/no-unused-vars */
import { google } from 'googleapis'

export async function connectToGoogleSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  return google.sheets({ version: 'v4', auth })
}

export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

export async function getSheetData(sheetUrl: string) {
  try {
    const spreadsheetId = extractSpreadsheetId(sheetUrl)
    if (!spreadsheetId) {
      throw new Error('Invalid Google Sheets URL')
    }

    const sheets = await connectToGoogleSheets()

    // First, get the sheet metadata to find sheet names
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const firstSheetName = metadata.data.sheets?.[0]?.properties?.title || 'Sheet1'

    // Get the data from the first sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${firstSheetName}!A:Z`, // Get all columns
    })

    const rows = response.data.values || []

    if (rows.length === 0) {
      throw new Error('No data found in the spreadsheet')
    }

    // Parse the data - assume first row is headers
    const headers = rows[0]
    const dataRows = rows.slice(1)

    // Convert to structured format
    const documents: Array<{
      question?: string
      answer?: string
      category?: string
      content: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: Record<string, any>
    }> = []

    for (const row of dataRows) {
      if (row.length === 0 || !row.some((cell: string) => cell && cell.trim())) {
        continue // Skip empty rows
      }

      const rowData: Record<string, string> = {}

      headers.forEach((header: string, index: number) => {
        if (header && row[index]) {
          rowData[header.toLowerCase().trim()] = String(row[index]).trim()
        }
      })


      // Create content based on available fields
      let content = ''
      const question = rowData.question || rowData.q || ''
      const answer = rowData.answer || rowData.a || rowData.response || ''
      const category = rowData.category || rowData.cat || ''

      if (question && answer) {
        content = `Q: ${question}\nA: ${answer}`
        if (category) {
          content += `\nCategory: ${category}`
        }
      } else {
        // If not in Q&A format, combine all fields
        content = Object.entries(rowData)
          .filter(([key, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      }

      if (content.trim()) {
        documents.push({
          question,
          answer,
          category,
          content: content.trim(),
          metadata: { ...rowData, sheetUrl, sheetName: firstSheetName }
        })
      }
    }

    return {
      documents,
      sheetName: firstSheetName,
      headers,
      totalRows: dataRows.length
    }
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    throw error
  }
}