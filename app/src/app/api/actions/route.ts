import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export type ActionType = 'post_tweet' | 'write_code' | 'respond_message' | 'research'

interface ActionRequest {
  type: ActionType
  prompt: string
  systemPrompt: string
  delegationScopes: string[]
}

const SCOPE_MAP: Record<ActionType, string> = {
  post_tweet: 'post',
  write_code: 'code',
  respond_message: 'chat',
  research: 'research',
}

const ACTION_SYSTEM_PROMPTS: Record<ActionType, string> = {
  post_tweet: `You are generating a tweet for this person. Write a single tweet (max 280 chars) in their voice, style, and personality. Return ONLY the tweet text, nothing else.`,
  write_code: `You are writing code as this person would. Match their coding style, preferred patterns, and expertise areas. Return clean, well-structured code with brief comments.`,
  respond_message: `You are drafting a message response as this person would write it. Match their communication style, tone, and personality exactly. Return ONLY the response text.`,
  research: `You are researching a topic for this person. Provide a concise, well-structured summary tailored to their interests and expertise level. Use bullet points and key findings.`,
}

export async function POST(req: NextRequest) {
  try {
    const { type, prompt, systemPrompt, delegationScopes } = (await req.json()) as ActionRequest

    // Check delegation scope
    const requiredScope = SCOPE_MAP[type]
    if (!delegationScopes.includes(requiredScope) && !delegationScopes.includes('full')) {
      return NextResponse.json({ error: `Action "${type}" requires "${requiredScope}" delegation scope` }, { status: 403 })
    }

    const fullPrompt = `${systemPrompt}\n\n${ACTION_SYSTEM_PROMPTS[type]}\n\nUser request: ${prompt}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    })

    const result = response.text || ''

    return NextResponse.json({
      id: `action-${Date.now()}`,
      type,
      prompt,
      result,
      status: 'completed',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Action error:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
