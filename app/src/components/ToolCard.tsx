'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Flame, DollarSign } from 'lucide-react'

interface TokenPriceData {
  name: string
  symbol: string
  price: number
  price_change_24h: number
  market_cap: number
  volume_24h: number
  high_24h: number
  low_24h: number
  image?: string
}

interface TrendingData {
  tokens: { name: string; symbol: string; market_cap_rank: number; image?: string }[]
}

function formatNum(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

export function TokenPriceCard({ data }: { data: TokenPriceData }) {
  const isPositive = data.price_change_24h >= 0
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 my-2 max-w-sm">
      <div className="flex items-center gap-3 mb-3">
        {data.image && <img src={data.image} alt={data.symbol} className="w-8 h-8 rounded-full" />}
        <div>
          <h4 className="text-[13px] font-semibold text-white/80">{data.name}</h4>
          <span className="text-[10px] text-white/30">{data.symbol}</span>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[15px] font-bold text-white/80">${data.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
          <div className={`flex items-center gap-0.5 text-[11px] ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {data.price_change_24h?.toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-lg bg-white/[0.02] p-2">
          <span className="text-white/20">Market Cap</span>
          <p className="text-white/50 font-medium">{formatNum(data.market_cap)}</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] p-2">
          <span className="text-white/20">24h Volume</span>
          <p className="text-white/50 font-medium">{formatNum(data.volume_24h)}</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] p-2">
          <span className="text-white/20">24h High</span>
          <p className="text-white/50 font-medium">${data.high_24h?.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] p-2">
          <span className="text-white/20">24h Low</span>
          <p className="text-white/50 font-medium">${data.low_24h?.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function TrendingCard({ data }: { data: TrendingData }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 my-2 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-amber-400/60" />
        <h4 className="text-[12px] font-semibold text-white/60">Trending Tokens</h4>
      </div>
      <div className="space-y-2">
        {data.tokens?.map((token, i) => (
          <div key={i} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
            <span className="text-[10px] text-white/20 w-4 text-center">{i + 1}</span>
            {token.image && <img src={token.image} alt={token.symbol} className="w-5 h-5 rounded-full" />}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/60 font-medium truncate">{token.name}</p>
              <p className="text-[9px] text-white/25">{token.symbol}</p>
            </div>
            {token.market_cap_rank && (
              <span className="text-[9px] text-white/20 px-1.5 py-0.5 rounded bg-white/[0.03]">#{token.market_cap_rank}</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function ToolCallCard({ toolCall }: { toolCall: { name: string; result: Record<string, unknown> } }) {
  if (toolCall.result?.error) {
    return (
      <div className="rounded-lg bg-red-500/[0.05] border border-red-500/10 p-3 my-2 text-[11px] text-red-400/60">
        ⚠️ {String(toolCall.result.error)}
      </div>
    )
  }

  if (toolCall.name === 'get_token_price') {
    return <TokenPriceCard data={toolCall.result as unknown as TokenPriceData} />
  }

  if (toolCall.name === 'get_trending_tokens') {
    return <TrendingCard data={toolCall.result as unknown as TrendingData} />
  }

  return null
}
