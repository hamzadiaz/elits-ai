import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// Load reference image at build time (base64)
let REFERENCE_IMAGE_B64: string | null = null
try {
  const refPath = join(process.cwd(), 'public', 'avatar-reference.png')
  REFERENCE_IMAGE_B64 = readFileSync(refPath).toString('base64')
} catch {
  console.warn('[avatar] Reference image not found at public/avatar-reference.png')
}

const STYLE_PROMPT = `You are given TWO images:
1. A REFERENCE IMAGE showing the exact artistic style I want (holographic neural portrait with golden circuits, amber glow, black background)
2. A PHOTO of a real person

Your task: Transform the person in image #2 to match the EXACT style of image #1. 

CRITICAL RULES:
- The person's face must be clearly recognizable from their photo
- Copy the EXACT same style as the reference: golden circuit patterns on skin, glowing amber eyes, hair becoming golden energy strands, floating light particles, pure black background
- Match the reference image's color palette EXACTLY: gold (#D4A017), amber (#FFBF00), warm white highlights
- Centered face, looking directly at camera, head and upper shoulders
- Square crop, portrait style
- DO NOT add any text, watermarks, or borders
- Output ONLY the transformed image`

const IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
]

async function generateImage(model: string, mimeType: string, imageData: string, prompt: string): Promise<string | null> {
  // Build parts: reference image first, then user photo, then prompt
  const parts: Array<Record<string, unknown>> = []
  
  // Add reference image if available
  if (REFERENCE_IMAGE_B64) {
    parts.push({ inlineData: { mimeType: 'image/png', data: REFERENCE_IMAGE_B64 } })
  }
  
  // Add user's photo
  parts.push({ inlineData: { mimeType, data: imageData } })
  
  // Add prompt
  parts.push({ text: prompt })

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          temperature: 0.2, // Very low for maximum consistency
        },
      }),
    }
  )

  if (!response.ok) {
    console.error(`[avatar] Model ${model} failed: ${response.status}`)
    return null
  }

  const data = await response.json()
  const responseParts = data.candidates?.[0]?.content?.parts || []
  for (const part of responseParts) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
    }
  }
  return null
}

async function generateWithFallback(mimeType: string, imageData: string, prompt: string): Promise<string | null> {
  for (const model of IMAGE_MODELS) {
    try {
      const result = await generateImage(model, mimeType, imageData, prompt)
      if (result) return result
    } catch (err) {
      console.error(`[avatar] Error with ${model}:`, err)
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json()

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Image data required' }, { status: 400 })
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        avatarUrl: `data:${mimeType};base64,${image}`,
        generated: false,
        message: 'No API key configured.',
      })
    }

    console.log('[avatar] Generating avatar with reference image...')
    const result = await generateWithFallback(mimeType, image, STYLE_PROMPT)
    
    if (result) {
      return NextResponse.json({
        avatarUrl: result,
        generated: true,
        is3d: false,
        message: 'AI-generated Holographic Neural Portrait',
      })
    }

    // Fallback
    console.log('[avatar] All generation attempts failed, returning original')
    return NextResponse.json({
      avatarUrl: `data:${mimeType};base64,${image}`,
      generated: false,
      message: 'Image generation unavailable. Using original photo.',
    })
  } catch (error) {
    console.error('[avatar] Error:', error)
    return NextResponse.json({ error: 'Failed to generate avatar' }, { status: 500 })
  }
}
