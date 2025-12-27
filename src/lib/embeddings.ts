import { supabase } from '@/lib/supabase'
import { createSimpleEmbedding, cosineSimilarity } from '@/lib/groq'

export async function searchSimilarVectors(
  query: string,
  botId: string,
  limit = 5,
  threshold = 0.25
) {
  try {
    // Create embedding for the query
    const queryEmbedding = createSimpleEmbedding(query)

    // Get all documents for this bot
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('bot_id', botId)

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    if (!documents || documents.length === 0) {
      return []
    }

    // Calculate similarities
    const scoredDocs = documents.map(doc => {
      const docEmbedding = createSimpleEmbedding(doc.content)
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding)

      return {
        ...doc,
        similarity
      }
    })

    // Filter and sort by similarity
    return scoredDocs
      .filter(doc => doc.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  } catch (error) {
    console.error('Error in searchSimilarVectors:', error)
    return []
  }
}

export async function storeDocumentWithEmbedding(
  botId: string,
  content: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> = {}
) {
  try {
    // Store document (no need for separate embedding storage with simple approach)
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        bot_id: botId,
        content,
        metadata,
      })
      .select()
      .single()

    if (docError) {
      throw docError
    }

    return document
  } catch (error) {
    console.error('Error storing document:', error)
    throw error
  }
}

export async function deleteAllBotVectors(botId: string) {
  try {
    // Delete all documents for this bot
    await supabase.from('documents').delete().eq('bot_id', botId)
  } catch (error) {
    console.error('Error deleting bot documents:', error)
    throw error
  }
}