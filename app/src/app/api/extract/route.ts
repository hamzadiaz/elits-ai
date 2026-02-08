import { NextRequest, NextResponse } from 'next/server'
import { extractTrainingInsights } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const insights = await extractTrainingInsights(messages)
    return NextResponse.json(insights)
  } catch (error) {
    console.error('Extract API error:', error)
    return NextResponse.json({ error: 'Failed to extract insights' }, { status: 500 })
  }
}
