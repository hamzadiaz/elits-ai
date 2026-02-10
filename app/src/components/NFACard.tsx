'use client'

import { motion } from 'framer-motion'
import { Star, Users, Zap, TrendingUp } from 'lucide-react'
import { type NFAAgent, AVATAR_STYLES, RARITY_CONFIG } from '@/lib/agents'
import Link from 'next/link'
import Image from 'next/image'

interface NFACardProps {
  agent: NFAAgent
  delay?: number
  onBuy?: (agent: NFAAgent) => void
  owned?: boolean
}

function AgentAvatar({ agent, size = 'sm' }: { agent: NFAAgent; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const style = AVATAR_STYLES[agent.avatarStyle]
  const dims = size === 'lg' ? 'w-32 h-32' : size === 'md' ? 'w-20 h-20' : size === 'xs' ? 'w-8 h-8' : 'w-14 h-14'
  const imgSize = size === 'lg' ? 128 : size === 'md' ? 80 : size === 'xs' ? 32 : 56

  return (
    <div className={`relative ${dims} rounded-full overflow-hidden border-2 ${style.borderGlow}`}
      style={{ borderColor: style.colors[0] + '40' }}>
      <Image
        src={`/avatars/${agent.id}.png`}
        alt={agent.name}
        width={imgSize}
        height={imgSize}
        className="w-full h-full object-cover"
      />
      {/* Holographic shimmer */}
      <div className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${style.colors[0]}33 0%, transparent 50%, ${style.colors[1]}33 100%)`,
        }} />
    </div>
  )
}

export { AgentAvatar }

export function NFACard({ agent, delay = 0, onBuy, owned }: NFACardProps) {
  const style = AVATAR_STYLES[agent.avatarStyle]
  const rarity = RARITY_CONFIG[agent.rarity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:bg-white/[0.03] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1]"
      style={{
        boxShadow: `0 0 0px ${style.colors[0]}00`,
      }}
      whileHover={{
        boxShadow: `0 0 40px ${style.colors[0]}15`,
      }}
    >
      <Link href={`/agent/${agent.id}`} className="block p-5">
        {/* Rarity badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${rarity.color} ${rarity.bg} border ${rarity.border}`}>
            {rarity.label}
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <AgentAvatar agent={agent} />
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">
              {agent.name}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/30">
              {agent.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-white/30 line-clamp-2 font-light mb-3 leading-relaxed">{agent.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-4">
          {agent.skills.slice(0, 3).map(skill => (
            <span key={skill} className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/25">
              {skill}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="text-[9px] text-white/20 px-1">+{agent.skills.length - 3}</span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3 text-[10px] text-white/25">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400/50" fill="rgba(251,191,36,0.3)" />
            <span>{agent.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{agent.usageCount.toLocaleString()} uses</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400/50" />
            <span>{agent.revenueGenerated.toFixed(1)} SOL</span>
          </div>
        </div>

        {/* Price & action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div>
            <span className="text-[15px] font-bold text-white/80">{agent.price} SOL</span>
            <span className="text-[9px] text-white/20 ml-2">{agent.perUseFee} SOL/use</span>
          </div>
          {owned ? (
            <span className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-400/[0.08] border border-emerald-400/15 text-emerald-400/60 font-medium">
              Owned
            </span>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBuy?.(agent) }}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600/80 to-amber-500/80 text-white/90 font-medium hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Buy Now
            </button>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
