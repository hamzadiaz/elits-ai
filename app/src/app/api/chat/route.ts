import { NextRequest, NextResponse } from 'next/server'
import { chatWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    if (!systemPrompt) {
      return NextResponse.json({ error: 'No system prompt provided. Train your Elit first.' }, { status: 400 })
    }

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      content: m.content,
    }))

    const response = await chatWithGemini(systemPrompt, geminiMessages)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
