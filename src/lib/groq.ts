import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Available Groq models with fallbacks
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',      // Primary model
  'llama-3.1-70b-versatile',      // Fallback 1
  'llama-3.1-8b-instant',         // Fallback 2 (faster, smaller)
  'mixtral-8x7b-32768',           // Fallback 3
]

// Generate chat response using Groq with retry logic
export async function generateGroqChatResponse(
  messages: ChatMessage[],
  stream: boolean = false,
  retryCount: number = 0
) {
  try {
    // Select model (try fallbacks if retrying)
    const model = GROQ_MODELS[Math.min(retryCount, GROQ_MODELS.length - 1)]
    
    console.log(`🤖 Using Groq model: ${model} (attempt ${retryCount + 1})`)

    const response = await groq.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      stream: stream,
    })

    return response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Error generating Groq chat response:', {
      message: error.message,
      status: error.status,
      retryCount,
    })

    // Check if we should retry
    if (retryCount < GROQ_MODELS.length - 1) {
      // Retry with next model after a short delay
      console.log(`🔄 Retrying with fallback model...`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
      return generateGroqChatResponse(messages, stream, retryCount + 1)
    }

    // If all retries failed, throw a user-friendly error
    throw new Error(
      'AI service is temporarily unavailable. Please try again in a moment.'
    )
  }
}

// Generate chat response with timeout
export async function generateGroqChatResponseWithTimeout(
  messages: ChatMessage[],
  stream: boolean = false,
  timeoutMs: number = 30000 // 30 seconds
) {
  return Promise.race([
    generateGroqChatResponse(messages, stream),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Request timeout. Please try again.')),
        timeoutMs
      )
    ),
  ])
}

// Create simple embeddings from text (without external API)
export function createSimpleEmbedding(text: string): number[] {
  // Simple word-based embedding (not as good as OpenAI but free and works)
  const words = text.toLowerCase().split(/\s+/)
  const embedding = new Array(384).fill(0) // Standard embedding size
  
  words.forEach((word, index) => {
    // Simple hash function to convert word to vector
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i)
      hash = hash & hash
    }
    
    const position = Math.abs(hash) % embedding.length
    embedding[position] += 1 / (index + 1) // Weight by position
  })
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0)
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    magnitudeA += a[i] * a[i]
    magnitudeB += b[i] * b[i]
  }
  
  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0
  
  return dotProduct / (magnitudeA * magnitudeB)
}

// Check if Groq API is configured
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0
}

// Get API health status
export async function checkGroqHealth(): Promise<boolean> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 10,
    })
    return true
  } catch (error) {
    console.error('Groq health check failed:', error)
    return false
  }
}