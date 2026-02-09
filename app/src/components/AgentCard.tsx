'use client'

import { motion } from 'framer-motion'
import { Avatar3D } from './Avatar3D'
import { LevelBadge } from './LevelBadge'
import { ShieldCheck, Users, Zap, ArrowRight } from 'lucide-react'

export interface AgentTemplate {
  id: string
  name: string
  bio: string
  category: string
  skills: string[]
  avatarUrl?: string
  xp: number
  uses: number
  verified: boolean
  featured?: boolean
  creator?: string
}

interface AgentCardProps {
  agent: AgentTemplate
  onUse?: (agent: AgentTemplate) => void
  delay?: number
}

export function AgentCard({ agent, onUse, delay = 0 }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`group relative beam-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:bg-white/[0.03] ${
        agent.featured ? 'beam-border-hover' : ''
      }`}
      onClick={() => onUse?.(agent)}
    >
      {agent.featured && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/[0.1] border border-amber-500/20">
          <Zap className="w-2.5 h-2.5 text-amber-400/60" />
          <span className="text-[9px] text-amber-300/60 font-medium">Featured</span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar3D avatarUrl={agent.avatarUrl} name={agent.name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-[14px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                {agent.name}
              </h3>
              {agent.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/50 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-white/30 line-clamp-1 font-light">{agent.bio}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-4">
          {agent.skills.slice(0, 4).map(skill => (
            <span key={skill} className="elite-tag text-[9px] px-2 py-0.5">
              {skill}
            </span>
          ))}
          {agent.skills.length > 4 && (
            <span className="text-[9px] text-white/20 px-1">+{agent.skills.length - 4}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LevelBadge xp={agent.xp} size="sm" />
            <div className="flex items-center gap-1 text-[10px] text-white/25">
              <Users className="w-3 h-3" />
              <span>{agent.uses.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400/40 group-hover:text-amber-400/70 transition-colors">
            Use template
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
