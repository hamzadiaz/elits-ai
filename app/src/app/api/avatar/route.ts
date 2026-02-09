import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

const AVATAR_STYLE_PROMPT = `Transform this photo into a Holographic Neural Portrait avatar with these EXACT specifications:

STYLE: Futuristic holographic AI portrait
- Translucent skin with visible flowing data streams underneath the surface
- Glowing circuit-like patterns tracing along the face, jawline, and neck
- Eyes emit a soft warm gold light, slightly luminous
- Hair transforms into flowing energy strands made of light particles
- Subtle holographic scan lines across the image

COLORS (strict palette):
- Primary: Gold (#D4A017), Amber (#FFBF00) 
- Secondary: Warm white (#FFF8E1)
- Background: Pure black (#000000)
- Accents: Soft golden glow, amber light trails

COMPOSITION:
- Centered face, portrait orientation
- Pure black background (no gradients, no scenery)
- The person should be clearly recognizable but stylized as a digital being
- Clean edges suitable for use as a profile picture
- Square aspect ratio, high detail on facial features

MOOD: Ethereal, powerful, futuristic — like a sentient AI that emerged from gold light

Output ONLY the image, no text overlay.`

// Models that support image generation output, in order of preference
const IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
]

async function tryGenerateWithModel(model: string, mimeType: string, imageData: string): Promise<{ avatarUrl: string; generated: boolean; message: string } | null> {
  console.log(`[avatar] Trying model: ${model}`)
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: imageData } },
            { text: AVATAR_STYLE_PROMPT },
          ],
        }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          temperature: 1,
        },
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    console.error(`[avatar] Model ${model} failed (${response.status}):`, errText.slice(0, 200))
    return null
  }

  const data = await response.json()
  console.log(`[avatar] Model ${model} response candidates:`, data.candidates?.length || 0)
  
  const parts = data.candidates?.[0]?.content?.parts || []
  for (const part of parts) {
    if (part.inlineData?.data) {
      console.log(`[avatar] Model ${model} returned image! MIME: ${part.inlineData.mimeType}, size: ${part.inlineData.data.length}`)
      return {
        avatarUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
        generated: true,
        message: 'AI-generated Holographic Neural Portrait',
      }
    }
  }

  console.log(`[avatar] Model ${model} returned no image data in parts:`, parts.map((p: Record<string, unknown>) => Object.keys(p)))
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json()

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Image data required' }, { status: 400 })
    }

    if (!GEMINI_API_KEY) {
      console.log('[avatar] No GEMINI_API_KEY configured')
      return NextResponse.json({
        avatarUrl: `data:${mimeType};base64,${image}`,
        generated: false,
        message: 'No API key configured. Using original photo with holographic CSS effects.',
      })
    }

    // Try each image generation model
    for (const model of IMAGE_MODELS) {
      try {
        const result = await tryGenerateWithModel(model, mimeType, image)
        if (result) {
          return NextResponse.json(result)
        }
      } catch (err) {
        console.error(`[avatar] Error with model ${model}:`, err)
        continue
      }
    }

    // All models failed — fallback to original photo
    console.log('[avatar] All image models failed, returning original photo')
    return NextResponse.json({
      avatarUrl: `data:${mimeType};base64,${image}`,
      generated: false,
      message: 'Image generation unavailable. Using original photo with holographic CSS effects.',
    })
  } catch (error) {
    console.error('[avatar] Avatar generation error:', error)
    return NextResponse.json({ error: 'Failed to generate avatar' }, { status: 500 })
  }
}
