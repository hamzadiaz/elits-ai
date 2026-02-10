import { NextRequest } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_STREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const DEFI_AGENT_IDS = ['alpha-hunter', 'yield-oracle', 'swap-ninja', 'portfolio-prophet']

const TOOL_DECLARATIONS = [
  {
    name: 'get_token_price',
    description: 'Get the current price and market data for a cryptocurrency token. Use this when the user asks about token prices, market cap, or price changes.',
    parameters: {
      type: 'object',
      properties: {
        token_id: { type: 'string', description: 'The CoinGecko token ID (e.g., "bitcoin", "solana", "ethereum")' },
      },
      required: ['token_id'],
    },
  },
  {
    name: 'get_trending_tokens',
    description: 'Get the current trending tokens on CoinGecko. Use this when the user asks about trending coins or what\'s hot.',
    parameters: { type: 'object', properties: {} },
  },
]

async function getTokenPrice(tokenId: string) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { error: `Token "${tokenId}" not found` }
    const data = await res.json()
    return {
      name: data.name,
      symbol: data.symbol?.toUpperCase(),
      price: data.market_data?.current_price?.usd,
      price_change_24h: data.market_data?.price_change_percentage_24h,
      market_cap: data.market_data?.market_cap?.usd,
      volume_24h: data.market_data?.total_volume?.usd,
      high_24h: data.market_data?.high_24h?.usd,
      low_24h: data.market_data?.low_24h?.usd,
      ath: data.market_data?.ath?.usd,
      image: data.image?.small,
    }
  } catch {
    return { error: 'Failed to fetch price data' }
  }
}

async function getTrendingTokens() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', { next: { revalidate: 300 } })
    if (!res.ok) return { error: 'Failed to fetch trending' }
    const data = await res.json()
    return {
      tokens: data.coins?.slice(0, 7).map((c: { item: { name: string; symbol: string; market_cap_rank: number; price_btc: number; thumb: string } }) => ({
        name: c.item.name,
        symbol: c.item.symbol,
        market_cap_rank: c.item.market_cap_rank,
        price_btc: c.item.price_btc,
        image: c.item.thumb,
      })),
    }
  } catch {
    return { error: 'Failed to fetch trending' }
  }
}

async function executeTool(name: string, args: Record<string, string>) {
  switch (name) {
    case 'get_token_price': return await getTokenPrice(args.token_id)
    case 'get_trending_tokens': return await getTrendingTokens()
    default: return { error: 'Unknown tool' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, agentId } = await req.json()

    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: 'No system prompt provided.' }), { status: 400 })
    }

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const isDeFiAgent = DEFI_AGENT_IDS.includes(agentId || '')

    // For DeFi agents, first try non-streaming with function calling
    if (isDeFiAgent) {
      const fcResponse = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt + '\n\nYou have access to real-time crypto tools. Use get_token_price when users ask about specific token prices. Use get_trending_tokens when they ask what\'s trending. Always use the tools to provide real data rather than making up numbers.' }] },
          contents: geminiMessages,
          tools: [{ function_declarations: TOOL_DECLARATIONS }],
          generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 1024 },
        }),
      })

      if (fcResponse.ok) {
        const fcData = await fcResponse.json()
        const candidate = fcData.candidates?.[0]
        const parts = candidate?.content?.parts || []

        // Check if model wants to call a function
        const functionCall = parts.find((p: { functionCall?: unknown }) => p.functionCall)
        if (functionCall?.functionCall) {
          const { name, args } = functionCall.functionCall
          const toolResult = await executeTool(name, args || {})

          // Send tool result back to model for final response
          const followUp = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt + '\n\nFormat crypto data clearly. Use the data provided by the tool. Be concise and actionable.' }] },
              contents: [
                ...geminiMessages,
                { role: 'model', parts: [{ functionCall: { name, args } }] },
                { role: 'user', parts: [{ functionResponse: { name, response: toolResult } }] },
              ],
              tools: [{ function_declarations: TOOL_DECLARATIONS }],
              generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 1024 },
            }),
          })

          if (followUp.ok) {
            const followUpData = await followUp.json()
            const text = followUpData.candidates?.[0]?.content?.parts?.[0]?.text || ''
            // Return as SSE stream (single chunk + tool data)
            const encoder = new TextEncoder()
            const stream = new ReadableStream({
              start(controller) {
                // Send tool data first as a special event
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ toolCall: { name, args, result: toolResult } })}\n\n`))
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
              },
            })
            return new Response(stream, {
              headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
            })
          }
        }

        // No function call — just text. Return as stream format
        const text = parts.find((p: { text?: string }) => p.text)?.text || ''
        if (text) {
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            },
          })
          return new Response(stream, {
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
          })
        }
      }
    }

    // Standard streaming for non-DeFi agents (or fallback)
    const response = await fetch(`${GEMINI_STREAM_URL}?alt=sse&key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 1024 },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', response.status, error)
      return new Response(JSON.stringify({ error: 'Failed to generate response' }), { status: 500 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim()
                if (!jsonStr) continue
                try {
                  const data = JSON.parse(jsonStr)
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                  }
                } catch { /* skip */ }
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err)
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), { status: 500 })
  }
}
