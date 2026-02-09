'use client'

import { motion } from 'framer-motion'
import { getLevel, getTier, getXPForNextLevel } from '@/lib/xp'
import { Zap } from 'lucide-react'

interface XPBarProps {
  xp: number
  compact?: boolean
  showLevel?: boolean
}

export function XPBar({ xp, compact = false, showLevel = true }: XPBarProps) {
  const level = getLevel(xp)
  const tier = getTier(xp)
  const { current, required, progress } = getXPForNextLevel(xp)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" style={{ color: tier.color }} />
          <span className="text-[10px] font-semibold" style={{ color: tier.color }}>Lv.{level}</span>
        </div>
        <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden min-w-[40px]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showLevel && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
              style={{
                background: `${tier.color}15`,
                border: `1px solid ${tier.color}30`,
                color: tier.color,
              }}
            >
              <Zap className="w-3 h-3" />
              Level {level} · {tier.name}
            </div>
          )}
        </div>
        <span className="text-[10px] text-white/30 font-mono">
          {xp.toLocaleString()} XP
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`,
            boxShadow: `0 0 12px ${tier.color}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-white/20">
        <span>{current} / {required === Infinity ? '∞' : required} XP to next level</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
    </div>
  )
}
