import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json()

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Image data required' }, { status: 400 })
    }

    // Use Gemini to generate a stylized avatar description, then create a visual
    // Since Gemini image generation may not be available, we'll use Gemini to analyze
    // the photo and generate a styled avatar using Imagen or fallback to a description
    
    // Try Gemini 2.0 Flash for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: image,
                },
              },
              {
                text: `Generate a futuristic, holographic 3D avatar version of the person in this photo. 
Style: Cyberpunk/futuristic, glowing neon edges, translucent holographic effect, dark background with subtle purple and blue glow.
The avatar should look like a high-tech AI representation of this person.
Make it stylized but recognizable - keep their key facial features.
Output ONLY the image, no text.`,
              },
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
      
      // Fallback: return the original image with metadata for CSS styling
      return NextResponse.json({
        avatarUrl: `data:${mimeType};base64,${image}`,
        generated: false,
        message: 'Using original photo with holographic CSS effects',
      })
    }

    const data = await response.json()
    
    // Check if we got an image back
    const parts = data.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      if (part.inlineData?.data) {
        const avatarMime = part.inlineData.mimeType || 'image/png'
        return NextResponse.json({
          avatarUrl: `data:${avatarMime};base64,${part.inlineData.data}`,
          generated: true,
          message: 'AI-generated holographic avatar',
        })
      }
    }

    // No image in response, fallback
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
