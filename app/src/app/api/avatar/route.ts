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
        message: 'No API key configured. Using original photo with holographic CSS effects.',
      })
    }

    // Try Gemini 2.0 Flash for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: image } },
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
      console.error('Gemini avatar generation failed:', errText)
      
      // Try with gemini-2.0-flash as fallback
      const fallbackResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType, data: image } },
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

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json()
        const parts = data.candidates?.[0]?.content?.parts || []
        for (const part of parts) {
          if (part.inlineData?.data) {
            return NextResponse.json({
              avatarUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
              generated: true,
              message: 'AI-generated Holographic Neural Portrait',
            })
          }
        }
      }

      return NextResponse.json({
        avatarUrl: `data:${mimeType};base64,${image}`,
        generated: false,
        message: 'Using original photo with holographic CSS effects',
      })
    }

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      if (part.inlineData?.data) {
        return NextResponse.json({
          avatarUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
          generated: true,
          message: 'AI-generated Holographic Neural Portrait',
        })
      }
    }

    return NextResponse.json({
      avatarUrl: `data:${mimeType};base64,${image}`,
      generated: false,
      message: 'Using original photo with holographic CSS effects',
    })
  } catch (error) {
    console.error('Avatar generation error:', error)
    return NextResponse.json({ error: 'Failed to generate avatar' }, { status: 500 })
  }
}
