import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// Load reference image lazily (works on Vercel serverless)
let _refCache: string | null | undefined = undefined
function getRefImage(): string | null {
  if (_refCache !== undefined) return _refCache
  try {
    const refPath = join(process.cwd(), 'public', 'avatar-reference.png')
    _refCache = readFileSync(refPath).toString('base64')
    console.log('[avatar] Reference image loaded:', _refCache.length, 'bytes b64')
  } catch (e) {
    console.warn('[avatar] Reference image not found:', e)
    _refCache = null
  }
  return _refCache
}

const STYLE_PROMPT = `I'm giving you two images. The FIRST image is the STYLE REFERENCE — you must replicate its exact visual style. The SECOND image is a photo of a person whose face you must use.

CREATE a new portrait that:
1. Uses the EXACT face/features from the person's photo (image #2)
2. Applies the IDENTICAL artistic style from the reference (image #1):
   - Pure black background (#000000), no gradients
   - Golden holographic circuit board patterns overlaid on the skin (thin gold lines forming circuit/PCB traces across forehead, cheeks, jaw, neck)
   - Warm golden-amber glow emanating from the face and hair
   - Hair transformed into flowing golden energy/light strands
   - Eyes glowing amber/gold
   - Tiny floating golden light particles and sparks around the head
   - Horizontal digital scan lines/glitch streaks in the golden glow
   - Neck and upper chest showing circuit traces fading into darkness
   - Overall color palette: ONLY gold (#D4A017), amber (#FFBF00), warm white, on pure black
   - Centered symmetrical composition, face looking straight ahead
   - Square format, head and upper shoulders only

CRITICAL: The output must look like it belongs in the SAME series as the reference image. Same lighting. Same circuit pattern density. Same glow intensity. Same black background. Same color temperature. An observer should think both images were made by the same artist in the same session.

DO NOT add text, watermarks, borders, or any elements not present in the reference.`

const IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
]

async function generateImage(model: string, mimeType: string, imageData: string, prompt: string): Promise<string | null> {
  // Build parts: reference image first, then user photo, then prompt
  const parts: Array<Record<string, unknown>> = []
  
  // Add reference image if available
  const refB64 = getRefImage()
  if (refB64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: refB64 } })
  } else {
    console.warn('[avatar] No reference image available — output may not match style')
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
