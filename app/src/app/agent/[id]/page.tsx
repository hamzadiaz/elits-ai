'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { getAgent, buyAgent, isAgentOwned, getOwnedAgents, AVATAR_STYLES, RARITY_CONFIG, type NFAAgent } from '@/lib/agents'
import { AgentAvatar } from '@/components/NFACard'
import { useToast } from '@/components/Toast'
import { Star, Users, TrendingUp, Zap, MessageSquare, ChevronLeft, DollarSign, ShieldCheck, Copy } from 'lucide-react'

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast, updateToast } = useToast()
  const [agent, setAgent] = useState<NFAAgent | null>(null)
  const [owned, setOwned] = useState(false)

  useEffect(() => {
    const a = getAgent(params.id as string)
    if (a) { setAgent(a); setOwned(isAgentOwned(a.id)) }
  }, [params.id])

  if (!agent) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Agent not found</p>
          <button onClick={() => router.push('/explore')} className="text-amber-400/60 text-sm hover:text-amber-400 transition-colors cursor-pointer">
            ← Back to marketplace
          </button>
        </div>
      </div>
    )
  }

  const style = AVATAR_STYLES[agent.avatarStyle]
  const rarity = RARITY_CONFIG[agent.rarity]
  const monthlyEstimate = (agent.perUseFee * agent.usageCount * 0.1).toFixed(1)

  const handleBuy = () => {
    const toastId = addToast({ type: 'loading', message: `Purchasing ${agent.name}...` })
    setTimeout(() => {
      const sig = buyAgent(agent.id)
      setOwned(true)
      updateToast(toastId, { type: 'success', message: `${agent.name} is yours!`, txSignature: sig })
    }, 1500)
  }

  return (
    <div className="min-h-screen px-4 pt-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.push('/explore')}
          className="flex items-center gap-1 text-[12px] text-white/30 hover:text-white/60 transition-colors mb-8 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to marketplace
        </motion.button>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02] p-8 mb-8"
          style={{ boxShadow: `0 0 80px ${style.colors[0]}10` }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(ellipse at top left, ${style.colors[0]}15, transparent 60%)` }} />
          
          <div className="relative flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <AgentAvatar agent={agent} size="lg" />
              <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${rarity.color} ${rarity.bg} border ${rarity.border}`}>
                {rarity.label}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white/90">{agent.name}</h1>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/30">
                  {agent.category}
                </span>
              </div>
              <p className="text-[13px] text-white/40 font-light leading-relaxed mb-5 max-w-xl">
                {agent.description}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: Star, label: 'Rating', value: agent.rating.toString(), color: 'text-amber-400/50' },
                  { icon: Users, label: 'Uses', value: agent.usageCount.toLocaleString(), color: 'text-white/30' },
                  { icon: TrendingUp, label: 'Revenue', value: `${agent.revenueGenerated} SOL`, color: 'text-emerald-400/50' },
                  { icon: Users, label: 'Owners', value: agent.ownerCount.toLocaleString(), color: 'text-white/30' },
                ].map(stat => (
                  <div key={stat.label} className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color} mb-1`} />
                    <div className="text-[14px] font-semibold text-white/70">{stat.value}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {owned ? (
                  <button
                    onClick={() => router.push(`/chat/${agent.id}`)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 opacity-60" />
                    Chat with {agent.name}
                  </button>
                ) : (
                  <button
                    onClick={handleBuy}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <Zap className="w-4 h-4 opacity-60" />
                    Buy for {agent.price} SOL
                  </button>
                )}
                {owned && (
                  <span className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-400/[0.06] border border-emerald-400/15 text-emerald-400/60 text-[12px] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> You own this NFA
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
          >
            <h3 className="text-[13px] font-semibold text-white/60 mb-4">Skills & Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {agent.skills.map(skill => (
                <span key={skill} className="text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Revenue Model */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
          >
            <h3 className="text-[13px] font-semibold text-white/60 mb-4">Revenue Model</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/30">Mint Price</span>
                <span className="text-[13px] font-semibold text-white/70">{agent.price} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/30">Per-Use Fee</span>
                <span className="text-[13px] font-semibold text-white/70">{agent.perUseFee} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/30">Total Revenue</span>
                <span className="text-[13px] font-semibold text-emerald-400/70">{agent.revenueGenerated} SOL</span>
              </div>
              <div className="pt-2 border-t border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/30">Est. Monthly Earnings</span>
                  <span className="text-[13px] font-bold text-amber-400/80">~{monthlyEstimate} SOL</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personality Preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:col-span-2"
          >
            <h3 className="text-[13px] font-semibold text-white/60 mb-4">Personality Preview</h3>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[12px] text-white/30 font-light leading-relaxed font-mono">
                {agent.personality.slice(0, 300)}...
              </p>
            </div>
          </motion.div>

          {/* Creator */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:col-span-2"
          >
            <h3 className="text-[13px] font-semibold text-white/60 mb-3">Creator</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                <span className="text-[11px] text-white/30">{agent.creator.charAt(0)}</span>
              </div>
              <span className="text-[12px] text-white/40 font-mono">{agent.creator}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(agent.creator); addToast({ type: 'success', message: 'Copied!' }) }}
                className="text-white/20 hover:text-white/40 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
