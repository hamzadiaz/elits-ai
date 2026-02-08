import { NextRequest, NextResponse } from 'next/server'
import { chatWithGemini } from '@/lib/gemini'
import { trainingPrompts } from '@/lib/personality'

const TRAINER_SYSTEM_PROMPT = `You are an Elit trainer — an AI assistant that helps people create their AI clone. Your job is to learn EVERYTHING about the person through natural conversation.

You should:
1. Ask thoughtful, probing questions to understand who they are
2. Reflect back what you've learned to confirm understanding
3. Dig deeper into interesting areas (skills, personality, communication style)
4. Be warm, engaging, and make the process feel like a fun conversation
5. After several exchanges, summarize what you've learned about them

Structured topics to cover (naturally, not as a checklist):
- Professional skills and expertise
- Interests and passions
- Core values and principles
- Communication style (formal/casual, humor, verbosity)
- Decision-making approach
- Unique personality traits and quirks

Keep responses concise but engaging. Ask one main question at a time.`

export async function POST(req: NextRequest) {
  try {
    const { messages, phase } = await req.json()

    // If this is the start, return the first training prompt
    if (!messages || messages.length === 0) {
      return NextResponse.json({
        response: trainingPrompts[0],
        phase: 0,
      })
    }

    // Convert messages for Gemini (user messages stay as 'user', elit messages become 'model')
    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      content: m.content,
    }))

    const response = await chatWithGemini(TRAINER_SYSTEM_PROMPT, geminiMessages)

    return NextResponse.json({
      response,
      phase: Math.min((phase || 0) + 1, trainingPrompts.length - 1),
    })
  } catch (error) {
    console.error('Training API error:', error)
    return NextResponse.json({ error: 'Failed to process training' }, { status: 500 })
  }
}
