import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// Locked-down style prompt for maximum consistency
const BASE_STYLE = `Transform this photo into a Holographic Neural Portrait. Follow these EXACT rules with NO deviation:

MANDATORY STYLE:
- The person's face must be clearly recognizable
- Translucent golden circuit-board patterns overlay the skin, tracing along cheekbones, jawline, forehead, and neck
- Data stream lines flow vertically and horizontally across the face with a subtle glow
- Eyes glow with warm amber/gold light
- Hair transforms into flowing golden energy strands made of light particles
- Horizontal holographic scan lines across the image (subtle, not overpowering)
- Small floating light particles scattered around the head and shoulders

MANDATORY COLORS:
- Primary glow: Gold (#D4A017) and Amber (#FFBF00)
- Secondary: Warm white highlights (#FFF8E1)
- Background: PURE BLACK (#000000) — absolutely no gradients or scenery
- All circuit patterns and data streams in gold/amber tones

MANDATORY COMPOSITION:
- Centered face, looking DIRECTLY at camera (front-facing)
- Head and upper shoulders visible
- Pure black background with NO elements behind the person
- Square crop, portrait style
- The person should look powerful, ethereal, futuristic
- High detail on facial features — this is a premium AI portrait

DO NOT: Add any text, watermarks, logos, borders, or frames. Output ONLY the transformed image.`

const ANGLE_PROMPTS: Record<string, string> = {
  front: BASE_STYLE,
  left: BASE_STYLE.replace(
    'looking DIRECTLY at camera (front-facing)',
    'face turned approximately 25 degrees to THEIR LEFT (camera right), eyes looking toward camera'
  ),
  right: BASE_STYLE.replace(
    'looking DIRECTLY at camera (front-facing)',
    'face turned approximately 25 degrees to THEIR RIGHT (camera left), eyes looking toward camera'
  ),
}

const IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
]

async function generateImage(model: string, mimeType: string, imageData: string, prompt: string): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: imageData } },
            { text: prompt },
          ],
        }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          temperature: 0.4, // Lower temperature = more consistent
        },
      }),
    }
  )

  if (!response.ok) {
    console.error(`[avatar] Model ${model} failed: ${response.status}`)
    return null
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts || []
  for (const part of parts) {
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
    const { image, mimeType, mode } = await req.json()

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

    // Mode: 'single' (default) or '3d' (generates 3 angles)
    if (mode === '3d') {
      console.log('[avatar] Generating 3D avatar (3 angles)...')
      
      // Generate all 3 angles in parallel
      const [front, left, right] = await Promise.all([
        generateWithFallback(mimeType, image, ANGLE_PROMPTS.front),
        generateWithFallback(mimeType, image, ANGLE_PROMPTS.left),
        generateWithFallback(mimeType, image, ANGLE_PROMPTS.right),
      ])

      if (front) {
        return NextResponse.json({
          avatarUrl: front,
          avatarAngles: {
            front: front,
            left: left || front, // fallback to front if angle fails
            right: right || front,
          },
          generated: true,
          is3d: true,
          message: 'AI-generated 3D Holographic Neural Portrait',
        })
      }
    } else {
      // Single image generation (default)
      console.log('[avatar] Generating single avatar...')
      const result = await generateWithFallback(mimeType, image, ANGLE_PROMPTS.front)
      
      if (result) {
        return NextResponse.json({
          avatarUrl: result,
          generated: true,
          is3d: false,
          message: 'AI-generated Holographic Neural Portrait',
        })
      }
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
