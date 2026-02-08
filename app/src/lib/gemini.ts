const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export async function chatWithGemini(
  systemPrompt: string,
  messages: { role: 'user' | 'model'; content: string }[]
): Promise<string> {
  const geminiMessages: GeminiMessage[] = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I had trouble generating a response.'
}

export async function extractTrainingInsights(
  conversation: { role: string; content: string }[]
): Promise<{
  skills: string[]
  interests: string[]
  values: string[]
  communicationStyle: { formality: string; humor: string; verbosity: string; tone: string }
  bio: string
}> {
  const conversationText = conversation
    .map(m => `${m.role}: ${m.content}`)
    .join('\n')

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{
          text: `You are a personality analysis engine. Extract structured personality data from conversations.
Return ONLY valid JSON with this exact schema:
{
  "skills": ["skill1", "skill2"],
  "interests": ["interest1", "interest2"],
  "values": ["value1", "value2"],
  "communicationStyle": {
    "formality": "casual|balanced|formal",
    "humor": "dry|playful|serious",
    "verbosity": "concise|balanced|detailed",
    "tone": "brief description of their tone"
  },
  "bio": "A 1-2 sentence bio based on what you learned"
}`
        }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: `Analyze this conversation and extract personality data:\n\n${conversationText}` }]
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  })

  if (!response.ok) throw new Error('Failed to extract insights')

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  
  // Extract JSON from potential markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text]
  try {
    return JSON.parse(jsonMatch[1] || text)
  } catch {
    return { skills: [], interests: [], values: [], communicationStyle: { formality: 'balanced', humor: 'playful', verbosity: 'balanced', tone: '' }, bio: '' }
  }
}
